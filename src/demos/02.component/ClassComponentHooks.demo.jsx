import React from 'react'

function ClassComponentState () {
  return (
    <div>
      <h2>hooks 控制组件状态</h2>
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
  componentDidMount () {
    this.timerId = setInterval(() => this.tick(), 1000)
  }
  componentWillUnmount () {
    clearInterval(this.timerId)
  }
  tick () {
    this.setState({
      date: new Date()
    })
  }
  render () {
    return (
      <div>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    )
  }
}
ClassComponentState.text = '类组件利用 hooks 触发特定事件'

export default ClassComponentState
