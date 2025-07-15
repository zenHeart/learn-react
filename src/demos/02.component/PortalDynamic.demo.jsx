import React,{useState} from 'react'
import ReactDOM from 'react-dom'

class Portal extends React.Component {
  constructor() {
    super();
    this.el = document.createElement('div')
  }
  componentDidMount() {
    // TODO: 此变量 willunmount 为啥也可访问
    let modal = document.getElementById('modal')
    modal.appendChild(this.el)
  }
  componentWillUnmount() {
    let modal = document.getElementById('modal')
    modal.removeChild(this.el)
  }
  render() {
    return ReactDOM.createPortal(this.props.children,this.el)
  }
}

function PortalButton() {
  const [show,triggerShow] = useState(true);
  const handleShow = () => {
    triggerShow(show^1);
  }
  return <div>
    <button onClick={handleShow}>show: {show}</button>
    <div id="modal"></div>
    {show?<Portal><h1>modal</h1></Portal>:null}
  </div>
}

export default PortalButton