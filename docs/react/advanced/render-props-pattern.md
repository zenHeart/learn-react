# React 实现 Vue Scoped Slot 模式完全指南

> 从 Vue scoped slot 到 React 5 种等效方案，全面解析跨框架插槽模式

---

## 1️⃣ Vue Scoped Slot 是什么？

### 基础概念

Vue 的 **Scoped Slot**（作用域插槽）是 Vue 2.6+ 引入的 `v-slot` 语法，允许插槽模板访问子组件内部的数据。

```vue
<!-- 子组件 MouseTracker.vue -->
<template>
  <div class="mouse-tracker">
    <slot :x="x" :y="y" />
  </div>
</template>

<script>
export default {
  data() {
    return { x: 0, y: 0 }
  }
}
</script>

<!-- 父组件使用 -->
<MouseTracker v-slot="{ x, y }">
  <div>鼠标位置：{{ x }}, {{ y }}</div>
</MouseTracker>
```

### 核心特点

| 特点 | 说明 |
|------|------|
| **数据流向** | 子组件 → 父组件（通过 slot props） |
| **编译产物** | 变成一个函数，参数是 slot props |
| **使用位置** | 模板任何位置，天然声明式 |
| **TypeScript 支持** | Vue 3 配合 TS 体验较好 |

### Vue 插槽演进史

```
Vue 2.5 之前：slot-scope（废弃）
     ↓
Vue 2.6+：v-slot 语法（推荐）
     ↓
Vue 3：v-slot 作为唯一方式
```

---

## 2️⃣ React 5 种等效实现

### 方案总览

| 方案 | 原理 | 代码直观性 | TypeScript 支持 | 生态成熟度 | 推荐场景 |
|------|------|-----------|----------------|-----------|---------|
| **Render Props** | 将渲染逻辑提取为函数 prop | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 通用场景 |
| **HOC** | 包装组件，注入 props | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 跨组件复用逻辑 |
| **Custom Hooks** | 抽取逻辑为 Hook | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 逻辑复用为主 |
| **Context + Hooks** | 跨层级状态传递 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 全局状态 |
| **cloneElement** | 克隆并传递 props | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | 底层 API |

---

### 方案一：Render Props（⭐⭐⭐⭐⭐ 推荐）

#### 核心思想

将**要渲染的内容**定义为一个函数，通过 prop 传递给子组件。子组件调用这个函数，传入内部状态。

#### 代码示例

```jsx
// MouseTracker.jsx
import React from 'react'

class MouseTracker extends React.Component {
  state = { x: 0, y: 0 }

  handleMouseMove = (e) => {
    this.setState({ x: e.clientX, y: e.clientY })
  }

  render() {
    return (
      <div style={{ height: '200px' }} onMouseMove={this.handleMouseMove}>
        {/* 调用 render prop，传入内部状态 */}
        {this.props.render(this.state)}
      </div>
    )
  }
}

// 使用
function App() {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <div style={{ color: 'red' }}>
          鼠标位置：{x}, {y}
        </div>
      )}
    />
  )
}
```

#### 变体：children as function

```jsx
// 用 children 代替专门的 render prop
<MouseTracker>
  {({ x, y }) => (
    <div>鼠标位置：{x}, {y}</div>
  )}
</MouseTracker>
```

#### 优势

- 状态来源完全透明，父组件完全控制渲染
- 易于理解，概念清晰
- 可组合多个 Render Props

#### 劣势

- 容易形成「包装地狱」（层层嵌套）
- 静态分析不如 Hook 直观

#### 经典库案例

- `react-router`（`<Route render={...} />`）
- `react-motion`（`<Motion render={...} />`）

---

### 方案二：HOC（Higher-Order Components）

#### 核心思想

一个**函数**，接收一个组件，返回一个增强了的新组件。高阶组件不修改原组件，而是通过**组合**的方式为其添加新 props。

#### 代码示例

```jsx
// withMousePosition.js
function withMousePosition(WrappedComponent) {
  return function EnhancedComponent(props) {
    const [position, setPosition] = React.useState({ x: 0, y: 0 })

    React.useEffect(() => {
      const handleMouseMove = (e) => {
        setPosition({ x: e.clientX, y: e.clientY })
      }
      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    // 将位置信息注入到被包装组件的 props 中
    return <WrappedComponent {...props} mousePosition={position} />
  }
}

// 使用
function StatusDisplay({ mousePosition }) {
  return (
    <div>鼠标位置：{mousePosition.x}, {mousePosition.y}</div>
  )
}

// 增强
const EnhancedStatus = withMousePosition(StatusDisplay)

// 使用增强后的组件
function App() {
  return <EnhancedStatus />
}
```

#### 优势

- 可跨多个组件复用相同逻辑
- 不改变原始组件（组合优于继承）
- 可使用装饰器语法（`@withMousePosition`）

#### 劣势

- props 命名可能冲突（如 `mousePosition` vs `position`）
- 调试时组件层级多，难以追踪
- 难以做静态类型推断（需要额外工具）

