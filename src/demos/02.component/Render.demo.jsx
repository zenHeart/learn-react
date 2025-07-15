import React from 'react'
import ReactDOM from 'react-dom'

function Render () {
  return (
    <div>
      <h2> ReactDOM.render 挂载 dom 节点</h2>
      {setInterval(tick, 1000)}
      <div id='d1'></div>
    </div>
  )
}
function tick () {
  const element = (
    <div>
      <h2>It is {new Date().toLocaleTimeString()}.</h2>
    </div>
  )
  ReactDOM.render(element, document.getElementById('d1'))
}
Render.text = 'ReactDOM.Render'

export default Render
