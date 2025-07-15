import React from 'react'

function ClassComponent () {
  return (
    <div>
      <h2>采用类编写组价</h2>
      <ul>
        <li>
          <C1 {...{ a: 1, b: 2 }}></C1>
        </li>
      </ul>
    </div>
  )
}
ClassComponent.text = '类组件'

class C1 extends React.Component {
  render () {
    return <p>{JSON.stringify(this.props)}</p>
  }
}
export default ClassComponent
