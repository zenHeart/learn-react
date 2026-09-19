export const dynamic = 'force-dynamic'
export default async function SlowPage() {
  await new Promise(resolve => setTimeout(resolve, 500))
  return <main><h1>流式课程已到达</h1><p>此路由有 loading 边界，后续流式片段需要浏览器脚本揭示。禁用 JavaScript 时应检查实际可见结果，不能只搜索 HTML 字符串。</p><a href="/">返回完整 HTML 案例</a></main>
}
