import Counter from './counter'
import { getLesson } from '../lib/lesson'
export const dynamic = 'force-dynamic'
export default async function Page({ searchParams }) {
  const query = await searchParams
  if (query.fail === '1') throw new Error('Synthetic server failure')
  const lesson = await getLesson()
  return <main><h1>{lesson.title}</h1><p>{lesson.summary}</p>
    <p>这段内容来自服务端模块。浏览器收到的 HTML 已包含标题；交互按钮由客户端组件水合。</p>
    <Counter />
    <p><a href="/slow">观察流式加载边界</a></p>
    <p><a href="/?fail=1">注入服务端渲染失败</a></p>
    <details><summary>检验任务</summary><p>禁用 JavaScript，确认标题仍在但按钮不能交互。恢复 JavaScript 后点击按钮，检查没有整页导航。搜索客户端 chunk，确认服务端合成标记没有被序列化。</p></details>
  </main>
}
