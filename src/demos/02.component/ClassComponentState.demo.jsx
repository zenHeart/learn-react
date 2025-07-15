import React from 'react'

function ClassComponentState () {
  return (
    <div>
      <h2>利用 this.state 管理组件内部状态</h2>
      <ul>
        <li>
          <C1></C1>
        </li>
      </ul>
    </div>
  )
}

class C1 extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      date: new Date()
    }
  }
  render () {
    return (
      <div>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    )
  }
}
ClassComponentState.text = '类组件 state 保存状态'

export default ClassComponentState
