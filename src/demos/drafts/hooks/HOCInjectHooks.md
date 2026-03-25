# HOC 模式：向 Class 组件注入 Hooks

## 问题

React Hooks 只能在 **Function 组件**的顶层调用，不能在 Class 组件中使用。

> ❌ 错误示例（来自 [StackOverflow #53371356](https://stackoverflow.com/questions/53371356/how-can-i-use-react-hooks-in-react-classic-class-component)）：
>
> ```jsx
> class MyClassComponent extends React.Component {
>   render() {
>     // ❌ 这会报错！Hooks can't be called inside a class component
>     const [count, setCount] = useState(0);
>     return <div>{count}</div>;
>   }
> }
> ```

## 解决方案：HOC 注入模式

用高阶组件（Higher-Order Component）包装 Class 组件，在 wrapper 的 function 组件中使用 hooks，再将结果通过 props 传入 class 组件。

### 核心结构

```jsx
// 1. 定义 HOC：包装 + 注 props
function withCount(WrappedComponent) {
  return function WrappedWithHooks(props) {
    // ✅ 在这里正常使用所有 hooks
    const [count, setCount] = useState(0);

    useEffect(() => {
      console.log('count 变化:', count);
    }, [count]);

    // ✅ 将 hook 结果传入 class 组件
    return (
      <WrappedComponent
        count={count}
        onIncrement={() => setCount(c => c + 1)}
        {...props}
      />
    );
  };
}

// 2. 包装目标 class 组件
class LegacyClass extends React.Component {
  render() {
    // ✅ class 组件通过 this.props 接收 hook 结果
    const { count, onIncrement } = this.props;
    return (
      <div>
        <span>{count}</span>
        <button onClick={onIncrement}>+1</button>
      </div>
    );
  }
}

// 3. 得到一个"带 hook 能力"的组件
const Enhanced = withCount(LegacyClass);
```

### 链式 HOC（多个 Hook 注入）

```jsx
// 注入计数器
const withCount = (Wrapped) => (props) => { /* useState */ };

// 注入定时器
const withTimer = (Wrapped) => (props) => { /* useEffect + interval */ };

// 链式组合
const FullyEnhanced = withTimer(withCount(LegacyClass));

// 使用
<FullyEnhanced />
```

## 适用场景

| 场景 | 说明 |
|------|------|
| **渐进式迁移** | 大量 class 组件迁移到 hooks 时，逐个用 HOC 包装，无需重写 |
| **复用三方组件** | 第三方 class 组件无法修改，通过 HOC 注入自定义逻辑 |
| **逻辑复用** | 多个 class 组件需要相同 hook 逻辑时，抽取为 HOC |
| **跨架构桥接** | 在既有 class 又有 function 的项目中统一管理状态逻辑 |

## 与其他方案的对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| **HOC 注入** | 兼容 class，无需改动原组件 |  props 可能冲突，需小心命名 |
| **Render Props** | 灵活组合 | 嵌套可读性差 |
| **直接重写为 function** | 最干净 | 工作量大，有风险 |
| **封装类适配器** | 完全兼容 | 代码量增加 |

## 注意事项

1. **props 命名冲突**：HOC 注入的 props 可能与原组件 props 冲突，用展开操作符 `{...props}` 的顺序控制优先级
2. **Ref 转发**：如果需要传递 ref，需配合 `React.forwardRef` 使用
3. **静态方法继承**：HOC 不会保留原组件的静态方法，需手动继承

```jsx
// ref 转发示例
const withCount = React.forwardRef(function withCount(WrappedComponent, ref) {
  const [count, setCount] = useState(0);
  return <WrappedComponent ref={ref} count={count} onIncrement={() => setCount(c => c + 1)} />;
});
```

## 参考

- [StackOverflow: How can I use React hooks in a class component?](https://stackoverflow.com/questions/53371356/how-can-i-use-react-hooks-in-react-classic-class-component)
- [React 官方：HOC 模式](https://reactjs.org/docs/higher-order-components.html)
