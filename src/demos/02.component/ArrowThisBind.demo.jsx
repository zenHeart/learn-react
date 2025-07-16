import React from 'react'

function ClassComponent () {
  return (
    <div>
      <h2>采用箭头函数避免 this 丢失</h2>
      <C1 {...{ a: 1, b: 2 }}></C1>
    </div>
  )
}
ClassComponent.text = '直接绑定事件注意避免 this 丢失'

class C1 extends React.Component {
  showProps = (e, ...args) => {
    alert('点击事件')
    console.log(this.props, e, args)
  }

  render () {
    return (
      <div>
        <button onClick={this.showProps}>点击</button>
        <button onClick={e => this.showProps(e, new Date(), 1, 2, 3)}>
          传入参数
        </button>
      </div>
    )
  }
}
export default ClassComponent
