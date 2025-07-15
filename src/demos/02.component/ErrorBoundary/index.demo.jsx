import React, { useState } from 'react'

// 1. 声明 error 处理的插槽组件
class ErrorBoundary extends React.Component {
  constructor() {
    super();
    this.state = {
      error: null,
      info: null
    }
  }
  // 2. 挂载 error 处理事件
  componentDidCatch(error, info) {
    this.setState({
      error,
      info
    })
    console.log('error:', arguments)
  }
  render() {
    // 3. 处理错误时的显示策略
    if (this.state.error) {
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.info.componentStack}
          </details>
        </div>
      )
      // 正常返回插槽节点
    }
    return this.props.children
  }
}


function CountButton() {
  let [count, setCount] = useState(1);
  let changeCount = () => {
    setCount(count + 1)
  }
  if (count > 5) {
    throw new Error('count error')
  } else return <button onClick={changeCount}>{count}</button>
}

// 4. 应用中使用错误处理组价

function App(props) {
  return (<div>
    <h1>使用 componentDidCatch 补货错误</h1>
    <ErrorBoundary>
      <CountButton></CountButton>
    </ErrorBoundary>
  </div>)
}


export default App;