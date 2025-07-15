import React from 'react'

function ClassComponent () {
  return (
    <div>
      <h2>表单组件 textarea</h2>
      <ul>
        <li>
          <h3>采用 value 控制 textarea</h3>
          <FormSelect init='lime'></FormSelect>
        </li>
        <li>
          <h3>采用 multiple 实现多选</h3>
          <FormSelect multiple={true} init={['lime', 'mango']}></FormSelect>
        </li>
      </ul>
    </div>
  )
}

class FormSelect extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: props.init
    }
  }
  changeHandle = e => {
    let { target } = e
    // TODO: 为什么选中的只有一个
    console.dir(target.selectedOptions)
    this.setState((state, props) => {
      return {
        value: props.multiple
          ? [...target.options]
              .filter(({ selected }) => selected)
              .map(({ value }) => value)
          : target.value
      }
    })
  }
  render () {
    return (
      <form
        onSubmit={e => {
          e.preventDefault()
        }}
      >
        <label>
          pick a item
          <select
            multiple={this.props.multiple}
            value={this.state.value}
            onChange={this.changeHandle}
          >
            <option value='grapefruit'>Grapefruit</option>
            <option value='lime'>Lime</option>
            <option value='coconut'>Coconut</option>
            <option value='mango'>Mango</option>
          </select>
        </label>
        <button
          onClick={() =>
            this.setState({
              value: ''
            })
          }
        >
          reset
        </button>
      </form>
    )
  }
}
ClassComponent.text = '表单组件 select'

export default ClassComponent
