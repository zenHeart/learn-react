'use client'
import { useState } from 'react'
export default function Counter() {
  const [likes, setLikes] = useState(0)
  return <button onClick={() => setLikes(n => n + 1)}>本地点赞：{likes}</button>
}
