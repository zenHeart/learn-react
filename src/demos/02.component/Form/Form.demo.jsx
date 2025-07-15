import React from 'react'

function ClassComponent () {
  return (
    <div>
      <h2>采用类编写组价</h2>
      <ul>
        <li>
          <h3>采用类编写受控组件</h3>
          <ControlInput init='initial'></ControlInput>
        </li>
        <li>
          <h3>非受控组件内部持有状态</h3>
          <input
            type='text'
            onChange={e => {
              console.log('value', e.target.value)
            }}
          ></input>
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
  changeValue = e => {
    let { target } = e
    this.setState({
      value: target.value
    })
  }
  render () {
    return (
      <p>
        <input
          type='text'
          value={this.state.value}
          onChange={this.changeValue}
        />
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
      </p>
    )
  }
}
ClassComponent.text = '表单组件示例'

export default ClassComponent
