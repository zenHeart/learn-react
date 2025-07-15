import React from 'react'

const MyComponent = {
  A: props => <span>组件 A</span>,
  B: props => <span>组件 B</span>
}
function D1 () {
  return (
    <div>
      <h2> JSX 可以暴露对象返回多个组件</h2>
      <ul>
        <li>
          <h3>采用对象方式访问子组件</h3>
          <p>
            {'MyComponent.A'}:<MyComponent.A />
          </p>
          <p>
            {'MyComponent.B'}:<MyComponent.B />
          </p>
        </li>
      </ul>
    </div>
  )
}
D1.text = '采用 . 暴露多个 React 组件'

export default D1
