import { useState } from 'react'
import { Link, MemoryRouter, Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router'
function User() { const { id } = useParams(); return <h3>用户详情：{id}</h3> }
function Workspace() {
  const [signedIn, setSignedIn] = useState(false)
  const location = useLocation()
  return <section style={{ padding: 24 }}><h2>路由、参数与界面访问控制</h2>
    <p>实验使用独立 MemoryRouter；刷新会重置登录演示状态。真实 API 必须在服务端鉴权，前端跳转不能提供授权保证。</p>
    <nav aria-label="实验路由"><Link to="/">首页</Link> · <Link to="/users/123">用户 123</Link> · <Link to="/settings">设置</Link> · <Link to="/missing">未知路径</Link></nav>
    <p>当前路径：{location.pathname}</p><button onClick={() => setSignedIn(value => !value)}>{signedIn ? '退出演示登录' : '演示登录'}</button>
    <Routes><Route element={<div><Outlet /></div>}>
      <Route path="/" element={<h3>工作台首页</h3>} />
      <Route path="/users/:id" element={<User />} />
      <Route path="/login" element={signedIn ? <Navigate to="/settings" replace /> : <p>请使用演示登录按钮，再进入设置。</p>} />
      <Route path="/settings" element={signedIn ? <h3>设置页面</h3> : <Navigate to="/login" replace />} />
      <Route path="*" element={<p>路径不存在，请返回首页。</p>} />
    </Route></Routes>
    <details><summary>独立任务与反例</summary><p>重建嵌套路由、参数页和登录跳转；验证未知路径、退出后重访设置。再把“登录”改为角色授权，说明服务端仍必须执行哪些检查。三天后无提示实现返回原请求页面。</p></details>
  </section>
}
export default function App() { return <MemoryRouter><Workspace /></MemoryRouter> }
App.meta = { title: '路由与访问控制边界', tags: ['router', 'typescript', 'testing'] }
