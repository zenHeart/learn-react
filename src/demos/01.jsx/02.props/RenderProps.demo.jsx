import React from 'react'

function ClassComponent () {
  return (
    <div>
      <h2>props 也可传入组件,实现动态注入</h2>
      <ul>
        <li>
          <h3>children 为标签内内容,其余组件通过属性名注入</h3>
          <ShowName left={<strong>tom</strong>} right={<strong>jack</strong>}>
            <span>john</span>
          </ShowName>
        </li>
      </ul>
    </div>
  )
}
ClassComponent.text = '采用 props 实现插槽'

function ShowName (props) {
  return (
    <p>
      {props.left}
      {props.children}
      {props.right}
    </p>
  )
}

export default ClassComponent
