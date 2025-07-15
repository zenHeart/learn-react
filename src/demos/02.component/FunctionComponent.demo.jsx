import React from 'react'

function D1 () {
  return (
    <div>
      <h2>采用组件组织文件</h2>
      <ul>
        <li>
          <C1 {...{ a: 1, b: 2 }}></C1>
        </li>
      </ul>
    </div>
  )
}
D1.text = '函数组件'

function C1 (props) {
  return <p>{JSON.stringify(props)}</p>
}
export default D1
