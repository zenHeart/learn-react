import { useState } from 'react'
import ErrorBoundary from './ErrorBoundary'
function Counter() {
  const [count, setCount] = useState(0)
  if (count >= 5) throw new Error('合成渲染错误：计数到达 5')
  return <><p>计数：{count}</p><button onClick={() => setCount(n => n + 1)}>增加计数</button></>
}
export default function App() {
  return <section style={{ padding: 24 }}><h2>错误边界与重建恢复</h2>
    <p>点击五次触发子组件渲染错误；重试会重建子树，计数回到零。错误边界不能捕获事件回调或任意异步回调中的异常，也不能代替请求的失败处理。</p>
    <ErrorBoundary><Counter /></ErrorBoundary>
    <details><summary>独立任务与迁移</summary><p>实现可重试边界，验证父界面仍能操作。移除触发条件后才能恢复持续故障；迁移到请求失败时，说明 catch、错误状态与渲染边界各自负责什么。</p></details>
  </section>
}
App.meta = { disableSandpack: true, title: '错误边界与恢复', tags: ['error-handling', 'error-boundary'] }