#### 经典库案例

- `react-redux`（`connect()` → `useSelector()` 已在替代它）
- `react-router`（`withRouter`）
- `material-ui`（`withStyles`）

---

### 方案三：Custom Hooks（⭐⭐⭐⭐⭐ 现代推荐）

#### 核心思想

将**逻辑**抽取到可复用的 Hook 中，组件只负责渲染。逻辑和视图分离。

#### 代码示例

```jsx
// useMousePosition.js
function useMousePosition() {
  const [position, setPosition] = React.useState({ x: 0, y: 0 })

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return position
}

// 使用
function StatusDisplay() {
  const position = useMousePosition()
  return (
    <div>鼠标位置：{position.x}, {position.y}</div>
  )
}
```

#### 优势

- 无嵌套问题，代码扁平
- TypeScript 支持极佳（返回类型自动推断）
- 可组合多个 Hook
- 逻辑复用清晰，测试友好

#### 劣势

- 需要 React 16.8+
- 不能在非组件环境使用

#### 经典库案例

- `swr`（`useSWR`）
- `react-query`（`useQuery`）
- `ahooks`（海量 Hooks）

---

### 方案四：Context + Hooks

#### 核心思想

使用 React Context 跨越组件树层级传递状态，配合 Hook 简化消费端的代码。

#### 代码示例

```jsx
// MouseContext.js
const MouseContext = React.createContext(null)

// Provider：管理状态
function MouseProvider({ children }) {
  const [position, setPosition] = React.useState({ x: 0, y: 0 })

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <MouseContext.Provider value={position}>
      {children}
    </MouseContext.Provider>
  )
}

// Consumer Hook
function useMouse() {
  const context = React.useContext(MouseContext)
  if (!context) {
    throw new Error('useMouse 必须在 MouseProvider 内使用')
  }
  return context
}

// 使用
function App() {
  return (
    <MouseProvider>
      <StatusDisplay />
    </MouseProvider>
  )
}

function StatusDisplay() {
  const position = useMouse()
  return (
    <div>鼠标位置：{position.x}, {position.y}</div>
  )
}
```

#### 优势

- 任意层级组件都能访问，无需 props 层层传递
- 配合 `useContext` 使用简洁
- 适合全局状态（如主题、用户信息、Locale）

#### 劣势

- 容易滥用，导致 Context 过多
- 性能：Context 变化会导致所有消费组件重渲染（需用 `useMemo` 优化）
- 逻辑和视图耦合度低时不如 Hook 直观

#### 适用场景

- 主题切换（Theme）
- 用户认证信息
- 国际化（i18n）
- 全局配置

---

### 方案五：cloneElement

#### 核心思想

React 内部 API，通过 `React.cloneElement` 克隆一个 React 元素，并额外附加 props。这是 React 内部实现 Context 和部分官方功能的基础 API。

#### 代码示例

```jsx
// MouseTracker.jsx
function MouseTracker({ children }) {
  const [position, setPosition] = React.useState({ x: 0, y: 0 })

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // 将 position 作为额外 props 传递给 children
  // children 可以是单个元素或数组
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { mousePosition: position })
    }
    return child
  })

  return <div>{childrenWithProps}</div>
}

// 使用
function App() {
  return (
    <MouseTracker>
      <StatusDisplay />
    </MouseTracker>
  )
}

function StatusDisplay({ mousePosition }) {
  return (
    <div>鼠标位置：{mousePosition?.x}, {mousePosition?.y}</div>
  )
}
```

#### 优势

- 接近 Vue slot 的写法习惯
- 可传递任意额外 props

#### 劣势

- 语法不够直观，cloneElement 隐藏逻辑
- 不支持传递函数渲染内容（不如 Render Props 灵活）
- **React 19 已废弃此模式**（推荐用 `children` 组合）
- 调试困难，clone 后的元素在 DevTools 中层级可能混乱

#### React 19 替代方案

```jsx
// React 19 推荐：用 <Link> 组件的模式替代
// Slot 作为组件，放在 children 位置
<MouseTracker>
  <StatusDisplay />
</MouseTracker>

// 不再需要 cloneElement
// 而是在 MouseTracker 内部这样用：
function MouseTracker({ children }) {
  // ...
  return (
    <div>
      {/* 用 Slot 模式，类似 Vue slot */}
      {children}
    </div>
  )
}
```

---

## 3️⃣ 深度对比

### Render Props vs HOC vs Hooks

| 维度 | Render Props | HOC | Custom Hooks |
|------|-------------|-----|-------------|
| ** Props 冲突** | 无（显式传递） | 有风险（需名约定） | 无 |
| **嵌套问题** | 「包装地狱」 | 「包装地狱」 | 无 |
| **静态分析** | 需额外工具 | 困难 | 好 |
| **TypeScript** | 一般 | 一般 | **最佳** |
| **学习曲线** | 平缓 | 陡峭 | 平缓 |
| **适用复杂度** | 中等 | 高 | 任意 |
| **组合方式** | 嵌套/链式 | 链式/装饰器 | Hook 组合 |

