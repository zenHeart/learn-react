export class TicketError extends Error {
  constructor(status, message) { super(message); this.status = status }
}

// Teaching service: memory only. Authorization and durable transactions belong on a server.
export function createTicketService() {
  const tickets = new Map()
  const requests = new Map()
  let sequence = 0
  return {
    list() { return [...tickets.values()].map(ticket => ({ ...ticket })) },
    create(input, key) {
      const title = typeof input?.title === 'string' ? input.title.trim() : ''
      const priority = input?.priority
      if (!title || title.length > 80 || !['normal', 'urgent'].includes(priority)) {
        throw new TicketError(422, '标题须为 1–80 字，优先级须为 normal 或 urgent。')
      }
      if (typeof key !== 'string' || !key.trim() || key.length > 120) throw new TicketError(400, '需要有效的幂等键。')
      const fingerprint = JSON.stringify({ title, priority })
      const previous = requests.get(key)
      if (previous) {
        if (previous.fingerprint !== fingerprint) throw new TicketError(409, '同一个幂等键不能提交不同内容。')
        return { ticket: { ...previous.ticket }, replayed: true }
      }
      const ticket = { id: `T-${++sequence}`, title, priority, status: 'open', version: 1 }
      tickets.set(ticket.id, ticket)
      requests.set(key, { fingerprint, ticket: { ...ticket } })
      return { ticket: { ...ticket }, replayed: false }
    },
    transition(id, status, expectedVersion) {
      const ticket = tickets.get(id)
      if (!ticket) throw new TicketError(404, '工单不存在。')
      if (!['open', 'done'].includes(status) || !Number.isInteger(expectedVersion)) throw new TicketError(422, '状态或版本无效。')
      if (ticket.version !== expectedVersion) throw new TicketError(409, '版本冲突：请刷新后检查他人的修改，再重新操作。')
      const updated = { ...ticket, status, version: ticket.version + 1 }
      tickets.set(id, updated)
      return { ...updated }
    },
  }
}
