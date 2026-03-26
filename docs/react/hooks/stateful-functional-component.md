# React Stateful Functional Components: Hooks 深度解析

> 本文档详细解析 React 16.8+ 引入的 Hooks 机制，探讨如何使用 useState 和 useReducer 实现状态管理，以及其内部实现原理。

## 目录

1. [函数组件的演进](#1-函数组件的演进)
2. [useState 内部原理](#2-usestate-内部原理)
3. [Hooks 与 Fiber 节点的联系](#3-hooks-与-fiber-节点的联系)
4. [Class Component vs Functional Component + Hooks](#4-class-component-vs-functional-component--hooks)
5. [常见陷阱与最佳实践](#5-常见陷阱与最佳实践)
6. [useReducer 详解](#6-usereducer-详解)
7. [实践代码示例](#7-实践代码示例)

---

## 1. 函数组件的演进

### 1.1 早期的无状态组件

在 React 16.8 之前，函数组件被视为"无状态组件"（Stateless Components）。它们只是接收 props 并返回 JSX 的纯函数。

```jsx
// React 16.8 之前的函数组件 - 纯展示组件
// Pure presentational component before React 16.8
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

### 1.2 Hooks 的诞生背景

React 团队面临的问题：
- **逻辑复用困难**：Class 组件之间的逻辑复用需要 HOC 或 Render Props，导致组件嵌套地狱
- **复杂度增加**：Class 组件需要理解 `this`、生命周期方法、绑定等概念
- **打包体积**：Class 组件的语法转换增加了 bundle 体积

```jsx
// React 16.8+ 引入的 Hooks 改变了这一切
// Hooks introduced in React 16.8 changed everything
function Counter() {
  // useState returns [currentState, setterFunction]
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### 1.3 Hooks 的设计原则

```
Hooks 设计原则 / Design Rules:
1. 只在顶层调用 Hooks（不要在循环、条件、嵌套函数中调用）
   Call hooks at top level only (not in loops, conditions, or nested functions)
2. 只在 React 函数组件或自定义 Hook 中调用 Hooks
   Only call hooks from React function components or custom hooks
3. Hooks 名称必须以 "use" 开头
   Hook names must start with "use"
```

---

## 2. useState 内部原理

### 2.1 useState 的基本用法

```jsx
// useState 签名 / Signature
// const [state, setState] = useState(initialState);

// 基础用法 / Basic usage
const [count, setCount] = useState(0);

// 函数式初始化（适合 expensive initial state）
// Functional initialization (good for expensive initial state)
const [data, setData] = useState(() => {
  const initial = computeExpensiveValue(props.input);
  return initial;
});
```

### 2.2 setState 的语义

`setState` 函数实际上是一个"命令式"的更新函数，它告诉 React 需要更新状态。

```jsx
// setState 的几种用法 / setState variations

// 1. 直接传入新值 / Direct new value
setCount(5);

// 2. 传入更新函数（当新状态依赖旧状态时使用）
// Pass update function when new state depends on old state
setCount(prevCount => prevCount + 1);

// 3. 两者对比 - 为什么函数式更新更安全?
// Why functional update is safer?
function CounterBad() {
  const [count, setCount] = useState(0);

  // 危险：在回调中直接使用 count
  // Danger: Using count directly in callback
  const handleClick = () => {
    setCount(count + 1); // count may be stale (闭包陷阱)
  };
}

function CounterGood() {
  const [count, setCount] = useState(0);

  // 安全：使用函数式更新
  // Safe: Use functional update
  const handleClick = () => {
    setCount(prevCount => prevCount + 1);
  };
}
```

### 2.3 批量更新 (Batching)

React 18 之前，只有 React 事件处理函数中的 setState 会被批量处理。React 18 开始，所有 setState 都会被自动批量处理。

```jsx
// React 18+ 自动批量更新 / Automatic batching in React 18+
function handleClick() {
  setCount(1);      // 这些都会被批量处理
  setFlag(true);    // All these will be batched
  setLoading(false);
}

// 对比 React 17 / React 17 comparison
// 在 React 17 中，Promise、setTimeout 等中的 setState 不会批量处理
// In React 17, setState in Promise/setTimeout was NOT batched

// React 18 中，flushSync 外的所有更新都会被批量处理
// In React 18, all updates outside flushSync are batched
```

### 2.4 闭包与状态读取

```jsx
// 闭包陷阱示例 / Closure trap example
function CounterWithClosureTrap() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      // 陷阱：这里的 count 永远是 0，因为闭包捕获的是初始值
      // Trap: count here will always be 0, closure captured initial value
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []); // 空依赖数组

  return <div>Count: {count}</div>;
}

// 正确做法：使用函数式更新或 useRef
// Correct approach: Use functional update or useRef
function CounterFixed() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      // 方法1：函数式更新 / Method 1: Functional update
      setCount(prev => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <div>Count: {count}</div>;
}

// 或者使用 useRef 保存最新值 / Or use useRef to store latest value
function CounterWithRef() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  useEffect(() => {
    countRef.current = count;
  });

  useEffect(() => {
    const id = setInterval(() => {
      // 可以读取 ref 的最新值 / Can read latest value from ref
      setCount(countRef.current + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <div>Count: {count}</div>;
}
```

---

## 3. Hooks 与 Fiber 节点的联系

### 3.1 Fiber 节点结构

每个 React 元素对应一个 Fiber 节点，其中包含与 Hook 相关的重要字段：

```
Fiber 节点结构 / Fiber Node Structure:
{
  // 节点标识 / Node identification
  elementType: type of element (function component, class component, etc.)
  type: same as elementType for function components

  // 状态相关 / State related
  memoizedState: 指向 Hook 链表的指针 / Pointer to hooks linked list
  updateQueue: 更新队列 / Update queue

  // 状态 / State
  memoizedProps: 上一次渲染的 props
  pendingProps: 新的 props

  // 结构 / Structure
  child: 第一个子节点 / First child
  sibling: 下一个兄弟节点 / Next sibling
  return: 父节点 / Parent
}
```

### 3.2 Hook 链表结构

```javascript
// React 内部 Hook 结构 / Internal Hook structure
// 每个 useState/useReducer 调用都会创建一个 Hook 对象
// Each useState/useReducer call creates a Hook object

const hook = {
  memoizedState: null,      // 已记忆的状态值 / Memorized state value
  baseState: null,           // 基础状态（用于计算新状态）/ Base state for computation
  baseQueue: null,          // 基础队列 / Base queue
  queue: null,              // 待处理的更新队列 / Pending update queue
  next: null                // 指向下一个 Hook / Pointer to next hook
};
```

### 3.3 Hook 链表工作原理

```jsx
// 当函数组件调用多个 Hook 时 / When component calls multiple hooks
function Form() {
  const [name, setName] = useState('');     // Hook 1
  const [email, setEmail] = useState('');   // Hook 2
  const [password, setPassword] = useState(''); // Hook 3
  const [isValid, setIsValid] = useState(false); // Hook 4

  // React 内部创建链表 / React internally creates linked list:
  // memoizedState: nameHook -> emailHook -> passwordHook -> isValidHook -> null
}
```

### 3.4 Fiber 与 Hook 的关联

```javascript
// fiber.memoizedState 指向第一个 Hook
// fiber.memoizedState points to the first hook
const fiber = {
  // ...
  memoizedState: {
    // Hook 1
    memoizedState: 'initial name',
    queue: { pending: null },
    next: {
      // Hook 2
      memoizedState: 'initial email',
      queue: { pending: null },
      next: {
        // Hook 3
        memoizedState: 'initial password',
        queue: { pending: null },
        next: null  // 最后一个 Hook
      }
    }
  }
};
```

### 3.5 渲染过程中的 Hook 处理

```
渲染过程 / Render Process:
1. 函数组件被调用
   Function component is called
2. React 进入 Hooks 管理模式
   React enters hooks management mode
3. 遍历 memoizedState 链表，依次处理每个 Hook
   Iterate memoizedState linked list, process each hook
4. 根据 updateQueue 中的更新计算新状态
   Calculate new state from updateQueue
5. 返回新的 JSX 和更新后的 Fiber 节点
   Return new JSX and updated fiber node
```

---

## 4. Class Component vs Functional Component + Hooks

### 4.1 状态管理对比

```jsx
// ============ Class Component ============
class CounterClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    // 需要绑定方法到 this
    // Need to bind methods to this
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    // 访问状态需要使用 this.state
    // Access state via this.state
    this.setState({ count: this.state.count + 1 });
    // 或者使用函数式 setState
    // Or use functional setState
    this.setState(prevState => ({ count: prevState.count + 1 }));
  }

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.handleClick}>Increment</button>
      </div>
    );
  }
}

// ============ Functional Component with Hooks ============
function CounterFunctional() {
  // 直接获取状态和更新函数
  // Directly get state and update function
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // 不需要 this，直接使用
    // No this needed, use directly
    setCount(prev => prev + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
}
```

### 4.2 生命周期方法对比

```jsx
// ============ Class Component ============
class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: null, loading: true };
  }

  // 等价于 useEffect(() => {}, [])
  componentDidMount() {
    fetchUser(this.props.userId)
      .then(user => this.setState({ user, loading: false }));
  }

  // 等价于 useEffect(() => {}, [props.userId])
  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.loadUserData();
    }
  }

  // 等价于 useEffect(() => { return () => {} }, [])
  componentWillUnmount() {
    cleanupResources();
  }

  render() {
    // ...
  }
}

// ============ Functional Component with Hooks ============
function UserProfileFunctional({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // componentDidMount 等价
  // Equivalent to componentDidMount
  useEffect(() => {
    fetchUser(userId).then(user => {
      setUser(user);
      setLoading(false);
    });
  }, []); // 空数组表示只执行一次

  // componentDidUpdate 等价
  // Equivalent to componentDidUpdate
  useEffect(() => {
    if (user && user.id !== userId) {
      // userId 变化了
      // userId changed
    }
  }, [userId, user]);

  // componentWillUnmount 等价
  // Equivalent to componentWillUnmount
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);

  // ...
}
```

### 4.3 关键差异总结

| 特性 / Feature | Class Component | Functional + Hooks |
|---------------|-----------------|-------------------|
| 状态管理 / State | `this.state`, `this.setState` | `useState` |
| 逻辑复用 / Logic Reuse | HOC, Render Props | Custom Hooks |
| `this` 绑定 | 需要手动绑定 | 无 `this` 问题 |
| 代码量 / Code Size | 较多模板代码 | 简洁 |
| 打包体积 / Bundle | 较大 | 较小 |
| 可测试性 / Testability | 需要实例化组件 | 直接调用函数 |

---

## 5. 常见陷阱与最佳实践

### 5.1 闭包陷阱 (Stale Closure)

```jsx
// 陷阱案例 / Trap Case
function DataFetcher() {
  const [data, setData] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    // 陷阱：这里的 query 是初始值 ''
    // Trap: query here is initial value ''
    fetchData(query).then(setData);
  }, []); // 错误：空依赖数组

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {/* data 永远是 null，因为 useEffect 从不重新运行 */}
      {/* data will always be null because useEffect never re-runs */}
    </div>
  );
}

// 正确做法 / Correct approach
function DataFetcherFixed() {
  const [data, setData] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchData(query).then(setData);
  }, [query]); // 正确：依赖 query

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
    </div>
  );
}
```

### 5.2 依赖数组问题

```jsx
// 问题：遗漏依赖导致 bug
// Problem: Missing dependencies cause bugs
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    // searchAPI 可能是新函数，每次渲染都不同
    // searchAPI might be new function, different each render
    searchAPI(query).then(setResults);
  }, [query]); // 看起来正确，但...

  // ...
}

// 更隐蔽的问题：依赖数组顺序
// More subtle problem: Dependency array order
function Component() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);

  useEffect(() => {
    // 如果依赖是 [a, b]，顺序变化也会触发重新运行
    // If dependency is [a, b], order change also triggers re-run
  }, [a, b]);

  // ...
}

// 最佳实践：使用 eslint-plugin-react-hooks
// Best practice: Use eslint-plugin-react-hooks
// 它会自动检测缺失的依赖
// It automatically detects missing dependencies
```

### 5.3 setState 语义差异

```jsx
// Class Component 的 setState 是合并（merge）
// Class Component's setState merges state
this.setState({ count: 5 });
// 原来的其他状态字段保留
// Other state fields are preserved

// Functional Component 的 useState 是替换（replace）
// Functional Component's useState replaces state
setCount(5);
// 其他状态字段不会保留！
// Other state fields are NOT preserved!

// 如果需要保留其他字段，需要使用展开运算符
// If you need to preserve other fields, use spread operator
setFormData(prev => ({
  ...prev,
  count: 5
}));
```

### 5.4 对象和数组的 state 陷阱

```jsx
// 陷阱：直接修改对象
// Trap: Mutating object directly
function UserProfile() {
  const [user, setUser] = useState({ name: 'John', age: 30 });

  const updateAge = () => {
    // 错误：这是修改，不是更新！
    // Wrong: This is mutation, not update!
    user.age = 31;
    setUser(user); // React 不会重新渲染，因为对象引用没变
                  // React won't re-render because object reference unchanged
  };

  // 正确：创建新对象
  // Correct: Create new object
  const updateAgeCorrect = () => {
    setUser({ ...user, age: 31 }); // 展开并覆盖 age
  };

  // 或者使用函数式更新
  // Or use functional update
  const updateAgeFunctional = () => {
    setUser(prev => ({ ...prev, age: 31 }));
  };
}
```

### 5.5 useReducer 解决复杂状态逻辑

```jsx
// 当状态逻辑复杂时，使用 useReducer
// When state logic is complex, use useReducer
const initialState = { count: 0, step: 1 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'setStep':
      return { ...state, step: action.payload };
    case 'reset':
      return initialState;
    default:
      throw new Error('Unknown action');
  }
}

function CounterWithReducer() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}, Step: {state.step}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'setStep', payload: 10 })}>Set Step to 10</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}
```

---

## 6. useReducer 详解

### 6.1 useReducer vs useState 选择指南

```jsx
// 选择 useState 的场景 / When to use useState:
// - 简单布尔状态 (true/false)
// - Simple boolean state
// - 简单数值或字符串
// - Simple number or string
// - 状态之间逻辑独立
// - Independent logic between states

// 选择 useReducer 的场景 / When to use useReducer:
// - 相关状态形成对象或复杂结构
// - Related states form object or complex structure
// - 多个状态更新需要协调
// - Multiple state updates need coordination
// - 状态更新逻辑复杂（涉及条件、计算）
// - State update logic is complex (involves conditions, calculations)
// - 需要撤销/重做等高级功能
// - Need undo/redo features

// useReducer 签名 / useReducer signature
// const [state, dispatch] = useReducer(reducer, initialArg, init?);

// 简化用法 / Simple usage
const [state, dispatch] = useReducer(
  (state, action) => newState,
  initialState
);
```

### 6.2 useReducer 内部机制

```javascript
// useReducer 原理 / useReducer mechanism
// 类似于 useState，但状态更新通过 reducer 函数

function useReducer(reducer, initialState) {
  // 获取当前 fiber 和 hook 节点
  // Get current fiber and hook node
  const hook = mountWorkInProgressHook();

  // 初始化状态
  // Initialize state
  if (reducer === basicStateReducer) {
    // useState 的 reducer 实现
    // useState's reducer implementation
    hook.memoizedState = initialState;
  } else {
    // 自定义 reducer
    // Custom reducer
    hook.memoizedState = initialState;
  }

  // 创建派发函数
  // Create dispatch function
  const dispatch = dispatchAction.bind(null, hook, reducer);

  return [hook.memoizedState, dispatch];
}
```

### 6.3 深度理解 reducer 和 action

```jsx
// Action 设计模式 / Action design pattern
// 简单 action / Simple action
{ type: 'INCREMENT' }
{ type: 'SET_USER', payload: { name: 'John' } }
{ type: 'FETCH_START' }
{ type: 'FETCH_SUCCESS', payload: response.data }
{ type: 'FETCH_ERROR', payload: error }

// Action creators - 封装 action 创建逻辑
// Action creators - encapsulate action creation logic
const actions = {
  increment: () => ({ type: 'INCREMENT' }),
  setUser: (user) => ({ type: 'SET_USER', payload: user }),
  fetchStart: () => ({ type: 'FETCH_START' }),
  fetchSuccess: (data) => ({ type: 'FETCH_SUCCESS', payload: data }),
  fetchError: (error) => ({ type: 'FETCH_ERROR', payload: error }),
};

// 在组件中使用 / Use in component
dispatch(actions.increment());
dispatch(actions.setUser({ name: 'John' }));
```

---

## 7. 实践代码示例

### 7.1 计数器完整示例

```jsx
// 完整的计数器组件 / Complete counter component
import React, { useState, useCallback } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  // 使用 useCallback 优化，避免不必要的重新创建
  // Use useCallback for optimization, avoid unnecessary recreation
  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(prev => prev - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(0);
  }, []);

  return (
    <div className="counter">
      <h2>计数器 / Counter</h2>
      <p className="count">Count: {count}</p>
      <div className="buttons">
        <button onClick={decrement}>-</button>
        <button onClick={reset}>Reset</button>
        <button onClick={increment}>+</button>
      </div>
    </div>
  );
}

export default Counter;
```

### 7.2 表单处理示例

```jsx
// 表单处理示例 / Form handling example
import React, { useState } from 'react';

function SimpleForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = '用户名不能为空 / Username is required';
    }
    if (!formData.email.includes('@')) {
      newErrors.email = '邮箱格式不正确 / Invalid email format';
    }
    if (formData.password.length < 6) {
      newErrors.password = '密码至少6位 / Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // 使用函数式更新，避免依赖外部的 formData
    // Use functional update to avoid depending on external formData
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // 提交表单 / Submit form
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="用户名 / Username"
        />
        {errors.username && <span className="error">{errors.username}</span>}
      </div>
      <div>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="邮箱 / Email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      <div>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="密码 / Password"
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>
      <button type="submit">提交 / Submit</button>
    </form>
  );
}
```

### 7.3 自定义 Hook 示例

```jsx
// 自定义 Hook: useCounter
// Custom Hook: useCounter
function useCounter(initialValue = 0, step = 1) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(prev => prev + step);
  }, [step]);

  const decrement = useCallback(() => {
    setCount(prev => prev - step);
  }, [step]);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
}

// 使用自定义 Hook / Using custom hook
function ShoppingCart() {
  const { count: appleCount, increment: incrementApple, decrement: decrementApple } = useCounter(0, 1);
  const { count: orangeCount, increment: incrementOrange, decrement: decrementOrange } = useCounter(0, 1);

  return (
    <div>
      <div>
        <span>苹果 / Apples: {appleCount}</span>
        <button onClick={incrementApple}>+</button>
        <button onClick={decrementApple}>-</button>
      </div>
      <div>
        <span>橙子 / Oranges: {orangeCount}</span>
        <button onClick={incrementOrange}>+</button>
        <button onClick={decrementOrange}>-</button>
      </div>
    </div>
  );
}
```

### 7.4 useReducer 实现撤销/重做

```jsx
// 带撤销/重做功能的 reducer / Reducer with undo/redo
const initialState = {
  past: [],      // 过去的状态 / Past states
  present: 0,    // 当前状态 / Current state
  future: []     // 未来的状态（用于重做）/ Future states (for redo)
};

function undoableReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return {
        past: [...state.past, state.present],
        present: state.present + 1,
        future: []
      };
    case 'DECREMENT':
      return {
        past: [...state.past, state.present],
        present: state.present - 1,
        future: []
      };
    case 'UNDO':
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future]
      };
    case 'REDO':
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture
      };
    default:
      return state;
  }
}

function UndoableCounter() {
  const [state, dispatch] = useReducer(undoableReducer, initialState);

  return (
    <div>
      <p>Count: {state.present}</p>
      <button onClick={() => dispatch({ type: 'UNDO' })} disabled={state.past.length === 0}>
        撤销 / Undo
      </button>
      <button onClick={() => dispatch({ type: 'REDO' })} disabled={state.future.length === 0}>
        重做 / Redo
      </button>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
    </div>
  );
}
```

---

## 附录 A: Hooks 调用规则详解

### A.1 为什么 Hooks 必须在顶层调用？

React 依赖于 Hooks 的调用顺序来关联 fiber.memoizedState 链表。

```jsx
// 错误示例 - 条件调用导致问题
// Wrong example - Conditional call causes problems
function ConditionalHook() {
  const [hasEmail, setHasEmail] = useState(false);

  // 危险：只在条件为真时调用 Hook
  // Dangerous: Call hook only when condition is true
  if (hasEmail) {
    const [email, setEmail] = useState('');
  }

  // 这会导致 Hook 顺序不稳定
  // This causes unstable hook order
}

// 正确做法 - 使用条件 inside Hook
// Correct approach - Put condition inside Hook
function CorrectHook() {
  const [hasEmail, setHasEmail] = useState(false);
  const [email, setEmail] = useState(''); // 始终调用

  // 在 Hook 内部处理条件逻辑
  // Handle conditional logic inside the hook
  const updateEmail = (newEmail) => {
    if (hasEmail) {
      setEmail(newEmail);
    }
  };

  // 或者使用 useMemo/useCallback 处理条件
  // Or use useMemo/useCallback to handle conditions
}
```

### A.2 eslint-plugin-react-hooks 规则

```javascript
// .eslintrc 配置 / .eslintrc configuration
{
  "plugins": ["react-hooks"],
  "rules": {
    // 强制执行 Hook 规则
    // Enforce Hooks rules
    "react-hooks/rules-of-hooks": "error",

    // 验证依赖数组
    // Verify dependency arrays
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

---

## 附录 B: 性能优化技巧

### B.1 useState 的惰性初始化

```jsx
// 惰性初始化 - 只在首次渲染时执行
// Lazy initialization - Only executes on first render
function ExpensiveComponent({ items }) {
  // computeExpensiveValue 只会在初始化时调用一次
  // computeExpensiveValue will only be called once during initialization
  const [sortedItems, setSortedItems] = useState(() =>
    computeExpensiveValue(items)
  );
}

// 对比：每次渲染都执行（浪费性能）
// Comparison: Executes every render (wastes performance)
function BadComponent({ items }) {
  const [sortedItems, setSortedItems] = useState(
    computeExpensiveValue(items) // 每次渲染都执行 / Executes every render
  );
}
```

### B.2 状态分组原则

```jsx
// 好的分组：将相关的状态放在一起
// Good grouping: Put related states together
function GoodForm() {
  // 用户信息相关 - 可以用 useReducer 管理
  // User info related - can use useReducer
  const [user, setUser] = useState({ name: '', email: '' });

  // UI 状态相关 - 可以放在一起
  // UI state related - can group together
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
}

// 不好的分组：把所有状态混在一起
// Bad grouping: Mix all states together
function BadForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // 问题：如果状态不相关，分组没有意义
  // Problem: If states are unrelated, grouping makes no sense
}
```

---

## 总结

React Hooks 的引入彻底改变了函数组件的能力边界：

1. **useState** 赋予了函数组件管理本地状态的能力，通过 fiber.memoizedState 链表实现状态的持久化和正确更新

2. **useReducer** 为复杂状态逻辑提供了更可控的解决方案，特别适合状态更新有规律的场景

3. **理解闭包陷阱** 是避免 Hooks 相关 bug 的关键 - 始终使用函数式更新或正确配置依赖数组

4. **Hooks vs Class** 各有优势：Hooks 代码更简洁、更易于逻辑复用；Class 在某些复杂场景下更直观

5. **最佳实践**：合理拆分组件、使用自定义 Hook 复用逻辑、遵循 Hooks 调用规则、善用 ESLint 规则

---

> 本文档由 Claude Code 生成，仅供学习参考。
> Document generated by Claude Code for learning purposes only.
