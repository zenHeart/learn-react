# React 类组件异步渲染处理方案

> 本文档详细解析 React 类组件中处理异步操作的多种方案，涵盖状态更新、生命周期联动、组件卸载处理等核心问题。

## 目录

1. [核心问题概述](#1-核心问题概述)
2. [setState 回调函数](#2-setstate-回调函数)
3. [组件卸载防护](#3-组件卸载防护)
4. [AbortController 取消请求](#4-abortcontroller-取消请求)
5. [常见陷阱与解决方案](#5-常见陷阱与解决方案)
6. [React 16.3+ 生命周期变化](#6-react-163-生命周期变化)
7. [完整代码示例](#7-完整代码示例)
8. [最佳实践总结](#8-最佳实践总结)

---

## 1. 核心问题概述

### 1.1 问题背景

在 React 类组件中发起异步操作（如 `fetch`、定时器）后，异步结果返回时组件可能已经发生以下变化：

- **组件已卸载**：用户导航离开，组件被销毁
- **props 发生变化**：父组件传入不同的 props，组件重新渲染
- **多次触发**：快速的网络请求或用户频繁操作导致多次状态更新

这些问题如果不妥善处理，会导致：

- **内存泄漏**：组件已销毁但异步回调仍在执行
- **状态不一致**：显示的数据与实际不符
- **警告信息**：React 报 "Can't perform a React state update on an unmounted component"

### 1.2 异步渲染的典型场景

```jsx
// 场景一：数据获取
componentDidMount() {
  fetch('/api/user')
    .then(res => res.json())
    .then(data => this.setState({ user: data }));
}

// 场景二：定时器
componentDidMount() {
  this.timer = setInterval(() => {
    this.setState({ time: Date.now() });
  }, 1000);
}

// 场景三：订阅
componentDidMount() {
  this.subscription = eventBus.subscribe('data', (data) => {
    this.setState({ data });
  });
}
```

---

## 2. setState 回调函数

### 2.1 基本用法

`setState` 可以接受两个参数：

1. **第一个参数**：状态更新对象或更新函数
2. **第二个参数**：状态更新完成后的回调函数

```jsx
this.setState(
  { data: result },
  () => {
    // 状态更新完成后的回调
    console.log('State updated:', this.state.data);
  }
);
```

### 2.2 回调函数的执行时机

```
setState 调用
    ↓
状态更新进入调度
    ↓
组件重新渲染
    ↓
render 执行完成
    ↓
setState 回调函数执行
```

### 2.3 在异步操作中使用回调

```jsx
class UserProfile extends React.Component {
  state = {
    user: null,
    loading: true,
    error: null
  };

  componentDidMount() {
    fetch('/api/user/123')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(
        user => this.setState(
          { user, loading: false },
          () => {
            console.log('User loaded:', this.state.user);
            // 可以在这里执行依赖 user 数据的后续操作
            this.updateUI();
          }
        ),
        error => this.setState(
          { error, loading: false },
          () => console.error('Fetch error:', this.state.error)
        )
      );
  }

  updateUI() {
    // 依赖 this.state.user 的操作
    document.title = `Profile - ${this.state.user.name}`;
  }

  render() {
    const { user, loading, error } = this.state;
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    return <div>{user.name}</div>;
  }
}
```

### 2.4 setState 回调 vs Promise

| 特性 | setState 回调 | Promise.then |
|------|---------------|--------------|
| 执行时机 | 状态更新并渲染后 | 异步操作完成后 |
| 依赖渲染 | ✅ 是 | ❌ 否 |
| 链式调用 | 需要嵌套 | 更优雅 |
| 错误处理 | 需要在 catch 中处理 | 单独的 catch |

```jsx
// 使用 Promise（不推荐在 setState 后立即读取状态）
fetchData()
  .then(data => {
    this.setState({ data });
    // 这里读取 this.state.data 可能不是最新值
    console.log(this.state.data); // 可能不是 data
  });

// 使用 setState 回调（确保状态已更新）
fetchData()
  .then(data => {
    this.setState(
      { data },
      () => {
        // 此时状态一定是最新值
        console.log(this.state.data); // 一定是 data
      }
    );
  });
```

---

## 3. 组件卸载防护

### 3.1 mounted 标志位

最简单直接的方法是使用一个实例属性作为标志位：

```jsx
class DataFetcher extends React.Component {
  state = { data: null };
  
  // 添加 mounted 标志
  _mounted = false;

  componentDidMount() {
    this._mounted = true;
    this.fetchData();
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  fetchData() {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        // 在更新状态前检查标志
        if (this._mounted) {
          this.setState({ data });
        }
      })
      .catch(error => {
        if (this._mounted) {
          this.setState({ error });
        }
      });
  }

  render() {
    return <div>{this.state.data}</div>;
  }
}
```

### 3.2 为什么不使用 this.state？

```jsx
// ❌ 错误：this.state 也不能依赖
componentDidUpdate(prevProps, prevState) {
  if (!this.state.mounted) return; // 这不起作用！
}

// ✅ 正确：使用实例属性
componentDidUpdate(prevProps, prevState) {
  if (!this._mounted) return; // 这样才能正确工作
}
```

原因：`this.state` 在组件更新过程中可能已经被新的渲染覆盖，而实例属性 `_mounted` 始终引用的是当前组件实例的标志。

### 3.3 componentDidUpdate 中的防护

如果需要在 `componentDidUpdate` 中发起新的异步请求：

```jsx
componentDidUpdate(prevProps) {
  // 检查 props 变化
  if (prevProps.userId !== this.props.userId) {
    // 使用 mounted 标志
    if (this._mounted) {
      this.setState({ loading: true });
      this.fetchUserData(this.props.userId);
    }
  }
}
```

---

## 4. AbortController 取消请求

### 4.1 基本用法

`AbortController` 是 Web API，用于取消异步操作：

```jsx
class UserFetcher extends React.Component {
  state = { user: null };
  _controller = null;

  componentDidMount() {
    this._controller = new AbortController();
    this.fetchUser();
  }

  componentWillUnmount() {
    // 取消正在进行的请求
    this._controller.abort();
  }

  fetchUser() {
    const { userId } = this.props;
    
    fetch(`/api/users/${userId}`, {
      signal: this._controller.signal
    })
      .then(res => res.json())
      .then(user => this.setState({ user }))
      .catch(err => {
        // 如果是取消操作，err.name === 'AbortError'
        if (err.name !== 'AbortError') {
          this.setState({ error: err.message });
        }
      });
  }

  render() {
    return <div>{this.state.user?.name}</div>;
  }
}
```

### 4.2 AbortController 优势

| 特性 | mounted 标志 | AbortController |
|------|-------------|-----------------|
| 取消网络请求 | ❌ | ✅ |
| 节省带宽 | ❌ | ✅ |
| 停止定时器 | ❌ | ❌ (需单独处理) |
| 实现复杂度 | 低 | 中 |

### 4.3 组合使用方案

推荐同时使用 mounted 标志和 AbortController：

```jsx
class DataFetcher extends React.Component {
  state = { data: null, error: null };
  _mounted = false;
  _controller = null;

  componentDidMount() {
    this._mounted = true;
    this._controller = new AbortController();
    this.fetchData();
  }

  componentWillUnmount() {
    this._mounted = false;
    this._controller?.abort();
  }

  fetchData() {
    const url = this.getFetchUrl();
    
    fetch(url, { signal: this._controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(
        data => {
          if (this._mounted) {
            this.setState({ data, error: null });
          }
        },
        error => {
          if (error.name !== 'AbortError' && this._mounted) {
            this.setState({ error: error.message });
          }
        }
      );
  }

  componentDidUpdate(prevProps) {
    if (prevProps.url !== this.props.url) {
      this.fetchData();
    }
  }

  render() {
    const { data, error } = this.state;
    if (error) return <div className="error">{error}</div>;
    if (!data) return <div className="loading">Loading...</div>;
    return <div>{JSON.stringify(data)}</div>;
  }
}
```

### 4.4 取消其他异步操作

AbortController 主要用于 fetch，对于其他异步操作：

```jsx
class TimerComponent extends React.Component {
  _intervalId = null;
  _mounted = false;

  componentDidMount() {
    this._mounted = true;
    this._intervalId = setInterval(() => {
      if (this._mounted) {
        this.setState({ time: Date.now() });
      }
    }, 1000);
  }

  componentWillUnmount() {
    this._mounted = false;
    if (this._intervalId) {
      clearInterval(this._intervalId);
    }
  }

  render() {
    return <div>{new Date(this.state.time).toLocaleTimeString()}</div>;
  }
}
```

---

## 5. 常见陷阱与解决方案

### 5.1 闭包问题

#### 问题描述

异步回调中的 `this` 可能不是组件实例：

```jsx
// ❌ 错误：setTimeout 回调中的 this 是 window 或 undefined
componentDidMount() {
  setTimeout(function() {
    this.setState({ loaded: true }); // 报错！
  }, 1000);
}

// ✅ 正确：使用箭头函数
componentDidMount() {
  setTimeout(() => {
    this.setState({ loaded: true });
  }, 1000);
}

// ✅ 正确：使用 bind
componentDidMount() {
  setTimeout(function() {
    this.setState({ loaded: true });
  }.bind(this), 1000);
}
```

#### 早绑定 vs 晚绑定

```jsx
class Counter extends React.Component {
  state = { count: 0 };

  // 早绑定：在 constructor 中 bind
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState({ count: this.state.count + 1 });
  }

  // 或者使用箭头函数（推荐）
  // handleClick = () => { ... }
}
```

### 5.2 状态更新时机

#### 函数式更新 vs 对象式更新

```jsx
// 对象式更新：依赖 this.state
this.setState({ count: this.state.count + 1 });

// 函数式更新：更安全
this.setState(prevState => ({ count: prevState.count + 1 }));
```

**什么时候必须用函数式更新？**

```jsx
// 当新状态依赖旧状态时
this.setState(prevState => ({
  count: prevState.count + 1
}));

// 当有多个状态更新时（避免状态丢失）
this.setState(prevState => ({
  ...prevState,
  x: prevState.x + 1,
  y: prevState.y + 1
}));

// 在异步回调中（避免闭包捕获旧状态）
fetchData().then(data => {
  this.setState(prevState => ({
    items: [...prevState.items, data]
  }));
});
```

### 5.3 状态合并问题

Class 组件的 `setState` 会**合并**状态（浅合并）：

```jsx
state = {
  user: { name: 'John', age: 30 },
  loading: true
};

// 只更新 user
this.setState({
  user: { name: 'Jane' } // loading 保留！
});

// loading 会被保留，但 user.name 会丢失！
// 需要手动展开
this.setState({
  user: { ...this.state.user, name: 'Jane' }
});
```

### 5.4 多次快速请求问题

```jsx
// 问题：用户快速点击或多个请求同时返回
componentDidMount() {
  fetch('/api/data').then(res => res.json()).then(data => {
    this.setState({ data });
  });
}

// 解决方案：请求 ID 标记
_currentRequestId = 0;

fetchData() {
  const requestId = ++this._currentRequestId;
  
  fetch('/api/data')
    .then(res => res.json())
    .then(data => {
      // 检查是否是最新请求
      if (requestId === this._currentRequestId) {
        this.setState({ data });
      }
    });
}
```

---

## 6. React 16.3+ 生命周期变化

### 6.1 新的生命周期

| 旧版生命周期 | 新版生命周期 | 说明 |
|-------------|-------------|------|
| componentWillMount | - | 已被废弃 |
| componentWillReceiveProps | getDerivedStateFromProps | 静态方法，更安全 |
| componentWillUpdate | - | 已被废弃 |
| componentDidUpdate | componentDidUpdate | 保持不变 |
| componentDidCatch | componentDidCatch | 保持不变 |

### 6.2 getDerivedStateFromProps

```jsx
// ❌ 旧版：componentWillReceiveProps
componentWillReceiveProps(nextProps) {
  if (nextProps.userId !== this.props.userId) {
    this.setState({ userId: nextProps.userId });
  }
}

// ✅ 新版：getDerivedStateFromProps
static getDerivedStateFromProps(props, state) {
  if (props.userId !== state.prevUserId) {
    return {
      userId: props.userId,
      prevUserId: props.userId
    };
  }
  return null;
}
```

### 6.3 错误边界

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}
```

---

## 7. 完整代码示例

### 7.1 数据获取组件

```jsx
/**
 * 用户数据获取组件
 * 演示：mounted 标志 + AbortController + setState 回调
 */
class UserProfile extends React.Component {
  state = {
    user: null,
    loading: true,
    error: null
  };
  
  _mounted = false;
  _controller = null;
  _requestId = 0;

  static defaultProps = {
    userId: null
  };

  componentDidMount() {
    this._mounted = true;
    this._controller = new AbortController();
    this.fetchUser(this.props.userId);
  }

  componentWillUnmount() {
    this._mounted = false;
    this._controller?.abort();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchUser(this.props.userId);
    }
  }

  fetchUser(userId) {
    if (!userId) {
      this.setState({
        user: null,
        loading: false,
        error: null
      });
      return;
    }

    this.setState({ loading: true, error: null });
    
    const requestId = ++this._requestId;
    
    fetch(`/api/users/${userId}`, {
      signal: this._controller.signal
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(
        user => {
          // 确保是最新请求且组件已挂载
          if (requestId === this._requestId && this._mounted) {
            this.setState(
              { user, loading: false },
              () => {
                // 状态更新后的回调
                console.log('User loaded successfully');
                this.onUserLoaded(user);
              }
            );
          }
        },
        error => {
          if (error.name !== 'AbortError' && this._mounted) {
            this.setState(
              { error: error.message, loading: false },
              () => console.error('Failed to load user:', error)
            );
          }
        }
      );
  }

  onUserLoaded(user) {
    // 可以在回调中执行依赖 user 的操作
    document.title = `Profile - ${user.name}`;
  }

  render() {
    const { user, loading, error } = this.state;

    if (loading) {
      return (
        <div className="user-profile loading">
          <Spinner />
          <p>Loading user profile...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="user-profile error">
          <ErrorMessage message={error} />
          <button onClick={() => this.fetchUser(this.props.userId)}>
            Retry
          </button>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="user-profile empty">
          <p>No user selected</p>
        </div>
      );
    }

    return (
      <div className="user-profile">
        <Avatar src={user.avatar} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.bio}</p>
        <UserStats stats={user.stats} />
      </div>
    );
  }
}
```

### 7.2 实时数据订阅组件

```jsx
/**
 * 实时数据订阅组件
 * 演示：定时器 + 订阅取消 + 状态管理
 */
class LiveDataFeed extends React.Component {
  state = {
    data: [],
    connected: false,
    error: null
  };

  _mounted = false;
  _intervalId = null;
  _subscriptionId = null;

  componentDidMount() {
    this._mounted = true;
    this.connect();
  }

  componentWillUnmount() {
    this._mounted = false;
    this.disconnect();
  }

  connect() {
    // 模拟 WebSocket 连接
    this._subscriptionId = eventBus.subscribe(
      'data',
      this.handleDataUpdate
    );

    // 定期拉取
    this._intervalId = setInterval(() => {
      if (this._mounted) {
        this.fetchLatestData();
      }
    }, 5000);

    if (this._mounted) {
      this.setState({ connected: true });
    }
  }

  disconnect() {
    if (this._subscriptionId) {
      eventBus.unsubscribe(this._subscriptionId);
      this._subscriptionId = null;
    }

    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  handleDataUpdate = (data) => {
    if (this._mounted) {
      this.setState(prevState => ({
        data: [...prevState.data.slice(-99), data]
      }));
    }
  };

  fetchLatestData() {
    fetch('/api/latest')
      .then(res => res.json())
      .then(
        data => {
          if (this._mounted) {
            this.setState(prevState => ({
              data: [...prevState.data.slice(-99), data]
            }));
          }
        },
        error => {
          if (this._mounted) {
            this.setState({ error: error.message });
          }
        }
      );
  }

  render() {
    const { data, connected, error } = this.state;

    return (
      <div className="live-feed">
        <div className="status">
          <span className={`indicator ${connected ? 'connected' : 'disconnected'}`} />
          {connected ? 'Connected' : 'Disconnected'}
        </div>

        {error && <div className="error">{error}</div>}

        <div className="data-list">
          {data.map((item, index) => (
            <DataItem key={item.id || index} data={item} />
          ))}
        </div>
      </div>
    );
  }
}
```

---

## 8. 最佳实践总结

### 8.1 核心原则

1. **始终检查 mounted 状态**：在异步回调中更新状态前检查组件是否仍挂载
2. **取消不必要的操作**：在 `componentWillUnmount` 中清理定时器、取消请求、取消订阅
3. **使用函数式更新**：当新状态依赖旧状态时使用 `prevState => ...`
4. **处理错误情况**：异步操作必须有错误处理逻辑

### 8.2 推荐模式

```jsx
class AsyncComponent extends React.Component {
  _mounted = false;
  _controller = null;

  componentDidMount() {
    this._mounted = true;
    this._controller = new AbortController();
    this.performAsyncOperation();
  }

  componentWillUnmount() {
    this._mounted = false;
    this._controller?.abort();
    // 清理其他资源
  }

  performAsyncOperation = () => {
    someAsyncTask()
      .then(result => {
        if (this._mounted) {
          this.setState(
            { result, loading: false },
            this.onStateUpdated
          );
        }
      })
      .catch(error => {
        if (this._mounted) {
          this.setState(
            { error: error.message, loading: false },
            this.onErrorHandled
          );
        }
      });
  };

  onStateUpdated = () => {
    // 状态更新完成后的逻辑
  };

  onErrorHandled = () => {
    // 错误处理后的逻辑
  };
}
```

### 8.3 检查清单

- [ ] 异步回调中检查 `this._mounted` 或 `this._isMounted`
- [ ] `componentWillUnmount` 中清理定时器
- [ ] 使用 `AbortController` 取消 fetch 请求
- [ ] 取消事件订阅
- [ ] 使用函数式更新 `prevState => ...` 当依赖旧状态
- [ ] 展开旧状态对象 `{ ...prevState, newData }`
- [ ] 处理错误情况
- [ ] 在 setState 回调中执行依赖最新状态的操作

### 8.4 迁移到 Hooks

如果你正在考虑迁移到函数组件和 Hooks，以下是对应的模式：

| Class Component | Functional Component + Hooks |
|----------------|------------------------------|
| `this.state` | `useState` |
| `this.setState` | `useState` setter |
| `componentDidMount` | `useEffect(() => {...}, [])` |
| `componentWillUnmount` | `useEffect(() => {...}, [])` return |
| `componentDidUpdate` | `useEffect(() => {...}, [dep])` |
| mounted 标志 | `useRef` + effect cleanup |
| `AbortController` | `AbortController` in effect |

```jsx
// Hooks 版本
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 使用 useRef 存储 abort controller
  const controllerRef = useRef(null);

  useEffect(() => {
    // 每次 effect 执行时创建新的 AbortController
    controllerRef.current = new AbortController();
    
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${userId}`, {
          signal: controllerRef.current.signal
        });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Cleanup: 取消请求
    return () => {
      controllerRef.current?.abort();
    };
  }, [userId]);

  // ... render
}
```

---

## 相关资源

- [React 官方文档 - State and Lifecycle](https://react.dev/learn/state-and-lifecycle)
- [React 官方文档 - Updating State](https://react.dev/learn/updating-state)
- [MDN - AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [使用衍生状态和替换生命周期方法](https://react.dev/blog/2018/03/27/update-on-async-rendering)

---

*本文档为 React 类组件异步处理的全面指南，涵盖从基础概念到高级模式的完整知识体系。*
