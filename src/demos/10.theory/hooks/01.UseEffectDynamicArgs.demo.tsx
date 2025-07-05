
import { useState, useEffect } from 'react'

function BasicHook() {
  let [count, setCount] = useState(0);

  // 动态修改参数会抛出错误，但是函数不受影响， 为什么这么设计？
  useEffect(count%2 ? () =>console.log('奇数') : () => console.log('偶数'),count%2 ? []: undefined)

  return <button onClick={() => setCount(++count)}>{count}</button>
}

BasicHook.meta = {
  tags: [
    'hook',
    'useEffect',
  ]
}


export default BasicHook