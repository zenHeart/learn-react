import { createServer } from 'node:http'
import { pathToFileURL } from 'node:url'
import { createTicketService, TicketError } from './service.mjs'

export function createTicketServer() {
  const service = createTicketService()
  return createServer(async (req, res) => {
    const send = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)) }
    try {
      if (req.method === 'GET' && req.url === '/tickets') return send(200, service.list())
      const update = /^\/tickets\/(T-\d+)$/.exec(req.url || '')
      if (!(req.method === 'POST' && req.url === '/tickets') && !(req.method === 'PATCH' && update)) return send(404, { error: 'Not found' })
      let body = ''
      for await (const chunk of req) {
        body += chunk
        if (Buffer.byteLength(body) > 8192) throw new TicketError(413, '请求过大。')
      }
      let input
      try { input = JSON.parse(body) } catch { throw new TicketError(400, 'JSON 无效。') }
      if (update) return send(200, service.transition(update[1], input?.status, input?.expectedVersion))
      const result = service.create(input, req.headers['idempotency-key'])
      return send(result.replayed ? 200 : 201, result)
    } catch (error) { send(error instanceof TicketError ? error.status : 500, { error: error instanceof TicketError ? error.message : 'Internal error' }) }
  })
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createTicketServer().listen(4319, '127.0.0.1', () => console.log('Synthetic teaching API: http://127.0.0.1:4319/tickets'))
}
