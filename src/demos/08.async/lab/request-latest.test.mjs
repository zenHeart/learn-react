import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequestRunner, createDemoTransport } from './request-latest.mjs'

function deferredTransport() {
  const calls = []
  return { calls, transport(request, { signal }) {
    return new Promise((resolve, reject) => calls.push({ request, signal, resolve, reject }))
  } }
}
const spec = id => ({ id, delay: 0 })
const result = id => ({ id, message: `result ${id}` })

test('unsafe example actually reproduces old success overwriting the latest choice', async () => {
  const api = deferredTransport()
  const runner = createRequestRunner({ transport: api.transport, onChange() {}, protectLatest: false })
  const old = runner.start(spec(1)), latest = runner.start(spec(2))
  api.calls[1].resolve(result(2)); await latest
  api.calls[0].resolve(result(1)); await old
  assert.equal(runner.getSnapshot().requestId, 1)
  runner.dispose()
})

test('latest result survives an older success even if transport ignores abort', async () => {
  const api = deferredTransport(), changes = []
  const runner = createRequestRunner({ transport: api.transport, onChange: s => changes.push(s) })
  const old = runner.start(spec(1)), latest = runner.start(spec(2))
  assert.equal(api.calls[0].signal.aborted, true)
  api.calls[1].resolve(result(2)); await latest
  const count = changes.length
  api.calls[0].resolve(result(1)); await old
  assert.equal(changes.length, count)
  assert.equal(runner.getSnapshot().data.id, 2)
  runner.dispose()
})

test('an older error cannot replace the latest success', async () => {
  const api = deferredTransport()
  const runner = createRequestRunner({ transport: api.transport, onChange() {} })
  const old = runner.start(spec(1)), latest = runner.start(spec(2))
  api.calls[1].resolve(result(2)); await latest
  api.calls[0].reject(new Error('old error')); await old
  assert.equal(runner.getSnapshot().status, 'success')
  assert.equal(runner.getSnapshot().requestId, 2)
  runner.dispose()
})

test('current failure is visible and a retry can succeed', async () => {
  const api = deferredTransport()
  const runner = createRequestRunner({ transport: api.transport, onChange() {} })
  const failed = runner.start(spec(1)); api.calls[0].reject(new Error('current failure')); await failed
  assert.equal(runner.getSnapshot().error, 'current failure')
  const retry = runner.start(spec(1)); assert.equal(runner.getSnapshot().status, 'loading')
  api.calls[1].resolve(result(1)); await retry
  assert.equal(runner.getSnapshot().status, 'success')
  assert.equal(runner.getSnapshot().error, null)
  runner.dispose()
})

test('dispose aborts every pending request and prevents later publication or new work', async () => {
  const api = deferredTransport(), changes = []
  const runner = createRequestRunner({ transport: api.transport, onChange: s => changes.push(s), protectLatest: false })
  const old = runner.start(spec(1)), latest = runner.start(spec(2))
  runner.dispose(); const count = changes.length
  assert.ok(api.calls.every(call => call.signal.aborted))
  api.calls[0].resolve(result(1)); api.calls[1].reject(new Error('after unmount'))
  await Promise.all([old, latest]); await runner.start(spec(3))
  assert.equal(changes.length, count)
  assert.equal(api.calls.length, 2)
})

function manualTimers() {
  let next = 0
  const callbacks = new Map()
  return { callbacks, setTimeout(fn) { callbacks.set(++next, fn); return next }, clearTimeout(id) { callbacks.delete(id) } }
}

test('abort-aware demo transport clears its timer and rejects with AbortError', async () => {
  const timers = manualTimers(), events = [], controller = new AbortController()
  const api = createDemoTransport({ timers, onEvent: event => events.push(event.kind) })
  const promise = api.request({ id: 1, delay: 900 }, { signal: controller.signal })
  const rejected = assert.rejects(promise, { name: 'AbortError' })
  controller.abort(); await rejected
  assert.equal(timers.callbacks.size, 0)
  assert.deepEqual(events, ['started', 'cancelled'])
  api.dispose()
})

test('transport disposal clears even non-cancellable simulation timers without publishing events', async () => {
  const timers = manualTimers(), events = [], controller = new AbortController()
  const api = createDemoTransport({ timers, cancelable: false, onEvent: event => events.push(event.kind) })
  const promise = api.request({ id: 1, delay: 900 }, { signal: controller.signal })
  controller.abort(); assert.equal(timers.callbacks.size, 1)
  const rejected = assert.rejects(promise, { name: 'AbortError' })
  api.dispose(); await rejected
  assert.equal(timers.callbacks.size, 0)
  assert.deepEqual(events, ['started'])
})


test('same resource retried twice still keeps the newer request generation', async () => {
  const api = deferredTransport()
  const runner = createRequestRunner({ transport: api.transport, onChange() {} })
  const old = runner.start(spec(1)), latest = runner.start(spec(1))
  api.calls[1].resolve({ id: 1, message: 'new version' }); await latest
  api.calls[0].resolve({ id: 1, message: 'stale version' }); await old
  assert.equal(runner.getSnapshot().data.message, 'new version')
  runner.dispose()
})

test('old failure does not flash an error while the latest request is still loading', async () => {
  const api = deferredTransport()
  const runner = createRequestRunner({ transport: api.transport, onChange() {} })
  const old = runner.start(spec(1)), latest = runner.start(spec(2))
  api.calls[0].reject(new Error('old failure')); await old
  assert.equal(runner.getSnapshot().status, 'loading')
  assert.equal(runner.getSnapshot().requestId, 2)
  api.calls[1].resolve(result(2)); await latest
  assert.equal(runner.getSnapshot().status, 'success')
  runner.dispose()
})

test('late old success cannot conceal a failure of the latest selection', async () => {
  const api = deferredTransport()
  const runner = createRequestRunner({ transport: api.transport, onChange() {} })
  const old = runner.start(spec(1)), latest = runner.start(spec(2))
  api.calls[1].reject(new Error('latest failed')); await latest
  api.calls[0].resolve(result(1)); await old
  assert.equal(runner.getSnapshot().status, 'error')
  assert.equal(runner.getSnapshot().requestId, 2)
  assert.equal(runner.getSnapshot().data, null)
  runner.dispose()
})
