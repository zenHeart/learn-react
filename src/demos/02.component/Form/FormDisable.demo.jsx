import React from 'react'

function ClassComponent () {
  return (
    <div>
      <h2>组件初始有值则为只读,通过设置为空触发可修改</h2>
      <ul>
        <li>
          <h3>设置组件可修改,注意 null , undefined 不会修改组件的状态</h3>
          <ControlInput init='initial'></ControlInput>
        </li>
      </ul>
    </div>
  )
}

class ControlInput extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: props.init
    }
  }
  render () {
    return (
      <p>
        <input type='text' value={this.state.value} />
        <strong>{this.state.value}</strong>
        <button
          onClick={() =>
            this.setState({
              value: ''
            })
          }
        >
          reset
        </button>
        <button
          onClick={() =>
            this.setState({
              value: null
            })
          }
        >
          null
        </button>
        <button
          onClick={() =>
            this.setState({
              value: undefined
            })
          }
        >
          undefined
        </button>
      </p>
    )
  }
}
ClassComponent.text = '表单组件只读和复位'

export default ClassComponent
