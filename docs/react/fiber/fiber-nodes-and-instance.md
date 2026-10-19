# React Fiber 节点与函数组件实例映射关系详解

> 本文档深入解析 React Fiber 架构中，Fiber 节点如何与函数组件建立关联，以及 Hooks 状态如何存储。

## 📋 目录

1. [核心问题解答](#核心问题解答)
2. [Fiber 节点类型系统](#fiber-节点类型系统)
3. [FunctionComponent 的实例追踪机制](#functioncomponent-的实例追踪机制)
4. [Fiber 节点与函数组件的映射关系](#fiber-节点与函数组件的映射关系)
5. [Hooks 状态存储机制](#hooks-状态存储机制)
6. [完整示例：Fiber 树结构](#完整示例fiber-树结构)
7. [常见问题解答](#常见问题解答)

---

## 核心问题解答

### 问题 1: FunctionComponent 类型 fiber 没有 stateNode 属性时，React 如何追踪其对应的实例？

**答案**：对于 FunctionComponent，React **不需要**传统的实例概念。

```javascript
// 类组件（有实例）
const classComponentFiber = {
  type: ClassComponent,
  stateNode: new ClassComponent(),  // ← 指向类实例
  tag: 1  // ClassComponent
};

// 函数组件（无实例）
const functionComponentFiber = {
  type: MyFunctionComponent,  // ← type 直接指向函数本身
  stateNode: null,            // ← 函数组件不需要 stateNode
  tag: 0  // FunctionComponent
};
```

**原因**：
- 函数组件是"无状态"的，每次渲染都是重新执行函数
- React 通过 `type` 属性直接指向组件函数
- 函数组件的"状态"实际存储在 `memoizedState`（Hooks 链表）中

### 问题 2: Fiber 节点与函数组件实例的映射关系是如何建立的？

**答案**：通过 `type` + `tag` + `elementType` 三个属性建立映射。

```javascript
const fiber = {
  // 主要标识
  type: MyFunctionComponent,      // ← 指向组件函数（用于渲染）
  elementType: MyFunctionComponent, // ← 原始类型（用于热更新）
  tag: 0,                          // ← WorkTag: FunctionComponent = 0
  
  // 树结构关系
  return: parentFiber,  // ← 父 Fiber
  child: childFiber,    // ← 子 Fiber
  sibling: null,        // ← 兄弟 Fiber
  
  // Hooks 状态（这就是"实例"的真正存储位置）
  memoizedState: hook1, // ← Hooks 链表头
};
```

### 问题 3: hooks 的状态（如 useState）存储在 fiber 的哪个属性中？

**答案**：主要存储在 `memoizedState` 属性中。

```javascript
const fiber = {
  memoizedState: {           // ← Hooks 链表
    memoizedState: 0,        // ← 第一个 useState 的值
    next: {                  // ← 下一个 Hook
      memoizedState: 'hello', // ← 第二个 useState 的值
      next: null
    }
  },
  
  // 备选状态（用于某些场景）
  baseState: 0,
  
  // 更新队列
  updateQueue: {
    baseState: 0,
    firstUpdate: update1,
    lastUpdate: update2,
  }
};
```

---

## Fiber 节点类型系统

### WorkTag 完整列表

```javascript
// ReactWorkTags.js
const WorkTag = {
  FunctionComponent: 0,    // 函数组件
  ClassComponent: 1,        // 类组件
  HostRoot: 3,             // 根节点
  HostText: 6,             // 文本节点
  HostComponent: 5,        // DOM 元素（如 <div>）
  Fragment: 7,             // Fragment
  ContextConsumer: 9,       // Context 消费者
  ContextProvider: 10,     // Context 提供者
  ForwardRef: 11,          // React.forwardRef
  Profiler: 12,            // Profiler
  SuspenseComponent: 13,   // Suspense
  MemoComponent: 14,       // React.memo
  SimpleMemoComponent: 15, // 简单 memo 组件
  LazyComponent: 16,       // 懒加载组件
  IncompleteClassComponent: 17,
  DehydratedFragment: 18,
  SuspenseListComponent: 19,
 ScopeComponent: 21,
 OffscreenComponent: 22,
  LegacyHiddenComponent: 23,
};
```

### 不同类型 Fiber 的 `type` 和 `stateNode` 对比

| 组件类型 | tag | type | stateNode | 说明 |
|---------|-----|------|----------|------|
| 函数组件 | 0 | 函数引用 | `null` | type 直接指向函数 |
| 类组件 | 1 | 类引用 | 类实例 | stateNode 指向实例 |
| HostComponent | 5 | 字符串 `'div'` | DOM 元素 | stateNode 指向真实 DOM |
| HostText | 6 | `null` | `null` | 文本节点无需 stateNode |
| HostRoot | 3 | `null` | FiberRoot | 根节点的 stateNode 是 FiberRoot |
| ForwardRef | 11 | `{ render }` 对象 | `null` | 转发引用 |

---

## FunctionComponent 的实例追踪机制

### 核心概念：虚拟实例

函数组件的"实例"概念与传统类组件不同：

```
┌─────────────────────────────────────────────────────────────────┐
│ 类组件实例 vs 函数组件"实例"                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  类组件：                                                         │
│  ┌─────────────────┐                                            │
│  │ new ClassComp() │ ← 真实存在的 JavaScript 对象实例            │
│  │  this.state     │ ← 实例属性存储状态                           │
│  └────────┬────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ fiber.stateNode │ ← fiber.stateNode 指向类实例               │
│  └─────────────────┘                                            │
│                                                                 │
│  函数组件：                                                       │
│  ┌─────────────────┐                                            │
│  │ function FC()   │ ← 没有实例，每次渲染都是重新执行            │
│  │  useState()     │                                            │
│  └────────┬────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ fiber.type      │ ← 直接指向组件函数                          │
│  │ fiber.memoized  │ ← Hooks 状态存储在这里                      │
│  │   State         │                                            │
│  └─────────────────┘                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 为什么 FunctionComponent 不需要 stateNode？

```javascript
// 类组件需要实例来维持状态
class Counter extends React.Component {
  state = { count: 0 };  // ← 状态绑定在实例上
  
  render() {
    return <div>{this.state.count}</div>;
  }
}

// 函数组件不需要实例
function Counter() {
  const [count, setCount] = useState(0);  // ← 状态存储在 fiber.memoizedState
  return <div>{count}</div>;
}

// Fiber 结构对比
const classFiber = {
  type: Counter,
  stateNode: counterInstance,  // ← 指向类实例
  memoizedState: null,
};

const functionFiber = {
  type: Counter,
  stateNode: null,             // ← 函数组件不需要
  memoizedState: {             // ← Hooks 状态在这里
    memoizedState: 0,          // useState 的值
    next: null
  }
};
```

---

## Fiber 节点与函数组件的映射关系

### 三层映射机制

```
┌─────────────────────────────────────────────────────────────────┐
│                   Fiber 节点的三层映射关系                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  第1层：type（渲染时使用）                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ fiber.type = MyComponent                                │   │
│  │                                                          │   │
│  │ 在 beginWork 中：                                        │   │
│  │ if (workInProgress.tag === FunctionComponent) {          │   │
│  │   renderWithHooks(current, workInProgress,               │   │
│  │                   workInProgress.type, ...)              │   │
│  │ }                                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  第2层：elementType（热更新/懒加载使用）                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ fiber.elementType = React.memo(MyComponent)             │   │
│  │                                                          │   │
│  │ 在 resolveLazyComponent 时：                            │   │
│  │ if (elementType !== type) {                             │   │
│  │   // 处理懒加载/热更新                                   │   │
│  │ }                                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  第3层：tag（类型标识）                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ fiber.tag = 0  // FunctionComponent                     │   │
│  │                                                          │   │
│  │ switch (tag) {                                           │   │
│  │   case FunctionComponent: updateFunctionComponent();    │   │
│  │   case HostComponent: updateHostComponent();            │   │
│  │   // ...                                                │   │
│  │ }                                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 映射建立时机

```javascript
// 1. 首次渲染时，从 React Element 创建 Fiber
function createFiberFromElement(element) {
  const fiber = {
    type: element.type,           // ← 映射到组件
    elementType: element.type,     // ← 保存原始类型
    tag: workTagFor(element.type), // ← 确定 tag
    // ...
  };
  return fiber;
}

// 2. workTagFor 函数
function workTagFor(type) {
  if (typeof type === 'function') {
    // 检查是否是 forwardRef
    if (type.$$typeof === REACT_FORWARD_REF) {
      return ForwardRef;
    }
    // 检查是否是 memo
    if (type.$$typeof === REACT_MEMO) {
      return MemoComponent;
    }
    // 普通函数组件
    return FunctionComponent;
  }
  // HostComponent 等...
}
```

---

## Hooks 状态存储机制

### memoizedState：Hook 链表结构

```javascript
// 单个 Hook 的结构
const hook = {
  memoizedState: stateValue,  // ← 当前状态值
  baseState: initialState,     // ← 初始状态（某些场景使用）
  baseQueue: null,             // ← 基础更新队列
  queue: {                     // ← 挂起的更新队列
    pending: null,            // ← 等待处理的更新
    interleaved: null,
    lanes: 0,
    lastRenderedReducer: reducer,
    lastRenderedState: state,
  },
  next: nextHook,              // ← 指向下一个 Hook
};

// useState 的实现简化
function useState(initialState) {
  const hook = updateWorkInProgressHook();
  
  if (hook.memoizedState !== null) {
    // 非首次渲染，使用已有状态
    return [hook.memoizedState, dispatch];
  }
  
  // 首次渲染，初始化状态
  hook.memoizedState = initialState;
  return [initialState, dispatch];
}
```

### 多个 Hook 的链表结构

```
┌─────────────────────────────────────────────────────────────────┐
│              Fiber.memoizedState - Hook 链表结构                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  function MyComponent() {                                       │
│    const [count, setCount] = useState(0);    // Hook 1          │
│    const [name, setName] = useState('Tom');   // Hook 2          │
│    const [items, setItems] = useState([]);   // Hook 3          │
│    useEffect(() => { ... }, []);             // Hook 4          │
│    const ref = useRef(null);                 // Hook 5          │
│    // ...                                                     │
│  }                                                           │
│                                                                 │
│  fiber.memoizedState 指向链表头：                                │
│                                                                 │
│  ┌──────────────┐                                               │
│  │ Hook 1       │◄── count, setCount                            │
│  │ memoizedState: 0                                             │
│  │ next ────────►│                                               │
│  └──────────────┘                                               │
│        │                                                        │
│        ▼                                                        │
│  ┌──────────────┐                                               │
│  │ Hook 2       │◄── name, setName                              │
│  │ memoizedState: "Tom"                                        │
│  │ next ────────►│                                               │
│  └──────────────┘                                               │
│        │                                                        │
│        ▼                                                        │
│  ┌──────────────┐                                               │
│  │ Hook 3       │◄── items, setItems                           │
│  │ memoizedState: []                                            │
│  │ next ────────►│                                               │
│  └──────────────┘                                               │
│        │                                                        │
│        ▼                                                        │
│  ┌──────────────┐                                               │
│  │ Hook 4       │◄── useEffect (effect hook)                    │
│  │ memoizedState: { effect, deps }                              │
│  │ next ────────►│                                               │
│  └──────────────┘                                               │
│        │                                                        │
│        ▼                                                        │
│  ┌──────────────┐                                               │
│  │ Hook 5       │◄── ref (ref hook)                            │
│  │ memoizedState: { current: null }                            │
│  │ next ────────►│ (null - 链表结束)                            │
│  └──────────────┘                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### useState 完整数据流

```
┌─────────────────────────────────────────────────────────────────┐
│                    useState 数据流                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 首次渲染                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ fiber.memoizedState = { memoizedState: 0, next: null } │   │
│  │ 返回 [0, dispatch]                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  2. 调用 setCount(5)                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ dispatch({                                             │   │
│  │   action: 5,                                           │   │
│  │   payload: null,                                      │   │
│  │   next: null                                          │   │
│  │ })                                                     │   │
│  │ ↓                                                      │   │
│  │ enqueueUpdate(fiber.updateQueue, update)              │   │
│  │ ↓                                                      │   │
│  │ scheduleUpdateOnFiber(fiber, lane)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  3. 重新渲染时，beginWork                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ renderWithHooks(current, workInProgress, type, ...)    │   │
│  │ ↓                                                      │   │
│  │ 处理 updateQueue 中的更新                               │   │
│  │ ↓                                                      │   │
│  │ hook.memoizedState = 5  // 新值                        │   │
│  │ ↓                                                      │   │
│  │ 返回 [5, dispatch]                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### updateQueue 结构

```javascript
// updateQueue 的完整结构
const updateQueue = {
  baseState: 0,              // ← 基础状态（用于计算）
  firstUpdate: null,         // ← 第一个挂起的更新
  lastUpdate: null,          // ← 最后一个挂起的更新
  firstRenderPhaseUpdate: null,  // ← 渲染阶段内的更新
  lastRenderPhaseUpdate: null,
  
  // React 19 新增
  lanes: 0,                  // ← 相关优先级
  firstCapturedUpdate: null, // ← 被挂起的更新
  lastCapturedUpdate: null,
};

// 单个 update 的结构
const update = {
  action: 5,                 // ← setState 的参数
  payload: null,
  next: null,                // ← 链表下一项
  lane: 0,                   // ← 优先级
  priority: 0,
};
```

---

## 完整示例：Fiber 树结构

### 示例组件结构

```javascript
function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <Header />
      <Content count={count} />
    </div>
  );
}

function Header() {
  return <h1>Hello</h1>;
}

function Content({ count }) {
  return <p>Count: {count}</p>;
}
```

### 对应的 Fiber 树结构

```
┌─────────────────────────────────────────────────────────────────┐
│                     Fiber 树结构                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ HostRoot (tag=3)                                        │   │
│  │ type: null                                              │   │
│  │ stateNode: FiberRootNode  ◄── 指向 FiberRoot           │   │
│  │ child ────────────────────────────────────────────────►│   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FunctionComponent (tag=0) - App                        │   │
│  │ type: App 函数                                          │   │
│  │ stateNode: null                                         │   │
│  │ elementType: App                                        │   │
│  │ memoizedState: {                    ◄── Hooks 链表      │   │
│  │   memoizedState: 0,               // useState(0)       │   │
│  │   next: null                                           │   │
│  │ }                                                     │   │
│  │ child ────────────────────────────────────────────────►│   │
│  │ sibling: null                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│            ┌─────────────┴─────────────┐                       │
│            ▼                           ▼                        │
│  ┌─────────────────────────┐   ┌─────────────────────────┐   │
│  │ HostComponent (tag=5)   │   │ (Nothing - 多个子元素)   │   │
│  │ type: 'div'             │   │                          │   │
│  │ stateNode: <div> DOM    │   │                          │   │
│  │ child ────────────────►│   │                          │   │
│  └─────────────────────────┘   └─────────────────────────┘   │
│            │                                                      │
│            ▼                                                      │
│  ┌─────────────────────────┐   ┌─────────────────────────┐   │
│  │ FunctionComponent (5)   │   │ FunctionComponent (6)   │   │
│  │ type: Header 函数       │   │ type: Content 函数      │   │
│  │ stateNode: null         │   │ stateNode: null         │   │
│  │ memoizedState: null     │   │ memoizedState: null     │   │
│  │ (无 hooks)              │   │ (无 hooks)               │   │
│  └─────────────────────────┘   └─────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 详细属性对比表

| Fiber | tag | type | stateNode | memoizedState |
|-------|-----|------|----------|---------------|
| HostRoot | 3 | null | FiberRootNode | null |
| App (FC) | 0 | App 函数 | null | `{ memoizedState: 0, next: null }` |
| div (Host) | 5 | `'div'` | `<div>` DOM | null |
| Header (FC) | 0 | Header 函数 | null | null |
| Content (FC) | 0 | Content 函数 | null | null |
| h1 (Host) | 5 | `'h1'` | `<h1>` DOM | null |
| p (Host) | 5 | `'p'` | `<p>` DOM | null |

---

## 常见问题解答

### Q1: 为什么 FunctionComponent 的 stateNode 是 null？

**A**: 函数组件没有传统意义上的"实例"。每次渲染都是重新执行函数，状态通过 Hooks 保存在 `memoizedState` 链表中。React 只需要 `type`（指向函数）和 `memoizedState`（存储状态）就能完整管理函数组件。

### Q2: 如果有 React.memo 包装的组件，映射关系如何变化？

```javascript
const MemoizedComponent = React.memo(function MyComponent() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
});

// Fiber 结构
const fiber = {
  type: MyComponent,           // ← 内部函数
  elementType: MemoizedComponent, // ← React.memo 包装器
  tag: 14,                     // ← MemoComponent
  memoizedState: { memoizedState: 0, next: null },
};
```

### Q3: forwardRef 组件如何处理？

```javascript
const RefComponent = React.forwardRef(function MyComponent(props, ref) {
  const [count, setCount] = useState(0);
  return <div ref={ref}>{count}</div>;
});

// Fiber 结构
const fiber = {
  type: { render: MyComponent },  // ← { render: 函数 }
  elementType: RefComponent,
  tag: 11,                         // ← ForwardRef
  memoizedState: { memoizedState: 0, next: null },
};
```

### Q4: Hook 顺序为什么必须保持一致？

因为 `memoizedState` 是链表，React 通过索引来匹配 Hook：

```javascript
// 错误示例：条件调用 Hook
function BrokenComponent() {
  const [name, setName] = useState('Tom');  // Hook 1
  
  if (condition) {
    const [count, setCount] = useState(0);  // Hook 2 - 可能不执行！
    // ↑ 渲染结果：memoizedState = { name: 'Tom' }
    // ↓ 下次渲染 condition=false: memoizedState = ??? 
    //   React 期望第二个 Hook，但找不到！
  }
  
  return <div>{name}</div>;
}
```

### Q5: 自定义 Hook 的状态如何存储？

自定义 Hook 本质上还是调用 useState，所以状态仍然存储在 `memoizedState` 中：

```javascript
function useCustomHook() {
  const [value, setValue] = useState(0);  // ← 存储在 memoizedState
  const [loading, setLoading] = useState(false);
  return [value, loading];
}

function MyComponent() {
  const [val, loading] = useCustomHook();  // ← 展开为两个 useState
  // fiber.memoizedState 包含两个 Hook
}
```

---

## 总结

| 问题 | 答案 |
|------|------|
| FunctionComponent 没有 stateNode 如何追踪实例？ | 不需要追踪！函数组件无实例，通过 `type` + `memoizedState` 管理 |
| Fiber 与函数组件的映射关系？ | `type` → 函数本身，`elementType` → 原始类型，`tag` → 组件类型标识 |
| Hooks 状态存储位置？ | `memoizedState`（Hook 链表头）+ `updateQueue`（更新队列） |

**核心思想**：函数组件的"实例"是虚拟的，由 Hooks 链表（`memoizedState`）和更新队列（`updateQueue`）共同实现状态管理。
