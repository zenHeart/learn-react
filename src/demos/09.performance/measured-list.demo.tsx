import { memo, useMemo, useState } from 'react'
const rows = Array.from({ length: 2000 }, (_, id) => ({ id, name: `合成记录 ${id}` }))
const Results = memo(function Results({ items }: { items: typeof rows }) {
  // Bounded work. Inspect this component's commits with the development Profiler.
  return <><p>匹配 {items.length} 条，仅展示前 30 条。</p><ul>{items.slice(0, 30).map(item => <li key={item.id}>{item.name}</li>)}</ul></>
})
export default function App() {
  const [query, setQuery] = useState('')
  const [unrelated, setUnrelated] = useState(0)
  const [stable, setStable] = useState(false)
  const cached = useMemo(() => rows.filter(row => row.name.includes(query)), [query])
  const items = stable ? cached : rows.filter(row => row.name.includes(query))
  return <section style={{ padding: 24 }}><h2>用测量检验 memo 的收益</h2>
    <label>搜索合成记录 <input value={query} onChange={event => setQuery(event.target.value)} /></label>
    <label><input type="checkbox" checked={stable} onChange={event => setStable(event.target.checked)} /> 稳定派生数组引用</label>
    <button onClick={() => setUnrelated(n => n + 1)}>无关计数：{unrelated}</button><Results items={items} />
    <p>在开发构建的 React Profiler 中分别记录两种模式：先保持搜索不变，点击无关计数五次；再改变搜索。比较 Results 的提交和耗时，保持浏览器、数据量与节流设置一致。</p>
    <p>验收：搜索结果相同；报告至少五次测量的中位数、波动与组件提交证据。不设脱离设备和任务的固定提速比例。稳定引用不保证所有场景变快，缓存也有维护成本。</p>
    <details><summary>迁移与复测</summary><p>改成 10 万条远程分页数据，比较分页、虚拟化与服务端筛选；提供网络和渲染证据。三天后定位一个不同瓶颈，避免先加 memo 再找理由。</p></details>
  </section>
}
App.meta = { disableSandpack: true, title: '可测量的列表优化', tags: ['performance', 'memo', 'profiling'] }
