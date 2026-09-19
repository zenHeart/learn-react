import { useEffect, useRef, useState } from 'react'
import { createDemoTransport, createRequestRunner, type Snapshot, type TransportEvent } from './request-latest.mjs'
import './lab.css'

const initial: Snapshot = { status: 'idle', requestId: null, data: null, error: null }
const eventNames = { started: '发起', completed: '成功返回', failed: '失败返回', cancelled: '已取消' }

function Experiment({ protectLatest, cancelable }: { protectLatest: boolean; cancelable: boolean }) {
  const [scenario, setScenario] = useState('old-success')
  const [prediction, setPrediction] = useState('')
  const [snapshot, setSnapshot] = useState<Snapshot>(initial)
  const [events, setEvents] = useState<TransportEvent[]>([])
  const [running, setRunning] = useState(false)
  const [feedback, setFeedback] = useState('')
  const runnerRef = useRef<ReturnType<typeof createRequestRunner> | null>(null)

  useEffect(() => {
    let active = true
    const api = createDemoTransport({ cancelable, onEvent: event => { if (active) setEvents(previous => [...previous, event]) } })
    const runner = createRequestRunner({ transport: api.request, onChange: setSnapshot, protectLatest })
    runnerRef.current = runner
    return () => { active = false; runnerRef.current = null; runner.dispose(); api.dispose() }
  }, [protectLatest, cancelable])

  const run = async () => {
    const runner = runnerRef.current
    if (!runner) return
    setEvents([]); setFeedback(''); setRunning(true)
    if (scenario === 'retry') {
      await runner.start({ id: 1, delay: 200, fail: true })
      await runner.start({ id: 2, delay: 150 })
    } else {
      await Promise.all([
        runner.start({ id: 1, delay: 900, fail: scenario === 'old-error' }),
        runner.start({ id: 2, delay: 150 }),
      ])
    }
    if (runnerRef.current === runner) setRunning(false)
  }
  const check = () => {
    const observed = snapshot.status === 'error' ? 'error' : String(snapshot.requestId)
    const valid = snapshot.status === 'success' && snapshot.requestId === 2
    setFeedback(`${prediction === observed ? '预测与观察一致。' : '预测与观察不同，请结合事件顺序解释。'} ${valid ? '本次业务约束通过：最终显示最新请求 2。' : '本次业务约束失败：旧请求覆盖了最新选择。'}`)
  }

  return <>
    <fieldset><legend>运行场景</legend>
      <label>场景 <select aria-label="选择竞态场景" value={scenario} disabled={running} onChange={e => { setScenario(e.target.value); setPrediction(''); setFeedback(''); setSnapshot(initial); setEvents([]) }}>
        <option value="old-success">旧成功晚于新成功</option><option value="old-error">旧错误晚于新成功</option><option value="retry">当前请求失败后重试</option>
      </select></label>
    </fieldset>
    <fieldset><legend>运行前预测：最终会显示什么？</legend>
      {[['1', '请求 1 的结果'], ['2', '请求 2 的结果'], ['error', '错误界面']].map(([value, label]) => <label key={value}><input type="radio" name="race-prediction" value={value} checked={prediction === value} disabled={running} onChange={() => setPrediction(value)} /> {label}</label>)}
    </fieldset>
    <div className="race-actions"><button type="button" disabled={!prediction || running} onClick={run}>{running ? '请求进行中…' : '运行实验'}</button><button type="button" disabled={running || !events.length} onClick={check}>检查当前结果</button></div>
    <section aria-labelledby="race-result"><h2 id="race-result">实际界面</h2><div role="status" className="race-state">{snapshot.status === 'idle' ? '等待实验' : snapshot.status === 'loading' ? `正在加载请求 ${snapshot.requestId}` : snapshot.status === 'error' ? `请求 ${snapshot.requestId}：${snapshot.error}` : snapshot.data?.message}</div><p role="status">{feedback}</p></section>
    <section aria-labelledby="race-events"><h2 id="race-events">事件顺序</h2><ol>{events.map((event, index) => <li key={index}>请求 {event.id}：{eventNames[event.kind]}</li>)}</ol></section>
    <details><summary>观察后再看机制</summary><p>取消请求和阻止过期结果更新是两层保护。AbortController 发出取消信号；运输层是否停止工作取决于实现。即使旧响应继续到达，递增的请求序号也能阻止旧成功和旧错误写入界面。</p><p>组件离开时同时停止状态发布并清理模拟请求的定时器。这个实验只解释请求生命周期，不把手写控制器等同于完整的服务端缓存库。</p><a href="https://react.dev/reference/react/useEffect#fetching-data-with-effects" target="_blank" rel="noreferrer">React 官方文档：Effect 中的数据获取</a></details>
    <section aria-labelledby="race-transfer"><h2 id="race-transfer">独立完成与迁移</h2><ol><li>先不看修复实现，为最新请求成功、旧错误迟到和卸载各写一个失败测试。</li><li>打开 request-latest.mjs，解释序号、取消信号和 dispose 分别保护什么；删除其中一层，找出反例。</li><li>将同一原则迁移到搜索建议或分页列表，保留失败重试，避免取消其他组件的请求。</li><li>隔一段时间从空文件重写，并记录是否使用了提示。实验按钮通过不代表已经独立掌握。</li></ol><p>可运行测试：<code>node --test src/demos/08.async/lab/request-latest.test.mjs</code></p></section>
  </>
}

export default function AsyncRaceLab() {
  const [protectLatest, setProtectLatest] = useState(false)
  const [cancelable, setCancelable] = useState(false)
  return <article className="race-lab">
    <p className="race-label">排错实验 · 异步请求</p>
    <h1>为什么旧请求会覆盖新选择？</h1>
    <p>业务约束：用户最后选择请求 2，最终界面必须保留请求 2 的成功结果。先预测，再运行故障版本，最后切换修复版本比较。</p>
    <fieldset><legend>实验条件</legend>
      <label><input type="checkbox" checked={protectLatest} onChange={e => setProtectLatest(e.target.checked)} /> 启用修复：只有最新请求可以更新界面</label>
      <label><input type="checkbox" checked={cancelable} onChange={e => setCancelable(e.target.checked)} /> 模拟服务支持取消（默认模拟无法取消的响应）</label>
      <p>改变条件会开始一次新实验，并清理上一次的请求与记录。</p>
    </fieldset>
    <Experiment key={`${protectLatest}:${cancelable}`} protectLatest={protectLatest} cancelable={cancelable} />
  </article>
}

AsyncRaceLab.meta = { title: '请求竞态：预测、故障与修复', tags: ['async', 'race-condition', 'effects', 'testing'] }
