import React from 'react'

function ClassComponent () {
  return (
    <div>
      <h2>类组件默认值采用 defaultProps</h2>
      <ul>
        <li>
          <h3>采用默认值</h3>
          默认值:
          <C1 />
          <br />
          为赋值属性会采用默认值:<C1 {...{ foo: 'foo' }}></C1>
        </li>
      </ul>
    </div>
  )
}
ClassComponent.text = '类组件 defaultProps'

class C1 extends React.Component {
  // 静态变量默认值
  static defaultProps = {
    foo: 'default',
    bar: 'default'
  }
  render () {
    return <strong>{JSON.stringify(this.props)}</strong>
  }
}
export default ClassComponent
