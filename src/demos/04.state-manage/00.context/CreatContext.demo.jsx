import React from 'react'

// 创建一个 context 变量组件,默认值为 dark
const ThemeContext = React.createContext('dark')
function CreatElement () {
  return (
    <div>
      <h2> React.createContext 使子孙节点可获得祖先节点属性</h2>
      <ul>
        <li>
          <h3>祖先节点使用 Context.Provider 提供值</h3>
          <ul>
            <li>1. 使用 React.createContext 创建常量</li>
            <li>2. 使用 Context.Provider 提供值</li>
            <li>3. 类组件设置 contextType 静态变量绑定 context</li>
            <li>4. 类组件使用 thi.context 访问状态</li>
          </ul>
          <ThemeContext.Provider value='light'>
            <A></A>
          </ThemeContext.Provider>
        </li>
        <li>
          <h3>祖先节点使用 Context.Provider 提供值</h3>
          <ul>
            <li>1. 使用 React.createContext 创建常量</li>
            <li>2. 使用 Context.Provider 提供值</li>
            <li>3. 类组件设置 contextType 静态变量绑定 context</li>
            <li>4. 类组件使用 thi.context 访问状态</li>
          </ul>
          <li>
            <h3>利用类组件修改 context 的值</h3>
            <ul>
              <li>1. 避免采用字面量对象在 provider 中</li>
            </ul>
            <Parent></Parent>
          </li>
        </li>
      </ul>
    </div>
  )
}
CreatElement.text = 'React.createContext'

class Parent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      theme: 'light'
    }
  }
  render () {
    return (
      <ThemeContext.Provider value={this.state.theme}>
        <A></A>
        <input
          type='text'
          onChange={e => {
            this.setState({
              theme: e.target.value
            })
          }}
        />
      </ThemeContext.Provider>
    )
  }
}

function A () {
  return (
    <p>
      <B></B>
    </p>
  )
}

class B extends React.Component {
  // 绑定 context
  static contextType = ThemeContext
  render () {
    // 消费 context
    return <span>{this.context}</span>
  }
}
export default CreatElement
