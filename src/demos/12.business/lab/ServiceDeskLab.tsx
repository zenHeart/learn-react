import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { createTicketService, type Ticket } from './service.mjs'
import '../../08.async/lab/lab.css'
import './service.css'

export default function ServiceDeskLab() {
  const [service] = useState(createTicketService)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Ticket['priority']>('normal')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [loseResponse, setLoseResponse] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('尚未提交工单。')
  const request = useRef({ fingerprint: '', key: '' })
  const refresh = () => { setTickets(service.list()); setError(''); setFeedback('已读取当前服务端模型快照。') }
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const fingerprint = JSON.stringify({ title: title.trim(), priority })
    if (request.current.fingerprint !== fingerprint) request.current = { fingerprint, key: crypto.randomUUID() }
    try {
      const result = service.create({ title, priority }, request.current.key)
      if (loseResponse) {
        setLoseResponse(false)
        throw new Error('响应丢失：服务端已保存。保持表单内容不变，再提交一次，观察是否产生重复工单。')
      }
      setTickets(service.list()); setError('')
      setFeedback(result.replayed ? `安全重试：复用 ${result.ticket.id}，没有重复创建。` : `已创建 ${result.ticket.id}。`)
      setTitle(''); request.current = { fingerprint: '', key: '' }
    } catch (failure) { setError((failure as Error).message) }
  }
  const transition = (ticket: Ticket) => {
    try {
      service.transition(ticket.id, ticket.status === 'open' ? 'done' : 'open', ticket.version)
      refresh()
    } catch (failure) { setError((failure as Error).message) }
  }
  const visible = tickets.filter(ticket => ticket.title.includes(query) && (status === 'all' || ticket.status === status))
  return <article className="race-lab service-lab">
    <Link to="/">← 学习路线</Link><p className="race-label">业务交付实验 · 表单、重试与并发写入</p>
    <h1>交付一个可靠的工单模块</h1>
    <p>你负责客服工单界面。网络可能丢失响应，同事可能同时编辑。先预测故障后会出现几张工单、哪个版本生效，再用下面的控制台验证。</p>
    <p>此页面使用内存服务模型，刷新即清空；只输入合成数据。仓库另有真实 HTTP 练习，GitHub Pages 不运行该服务。</p>
    <form onSubmit={submit} noValidate>
      <fieldset><legend>1. 创建与安全重试</legend>
        <label htmlFor="ticket-title">标题（1–80 字）</label>
        <input id="ticket-title" value={title} onChange={e => setTitle(e.target.value)} aria-describedby="ticket-error" aria-invalid={error.startsWith('标题须为')} />
        <label htmlFor="ticket-priority">优先级</label>
        <select id="ticket-priority" value={priority} onChange={e => setPriority(e.target.value as Ticket['priority'])}><option value="normal">普通</option><option value="urgent">紧急</option></select>
        <label><input type="checkbox" checked={loseResponse} onChange={e => setLoseResponse(e.target.checked)} /> 模拟下一次响应丢失（服务端仍保存）</label>
        <button type="submit">提交工单 / 重试</button>
      </fieldset>
    </form>
    <p id="ticket-error" role="alert">{error}</p><p role="status">{feedback}</p>
    <fieldset><legend>2. 查询与冲突恢复</legend>
      <label htmlFor="ticket-query">搜索标题</label><input id="ticket-query" value={query} onChange={e => setQuery(e.target.value)} />
      <label htmlFor="ticket-status">状态筛选</label><select id="ticket-status" value={status} onChange={e => setStatus(e.target.value)}><option value="all">全部</option><option value="open">处理中</option><option value="done">已完成</option></select>
      <p>当前快照共 {tickets.length} 张工单；筛选后 {visible.length} 张。</p><button type="button" onClick={refresh}>刷新服务端快照</button>
      {!visible.length && <p>没有匹配工单。检查筛选条件，或先创建一张合成工单。</p>}
      <ul>{visible.map(ticket => <li key={ticket.id}>
        <h3>{ticket.id} · {ticket.title}</h3><p>{ticket.status === 'open' ? '处理中' : '已完成'} · 版本 {ticket.version} · {ticket.priority === 'urgent' ? '紧急' : '普通'}</p>
        <div className="race-actions"><button onClick={() => transition(ticket)}>{ticket.status === 'open' ? '完成工单' : '重新打开'}</button>
          <button onClick={() => { const current = service.list().find(item => item.id === ticket.id)!; service.transition(current.id, current.status === 'open' ? 'done' : 'open', current.version); setFeedback('另一位编辑者已修改服务端；本页快照保持旧版本。现在尝试操作，再刷新恢复。') }}>模拟他人修改</button></div>
      </li>)}</ul>
    </fieldset>
    <h2>从示范到独立交付</h2><ol>
      <li>示范：开启响应丢失，提交，再保持内容重试。验收：只有一张工单。</li>
      <li>补全：阅读 service.mjs，遮住版本检查分支，补回让冲突测试通过的判断。</li>
      <li>独立：关闭本实现，从表单、服务契约和测试要求重建模块；提交键盘操作记录和失败测试。</li>
      <li>排错：模拟他人修改，再操作旧快照。解释为什么不能自动覆盖，然后刷新并明确重试。</li>
      <li>迁移：改成库存扣减，说明内存 Map 在多实例服务中为什么失效，设计数据库唯一键与条件更新。</li>
      <li>延迟复测：三天后无提示复现响应丢失与版本冲突，分别写出失败断言。</li>
    </ol>
    <details><summary>因果解释与验收边界</summary><p>幂等键标识一次业务意图，响应丢失后复用该键才能取回原结果；版本号标识读取的快照，写入时比较它才能拒绝过期修改。真实服务还需身份认证、授权、持久化、并发原子性和幂等记录过期策略。本实验不提供这些生产能力。</p></details>
  </article>
}
