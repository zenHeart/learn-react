# React API 最佳实践

> 参考 React 官方文档，系统整理 React 常用 API 的最佳实践

## 目录

1. [Hooks 规则](#1-hooks-规则)
2. [常用 Hooks 最佳实践](#2-常用-hooks-最佳实践)
3. [自定义 Hooks](#3-自定义-hooks)
4. [React.memo/useMemo/useCallback](#4-reactmemousememousecallback)
5. [Context](#5-context)
6. [Error Boundaries](#6-error-boundaries)
7. [Portals](#7-portals)
8. [Suspense](#8-suspense)
9. [Forward Refs](#9-forward-refs)
10. [useReducer](#10-usereducer)

---

## 1. Hooks 规则

### 1.1 只在顶层调用 Hooks

**规则：** 不要在循环、条件语句或嵌套函数中调用 Hooks。

**错误示例：**
```jsx
// ❌ 错误 - 条件语句中调用
function Example({ isLoggedIn }) {
  if (isLoggedIn) {
    const [name, setName] = useState(''); // 违反规则
  }
  // ...
}
```

**正确示例：**
```jsx
// ✅ 正确 - 始终在顶层调用
function Example({ isLoggedIn }) {
  const [name, setName] = useState(''); // 始终调用
  const [isLogged, setIsLogged] = useState(isLoggedIn);
  // ...
}
```

### 1.2 只在 React 函数中调用

**规则：** 只在 React 函数组件或自定义 Hooks 中调用 Hooks。

```jsx
// ✅ 正确
function MyComponent() {
  useEffect(() => { /* ... */ });
}

// ❌ 错误 - 普通函数中调用
function ordinaryFunction() {
  useState(); // 不允许
}
```

---

## 2. 常用 Hooks 最佳实践

### 2.1 useState

**始终使用函数式更新（当新状态依赖旧状态）：**

```jsx
// ✅ 推荐
setCount(prev => prev + 1);

// ❌ 不推荐（闭包陷阱风险）
setCount(count + 1);
```

**使用 useReducer 管理复杂状态：**

```jsx
const [state, dispatch] = useReducer(reducer, initialState);

// 比多个 useState 更清晰
function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'SET_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}
```

### 2.2 useEffect

**清理副作用：**

```jsx
useEffect(() => {
  const subscription = dataSource.subscribe();
  
  return () => {
    // 清理函数 - 组件卸载时执行
    subscription.unsubscribe();
  };
}, [dataSource]);
```

**依赖数组策略：**

| 场景 | 依赖数组 | 说明 |
|------|----------|------|
| 每次渲染都执行 | `[]`（不使用） | 避免，可能导致无限循环 |
| 只在挂载时执行 | `[]` | 用于一次性初始化 |
| 特定值变化时执行 | `[value1, value2]` | 推荐方式 |
| 永远不执行 | `undefined` | 不推荐 |

### 2.3 useRef

**两种用途：**

```jsx
// 1. 存储不需要触发重新渲染的值
function Timer() {
  const intervalRef = useRef(null);
  
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      console.log('tick');
    }, 1000);
    
    return () => clearInterval(intervalRef.current);
  }, []);
}

// 2. DOM 引用
function TextInput() {
  const inputRef = useRef(null);
  
  useEffect(() => {
    inputRef.current.focus();
  }, []);
  
  return <input ref={inputRef} />;
}
```

---

## 3. 自定义 Hooks

### 3.1 命名规范

以 `use` 开头，便于 lint 工具检测。

```jsx
function useWindowSize() { /* ... */ }
function useLocalStorage(key, initialValue) { /* ... */ }
function useFetch(url) { /* ... */ }
```

### 3.2 提取逻辑而非状态

```jsx
// ✅ 好的自定义 Hook - 封装逻辑
function useUserStatus(userId) {
  const [isOnline, setIsOnline] = useState(null);
  
  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }
    
    ChatAPI.subscribe(userId, handleStatusChange);
    return () => ChatAPI.unsubscribe(userId, handleStatusChange);
  }, [userId]);
  
  return isOnline;
}
```

### 3.3 组合多个 Hooks

```jsx
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ... 认证逻辑
  
  return { user, loading, login, logout };
}

function useUserData(auth) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    if (!auth.user) return;
    fetchUserData(auth.user.id).then(setData);
  }, [auth.user]);
  
  return data;
}

// 组合使用
function UserProfile() {
  const auth = useAuth();
  const userData = useUserData(auth);
  // ...
}
```

---

## 4. React.memo/useMemo/useCallback

### 4.1 React.memo - 跳过不必要的重渲染

```jsx
// 函数组件包装
const MyComponent = React.memo(function MyComponent(props) {
  return <div>{props.name}</div>;
});

// 或使用箭头函数（需显式声明）
const MyComponent = React.memo(({ name }) => {
  return <div>{name}</div>;
});
```

**配合 useMemo 避免 props 对象重建：**

```jsx
// ❌ 每次渲染都会创建新对象
<MyComponent style={{ color: 'red' }} />

// ✅ 使用 useMemo 保持引用稳定
const style = useMemo(() => ({ color: 'red' }), []);
<MyComponent style={style} />
```

### 4.2 useMemo - 缓存计算结果

```jsx
const memoizedValue = useMemo(() => {
  // 昂贵计算
  return computeExpensiveValue(a, b);
}, [a, b]);
```

**使用场景：**
- 昂贵计算（如排序、大数据处理）
- 依赖该值的其他 Hooks
- 避免子组件不必要的渲染

### 4.3 useCallback - 缓存回调函数

```jsx
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// 传递给子组件的回调必须使用
<ChildComponent onClick={memoizedCallback} />
```

**对比：**

| Hook | 缓存内容 | 使用场景 |
|------|----------|----------|
| `useMemo` | 计算结果值 | 昂贵计算、依赖该值的逻辑 |
| `useCallback` | 回调函数 | 传递给子组件的函数、useEffect 依赖 |

---

## 5. Context

### 5.1 何时使用 Context

**适合的场景：**
- 主题、语言、用户信息等全局数据
- 组件树中多层传递的 props

**不适合的场景：**
- 频繁变化的数据（会导致大量组件重渲染）
- 可组合的组件（通过 props 传递更清晰）

### 5.2 正确使用 Context

```jsx
// 创建 Context
const ThemeContext = React.createContext('light');

// Provider 组件封装
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 消费 Context
function ThemedButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button className={theme} onClick={toggleTheme}>
      Toggle Theme
    </button>
  );
}
```

### 5.3 性能优化

```jsx
// 使用 useMemo 避免不必要的 value 重生
function CounterProvider({ children }) {
  const [count, setCount] = useState(0);
  const increment = useCallback(() => setCount(c => c + 1), []);
  
  const value = useMemo(() => ({
    count,
    increment
  }), [count, increment]);
  
  return (
    <CounterContext.Provider value={value}>
      {children}
    </CounterContext.Provider>
  );
}
```

---

## 6. Error Boundaries

### 6.1 创建 Error Boundary

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染显示错误 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误日志
    logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

### 6.2 使用 Error Boundary

```jsx
// 包装可能出错的组件
<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>

// 页面级错误处理
<ErrorBoundary>
  <PageContent />
</ErrorBoundary>
```

### 6.3 限制

- 只能捕获**渲染阶段**的错误
- 不能捕获事件处理器、异步代码、SSR 的错误
- 事件处理错误需使用 try/catch

---

## 7. Portals

### 7.1 基本用法

```jsx
const portalRoot = document.getElementById('portal-root');

function Modal({ children }) {
  return ReactDOM.createPortal(
    children,
    portalRoot
  );
}
```

### 7.2 事件冒泡处理

通过 Portals 渲染的元素，事件会冒泡到 DOM 树中最近的 React 组件。

```jsx
// 即使在 Portal 中，点击事件仍会冒泡到父组件
function Parent() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div onClick={() => setShowModal(false)}>
      <button>Open Modal</button>
      {showModal && (
        <Modal onClick={(e) => e.stopPropagation()}>
          {/* stopPropagation 阻止冒泡 */}
          <Content />
        </Modal>
      )}
    </div>
  );
}
```

---

## 8. Suspense

### 8.1 数据获取场景

```jsx
function ProfilePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProfileDetails />
      <Suspense fallback={<PhotosSkeleton />}>
        <Photos />
      </Suspense>
    </Suspense>
  );
}
```

### 8.2 配合 use() 使用

```jsx
import { use } from 'react';

function UserProfile({ userPromise }) {
  const user = use(userPromise);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </div>
  );
}

// 使用
<Suspense fallback={<Loading />}>
  <UserProfile userPromise={fetchUser()} />
</Suspense>
```

### 8.3 错误处理

```jsx
<ErrorBoundary>
  <Suspense fallback={<Loading />}>
    <SlowComponent />
  </Suspense>
</ErrorBoundary>
```

---

## 9. Forward Refs

### 9.1 基本用法

```jsx
const FancyButton = React.forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
));

// 使用 - ref 现在指向 DOM 按钮
const ref = useRef();
<FancyButton ref={ref}>Click me!</FancyButton>;
```

### 9.2 转发多个 refs

```jsx
const FancyInput = React.forwardRef((props, ref) => {
  const inputRef = useRef();
  const setRef = props.setRef;
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    value: inputRef.current.value
  }));
  
  return <input ref={inputRef} />;
});
```

### 9.3 高阶组件中的 ref 转发

```jsx
function withLogger(WrappedComponent) {
  function WithLogger(props, ref) {
    useEffect(() => {
      console.log('Component mounted');
    }, []);
    
    return <WrappedComponent {...props} ref={ref} />;
  }
  
  return React.forwardRef(WithLogger);
}
```

---

## 10. useReducer

### 10.1 基本模式

```jsx
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'RESET':
      return initialState;
    default:
      throw new Error('Unknown action');
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <div>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
    </div>
  );
}
```

### 10.2 结合 Context

```jsx
const CounterContext = React.createContext();

function CounterProvider({ children }) {
  const [state, dispatch] = useReducer(counterReducer, initialState);
  
  return (
    <CounterContext.Provider value={{ state, dispatch }}>
      {children}
    </CounterContext.Provider>
  );
}

// 子组件中使用
function CounterDisplay() {
  const { state } = useContext(CounterContext);
  return <div>Count: {state.count}</div>;
}
```

### 10.3 useReducer vs useState

| 场景 | 推荐 | 原因 |
|------|------|------|
| 简单状态（布尔、数字） | useState | 直观、简单 |
| 相关联的状态组合 | useReducer | 逻辑集中、易于测试 |
| 复杂状态逻辑 | useReducer | 避免 useEffect 依赖地狱 |
| 需要回退/重做 | useReducer | 结合 Immer 方便实现 |

---

## 附录：常见错误与最佳实践对比

| 错误写法 | 正确写法 | 说明 |
|----------|----------|------|
| `setCount(count + 1)` | `setCount(prev => prev + 1)` | 避免闭包陈旧数据 |
| `useEffect(() => { ... }, [])` 缺少清理 | 添加 return 清理函数 | 防止内存泄漏 |
| `useState({ ... })` 每次传新对象 | 使用 useState(() => ({ ... })) | 避免不必要的重渲染 |
| 在 useEffect 依赖数组中放函数 | 使用 useCallback 包装 | 确保引用稳定 |
| 大量 Context 共享 | 拆分 Context 或使用状态管理库 | 避免重渲染性能问题 |

---

## 参考资源

- [React 官方文档](https://react.dev/reference/react)
- [React Hooks 规则](https://react.dev/reference/rules/rules-of-hooks)
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
