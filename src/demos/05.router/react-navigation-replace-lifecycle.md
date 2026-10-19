# React Navigation replace 生命周期顺序

> React Navigation 中 replace vs push 的区别，以及 willUnmount 和 mount 的执行顺序

## 核心概念

### 导航方法对比

| 方法 | 行为 | 栈变化 | back() 可返回 |
|------|------|--------|--------------|
| `push()` | 添加新路由到栈顶 | 栈 +1 | ✅ |
| `replace()` | 替换当前路由 | 栈不变 | ❌ |
| `navigate()` | 跳转（有则跳转，无则添加）| 取决于是否存在 | ✅ |
| `goBack()` | 返回上一页 | 栈 -1 | — |

### replace vs push 核心区别

```tsx
// push — 会在历史记录中添加一条
navigate('/page-a');
// 或
navigate('/page-a', { replace: false }); // 默认

// replace — 替换当前记录，不添加新历史
navigate('/page-a', { replace: true });
// 或（在 v6 中等效于 navigate）
history.replace('/page-a');
```

---

## 生命周期执行顺序

### 典型顺序（Home → PageA）

**使用 push('/page-a') 时：**

```
1. [PageA] componentDidMount / useEffect(() => {}, [])
2. [Home] componentWillUnmount / useEffect cleanup
```

栈变化：`[Home]` → `[Home, PageA]`，Home 被 push 到栈中但保留，PageA 添加到栈顶。

**使用 replace('/page-a') 时：**

```
1. [Home] componentWillUnmount / useEffect cleanup
2. [PageA] componentDidMount / useEffect(() => {}, [])
```

栈变化：`[Home]` → `[PageA]`，Home 被替换为 PageA。

### React 异步渲染的影响

React 的渲染管线是异步的（非阻塞的），这意味着生命周期执行顺序可能略有不同：

```tsx
// 如果新组件渲染较快
Home unmount → PageA mount  // 严格顺序

// 如果新组件渲染较慢（复杂组件）
Home unmount → (等待 PageA 渲染完成) → PageA mount  // 中间可能有延迟
```

**关键结论：旧组件的 unmount 总是发生在新组件 mount 之前或同时，不会出现新组件 mount 后旧组件才 unmount 的情况。**

---

## 常见问题

### 问题 1：快速连续调用 replace 导致竞态

```tsx
// ❌ 错误：快速连续调用 replace
navigate('/page-a', { replace: true });
navigate('/page-b', { replace: true }); // 可能在第一个还没完成时就触发

// ✅ 正确：使用 navigate 链式调用
navigate('/page-a');
// 在 useEffect 中根据条件判断是否继续导航
```

**解决方案：使用 Navigation Hook 的返回函数取消或使用 `navigation.reset`**

```tsx
// 使用 navigation.reset 重置整个栈
navigation.reset({
  index: 0,
  routes: [{ name: 'PageA' }],
});
```

### 问题 2：willUnmount 和 mount 同时触发时的数据传递

如果需要在 unmount 前保存数据到 mount 后才能访问的位置：

```tsx
// PageA 组件
useEffect(() => {
  return () => {
    // ❌ 错误：这里保存的数据，PageB 可能还访问不到
    saveData({ from: 'PageA' });
  };
}, []);

// ✅ 正确：使用共享状态（Context / Redux / 父组件状态）
const { sharedData, setSharedData } = useSharedContext();
useEffect(() => {
  return () => {
    setSharedData({ from: 'PageA', ready: true });
  };
}, []);

// PageB 监听
useEffect(() => {
  if (sharedData.from === 'PageA' && sharedData.ready) {
    // 安全访问 PageA 保存的数据
  }
}, [sharedData]);
```

### 问题 3：在 unmount 时发起异步请求

```tsx
// ❌ 危险：组件卸载后 setState 会导致内存泄漏警告
useEffect(() => {
  fetchData().then(data => setState(data)); // 组件可能已卸载
}, []);

// ✅ 正确：使用 cleanup 或 AbortController
useEffect(() => {
  const controller = new AbortController();
  fetchData({ signal: controller.signal })
    .then(data => setState(data))
    .catch(err => {
      if (err.name !== 'AbortError') throw err;
    });
  return () => controller.abort();
}, []);
```

---

## 生命周期时序图

```
push('/page-a') 场景:
┌─────────────────────────────────────────────────────────┐
│  Home (mount)                                           │
│    │                                                    │
│    │ navigate('/page-a')                                │
│    ▼                                                    │
│  PageA (mount) ──────────────────────────────────────► │
│    │                                                    │
│    │ <-- PageA 完全渲染后，Home 才 unmount              │
│    ▼                                                    │
│  Home (unmount)                                         │
└─────────────────────────────────────────────────────────┘

replace('/page-a') 场景:
┌─────────────────────────────────────────────────────────┐
│  Home (mount)                                           │
│    │                                                    │
│    │ navigate('/page-a', { replace: true })            │
│    ▼                                                    │
│  Home (unmount) ──────────────────────────────────────►│
│    │                                                    │
│    ▼                                                    │
│  PageA (mount)                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Vue Router 对比（迁移参考）

| React Navigation | Vue Router | 说明 |
|-----------------|-----------|------|
| `navigate('/path')` | `router.push('/path')` | 导航到新路由 |
| `navigate('/path', { replace: true })` | `router.replace('/path')` | 替换当前路由 |
| `navigate(-1)` | `router.go(-1)` | 返回 |
| `navigate(0)` | （无直接等效） | 刷新当前路由 |

### Vue Router 的 beforeRouteLeave vs mounted

```js
// Vue Router
beforeRouteLeave(to, from, next) {
  // 导航离开前触发
  // 类似于 React 的 useEffect cleanup
  next();
}
```

**关键区别**：Vue Router 的 `beforeRouteLeave` 是同步的（在导航确认前执行），React Navigation 的 `useEffect cleanup` 是异步的。

---

## 最佳实践

### 1. 使用 navigation.reset 重置栈

```tsx
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// 在需要完全替换历史时
navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});
```

### 2. 使用 useFocusEffect 进行数据获取

```tsx
import { useFocusEffect } from '@react-navigation/native';

// 只有屏幕获得焦点时才执行
useFocusEffect(
  React.useCallback(() => {
    fetchData();
    return () => {}; // cleanup
  }, [])
);
```

### 3. 监听导航状态变化

```tsx
useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    // 屏幕获得焦点
  });
  return unsubscribe;
}, [navigation]);
```

---

## 参考资料

- [React Navigation 官方文档 - Navigation actions](https://reactnavigation.org/docs/navigation-actions)
- [React Navigation - Stack Navigator](https://reactnavigation.org/docs/stack-navigator)
- [React Navigation - Managing screen state](https://reactnavigation.org/docs/screen-state)
