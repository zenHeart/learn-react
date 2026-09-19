import { Suspense, lazy, useState } from 'react'
const DeferredPanel = lazy(() => import('./DeferredPanel'))
export default function App() {
  const [show, setShow] = useState(false)
  return <section style={{ padding: 24 }}><h2>Suspense 与真实代码分割</h2>
    <p>点击后首次加载独立组件模块，等待期间显示 fallback。加载完成后模块会缓存。普通 Effect 中 fetch 不会自动触发 Suspense。</p>
    <button onClick={() => setShow(true)}>加载分割模块</button>
    {show && <Suspense fallback={<p role="status">正在加载分割模块…</p>}><DeferredPanel /></Suspense>}
    <p>任务：在开发者工具限速并禁用缓存，记录加载反馈；模拟 chunk 失败，添加错误边界。不要在渲染中启动 setTimeout 来假装组件 suspend。</p>
  </section>
}
App.meta = { disableSandpack: true, title: 'Suspense 与代码分割', tags: ['suspense', 'lazy'] }
