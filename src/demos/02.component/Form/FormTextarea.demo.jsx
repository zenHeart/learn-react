import React from 'react'

function ClassComponent () {
  return (
    <div>
      <h2>表单组件 textarea</h2>
      <ul>
        <li>
          <h3>采用 value 控制 textarea</h3>
          <Textarea init='initial'></Textarea>
        </li>
      </ul>
    </div>
  )
}

class Textarea extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: props.init
    }
  }
  onChange = e => {
    let { target } = e
    this.setState({
      value: target.value
    })
  }
  render () {
    return (
      <p>
        <textarea onChange={this.onChange} value={this.state.value}></textarea>
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
ClassComponent.text = '表单组件 textarea'

export default ClassComponent
