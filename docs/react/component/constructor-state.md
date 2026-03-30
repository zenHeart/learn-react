# React 构造器中调用 setState 的行为分析

## 核心结论

在 React Class 组件的**构造器（constructor）中调用 `setState()` 是反模式**，不会触发重新渲染，且会产生开发时警告。

---

## 为什么 setState 在构造器中被忽略？

### 时序问题

React 组件的生命周期分为**创建 → 挂载（mount）→ 更新（update）** 几个阶段：

```
constructor() → render() → componentDidMount()
```

构造器执行时，组件**尚未挂载**，React 尚未为该组件创建对应的 fiber 节点。`setState()` 的本质是将新的状态快照放入更新队列，而此时没有 fiber 节点来消费这个队列，因此**状态更新被静默忽略**。

### React 15 vs React 16+ 的警告

- **React 15**：组件可正常实例化，但控制台出现 `setState(...): Cannot update during an existing state transition` 警告
- **React 16+**：控制台警告 `setState()`: Attempted to set state during construction but the component has not been mounted yet`

两种版本最终效果一致——**状态不会更新，组件不会重新渲染**。

---

## 错误写法示例

```jsx
class Counter extends React.Component {
  constructor(props) {
    super(props)
    // ❌ 反模式：setState 在构造器中被忽略
    this.state = { count: 0 }
    this.setState({ count: 10 }) // 静默失败，不触发重渲染
  }
}
```

此时组件的初始状态为 `{ count: 0 }`，后续的 `setState({ count: 10 })` 被完全忽略。

---

## 正确的状态初始化方式

### 1. 直接赋值 this.state

```jsx
class Counter extends React.Component {
  constructor(props) {
    super(props)
    // ✅ 正确：构造器中直接赋值
    this.state = { count: 0 }
  }
}
```

### 2. 基于 props 计算初始状态

```jsx
class UserCard extends React.Component {
  constructor(props) {
    super(props)
    // ✅ 正确：基于 props 计算后直接赋值
    this.state = {
      fullName: `${props.firstName} ${props.lastName}`,
      isActive: props.initialStatus === 'active'
    }
  }
}
```

### 3. 复杂派生场景：getDerivedStateFromProps

当状态需要**响应 props 变化**持续派生时，使用静态方法 `getDerivedStateFromProps`：

```jsx
class UserCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      derivedName: '',
      derivedStatus: null
    }
  }

  // ✅ 正确：每次 props 变化时重新派生状态
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.name !== prevState.derivedName) {
      return {
        derivedName: nextProps.name.toUpperCase(),
        derivedStatus: nextProps.isActive ? 'active' : 'inactive'
      }
    }
    return null
  }
}
```

> **注意**：`getDerivedStateFromProps` 是**类方法**，不需要也不应该使用 `this`，其返回值用于合并/覆盖 state。

---

## 与 Vue 的关键区别对比

| 维度 | React | Vue（选项式 API）|
|------|--------|-------------------|
| data 初始化时机 | 构造器中直接赋值 `this.state = {}` | data 选项中声明 `data() { return {} }` |
| 响应式触发 | 构造函数中 `setState()` **不会**触发响应式 | data 中直接赋值**自动**触发响应式 |
| 状态更新方式 | 必须显式调用 `setState()` | 直接赋值 `this.xxx = newValue` 即触发 |
| props 派生 | 需要 `getDerivedStateFromProps` 或钩子函数 | 可通过 `watch` 或 computed 处理 |

### 具体差异说明

**React**：构造器中 `setState()` 被忽略，必须：
1. 直接赋值 `this.state`（仅限初始值）
2. 在已挂载组件中调用 `setState()` 显式触发更新

**Vue**：data 赋值即触发响应式：
```js
data() {
  return { count: 0 }
},
methods: {
  increment() {
    this.count++ // 直接修改，自动触发视图更新
  }
}
```

### 为什么 React 不能像 Vue 一样工作？

Vue 在数据变更是通过 **Proxy/Object.defineProperty** 劫持 getter/setter，自动追踪依赖并触发更新。

React 采用**显式更新模型**：状态变更必须通过 `setState()` 显式通知框架，框架才能知道"需要重新渲染"。这种设计使得更新逻辑更可预测，也便于实现时间切片、并发渲染等高级特性。

---

## 代码示例

### 完整示例：构造器中的状态初始化

```jsx
import React from 'react'

class TemperatureConverter extends React.Component {
  constructor(props) {
    super(props)
    // ✅ 基于 props 初始化状态
    this.state = {
      celsius: props.initialCelsius || 0,
      scale: props.defaultScale || 'C'
    }
  }

  toFahrenheit(celsius) {
    return (celsius * 9) / 5 + 32
  }

  handleCelsiusChange(e) {
    this.setState({ celsius: Number(e.target.value) })
  }

  render() {
    const { celsius, scale } = this.state
    const fahrenheit = scale === 'C' ? this.toFahrenheit(celsius) : celsius

    return (
      <div>
        <h2>温度转换器</h2>
        <label>
          Celsius:
          <input
            type="number"
            value={celsius}
            onChange={this.handleCelsiusChange.bind(this)}
          />
        </label>
        <p>Fahrenheit: {fahrenheit.toFixed(2)}</p>
      </div>
    )
  }
}
```

---

## 总结

| 场景 | 正确做法 |
|------|---------|
| 静态初始状态 | `this.state = { ... }` |
| 基于 props 计算初始状态 | 构造器中直接计算赋值 |
| 状态需响应 props 持续派生 | `getDerivedStateFromProps` |
| 构造器中调用 setState | ❌ 禁止使用，效果被忽略 |

> **最佳实践**：构造器是**初始化**状态的地方，不是**更新**状态的地方。保持状态的初始化和更新逻辑分离，代码更清晰，行为更可预测。
