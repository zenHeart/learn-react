import React from 'react'

function ClassComponentState () {
  return (
    <div>
      <h2>利用 this.setState 管理组件内部状态</h2>
      <ul>
        <li>
          <C1 {...{ increment: 1, decrement: -1 }}></C1>
        </li>
      </ul>
    </div>
  )
}

class C1 extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      count: 0
    }
  }
  add () {
    this.setState((state, props) => {
      return {
        count: state.count + props.increment
      }
    })
  }
  minus () {
    this.setState((state, props) => {
      return {
        count: state.count + props.decrement
      }
    })
  }
  render () {
    return (
      <div>
        <h2>{this.state.count}</h2>
        <button
          style={{
            marginRight: '1rem'
          }}
          onClick={this.add.bind(this)}
        >
          +
        </button>
        <button onClick={this.minus.bind(this)}>-</button>
      </div>
    )
  }
}
ClassComponentState.text = '类组件 setState 改变内部状态'

export default ClassComponentState
