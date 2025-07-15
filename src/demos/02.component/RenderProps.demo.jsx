import React from 'react'

class Mouse extends React.Component {
  state = {
    x: 0,
    y: 0
  }
  handleMouseMove = (event) => {
    this.setState({
      x: event.clientX,
      y: event.clientY
    })
  }

  render() {
    return (<div style={{height:'400px',border:'1px solid red'}} onMouseMove={this.handleMouseMove}>
      {this.props.render(this.state)}
    </div>)
  }
}
function UseMouse(c) {
  return (
  <Mouse render = {
    ({x, y}) => (
      <h1>position: ({x},{y})</h1>
    )
  }/>
  )
}

UseMouse.meta = {
  tags: [
    'tricks',
    'render-props',
  ]
}
// read https://cdb.reacttraining.com/use-a-render-prop-50de5wa98f11ce to know all 

export default UseMouse


