import React from 'react'

function CreatElement () {
  return (
    <div>
      <h2> props.children 包含内部子元素,类似 vue 默认 slot</h2>
      <ul>
        <li>
          <Hi>
            <h4>hello world!</h4>
          </Hi>
        </li>
      </ul>
    </div>
  )
}
function Hi (props) {
  return (
    <p>
      <h3>标签内部元素会替换 props.children</h3>
      {props.children}
    </p>
  )
}

CreatElement.text = 'props.children'

export default CreatElement
