import React from 'react'

function ClassComponent () {
  return (
    <div>
      <h2>多个表单组件的控制</h2>
      <ul>
        <li>
          <h3>采用 name 动态控制 input</h3>
          <MultiInput init={{ foo: 'a', bar: 'b' }}></MultiInput>
        </li>
      </ul>
    </div>
  )
}

class MultiInput extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      foo: props.init.foo,
      bar: props.init.bar
    }
  }
  changeValue = e => {
    let { target } = e
    this.setState({
      [target.name]: target.value
    })
  }
  render () {
    return (
      <p>
        <input
          type='text'
          name='foo'
          value={this.state.foo}
          onChange={this.changeValue}
        />
        <input
          type='text'
          name='bar'
          value={this.state.bar}
          onChange={this.changeValue}
        />
        <button
          onClick={() =>
            this.setState({
              foo: '',
              bar: ''
            })
          }
        >
          reset
        </button>
      </p>
    )
  }
}
ClassComponent.text = '表单组件控制多个元素'

export default ClassComponent
