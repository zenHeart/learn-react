import test from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createTicketService } from './service.mjs'
import { createTicketServer } from './server.mjs'
const input = { title: '处理合成测试工单', priority: 'normal' }

test('lost response retries return the original ticket without duplicate creation', () => {
  const service = createTicketService()
  const first = service.create(input, 'request-1') // Response is deliberately discarded.
  assert.deepEqual(service.create(input, 'request-1'), { ticket: first.ticket, replayed: true })
  assert.equal(service.list().length, 1)
  assert.throws(() => service.create({ ...input, title: 'different' }, 'request-1'), { status: 409 })
})
test('validation failure does not consume an idempotency key', () => {
  const service = createTicketService()
  for (const invalid of [null, { ...input, title: ' ' }, { ...input, priority: 'invalid' }, { ...input, title: 'x'.repeat(81) }]) {
    assert.throws(() => service.create(invalid, 'one'), { status: 422 })
  }
  assert.equal(service.create(input, 'one').replayed, false)
})
test('stale writer cannot erase a concurrent change; refresh enables explicit retry', () => {
  const service = createTicketService()
  const { ticket } = service.create(input, 'one')
  service.transition(ticket.id, 'done', 1)
  assert.throws(() => service.transition(ticket.id, 'open', 1), { status: 409 })
  assert.equal(service.list()[0].status, 'done')
  assert.equal(service.transition(ticket.id, 'open', service.list()[0].version).version, 3)
  const external = service.list(); external[0].status = 'done'
  assert.equal(service.list()[0].status, 'open')
})
test('real HTTP boundary enforces validation, idempotency and version conflicts', async t => {
  const server = createTicketServer().listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(() => new Promise(resolve => server.close(resolve)))
  const url = `http://127.0.0.1:${server.address().port}/tickets`
  const post = body => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': 'http-1' }, body: JSON.stringify(body) })
  assert.equal((await post(null)).status, 422)
  const first = await post(input); assert.equal(first.status, 201)
  const { ticket } = await first.json()
  assert.equal((await post(input)).status, 200)
  const update = () => fetch(`${url}/${ticket.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'done', expectedVersion: 1 }) })
  assert.equal((await update()).status, 200)
  assert.equal((await update()).status, 409)
  assert.equal((await (await fetch(url)).json()).length, 1)
  assert.equal((await fetch(url, { method: 'POST', body: '{broken' })).status, 400)
})