### 方案选择决策树

```
需要复用状态/逻辑？
├── 是
│   ├── 只在一个组件树内传递 → Render Props
│   ├── 跨多个不相关组件复用 → HOC 或 Custom Hooks
│   ├── 全局共享状态 → Context + Hooks
│   └── 纯逻辑复用，不需要状态 → Custom Hooks ✅
└── 否
    └── 直接在组件内管理状态即可
```

### Vue Scoped Slot → React 对照

| Vue 功能 | React 等效 |
|---------|-----------|
| `<slot :data="data" />` | `<Children {...props} />` |
| `v-slot="{ data }"` | `render={({ data }) => ...}` 或 `children({ data })` |
| 默认 slot | `children` |
| 具名 slot | 多个 render props 或 children map |
| slot scope | 函数参数自动解构 |

---

## 4️⃣ 实战：鼠标位置追踪器

下面用同一个业务场景，分别用 5 种方案实现，对比代码差异。

### 业务需求

> 追踪鼠标在页面上的位置，在多个不同 UI 组件中展示位置信息。

### 方案对比代码

#### Render Props 版本

```jsx
<MouseTracker render={({ x, y }) => <CounterUI x={x} y={y} />} />
<MouseTracker render={({ x, y }) => <CoordinateDisplay x={x} y={y} />} />
```

#### HOC 版本

```jsx
const EnhancedCounterUI = withMousePosition(CounterUI)
const EnhancedCoordDisplay = withMousePosition(CoordinateDisplay)
// 使用
<EnhancedCounterUI />
<EnhancedCoordDisplay />
```

#### Custom Hook 版本

```jsx
function CounterUI() {
  const { x, y } = useMousePosition()
  // ...
}
function CoordinateDisplay() {
  const { x, y } = useMousePosition()
  // ...
}
```

#### Context + Hook 版本

```jsx
// 顶层包裹
<MouseProvider>
  <App />
</MouseProvider>

// 任意子组件
function CoordinateDisplay() {
  const pos = useMouse()
  // ...
}
```

#### cloneElement 版本

```jsx
<MouseTracker>
  <CounterUI />
  <CoordinateDisplay />
</MouseTracker>
```

---

## 5️⃣ 最佳实践

### 1. 优先使用 Custom Hooks

> Hooks 是 React 16.8+ 后的主流方案，TypeScript 支持最佳，组合性强。

```jsx
// ✅ 推荐：逻辑清晰，类型安全
function useUserData(userId: string) {
  const [user, setUser] = useState(null)
  useEffect(() => { fetchUser(userId).then(setUser) }, [userId])
  return user
}
```

### 2. Render Props 用于纯 UI 抽象

```jsx
// ✅ 适合：UI 组件需要完全控制内部状态
<MouseTracker render={({ x, y }) => <CustomRender x={x} y={y} />} />
```

### 3. 避免 Context 滥用

```jsx
// ❌ 避免：每个状态都建 Context
// ✅ 推荐：按功能划分Context，如 ThemeContext、AuthContext
```

### 4. HOC 谨慎使用

```jsx
// ❌ 避免：多层 HOC 嵌套
// withLogger(withAuth(withRouter(ProfilePage)))

// ✅ 推荐：优先使用 Hooks 组合
function ProfilePage() {
  const router = useRouter()
  const auth = useAuth()
  const logger = useLogger()
  // ...
}
```

### 5. cloneElement 已不推荐

> React 19 已废弃，请使用 children 组合或其他方案。

---

## 6️⃣ 总结

### 一图总结

```
Vue Scoped Slot
       ↓
   子组件暴露数据给父组件
       ↓
┌──────────────────────────────────────────┐
│  React 5 种等效方案                        │
├──────────────────────────────────────────┤
│  Render Props  → UI 控制反转（经典）       │
│  HOC            → 组件增强（高阶）         │
│  Custom Hooks   → 逻辑复用（现代主流⭐）  │
│  Context+Hooks  → 跨层级传递              │
│  cloneElement   → 低层 API（已不推荐）     │
└──────────────────────────────────────────┘
```

### 推荐使用场景

| 场景 | 推荐方案 |
|------|---------|
| 新项目 / React 16.8+ | **Custom Hooks** |
| 需要完全控制渲染 | **Render Props** |
| 跨多个无关组件复用逻辑 | **HOC** 或 **Custom Hooks** |
| 全局状态（如主题） | **Context + Hooks** |
| 遗留代码维护 | **Render Props** 或原有方案 |

---

## 参考资料

- [React 官方：Render Props](https://react.dev/learn#render-props)
- [React 官方：Custom Hooks](https://react.dev/reusable-state)
- [Vue 官方：Scoped Slots](https://vuejs.org/guide/components/slots.html#scoped-slots)
- [React 官方：Context](https://react.dev/learn#context)
- [React Hooks 最佳实践](https://react.dev/learn/reusing-logic-with-custom-hooks)
