'use client'
export default function ErrorView({ reset }) {
  return <main><h1>服务端课程暂不可用</h1><p role="alert">这是受控的合成故障。当前 URL 保留 fail=1 时，重新请求仍会失败。</p>
    <button onClick={reset}>重新请求</button><p><a href="/">清除故障并返回课程</a></p>
  </main>
}
