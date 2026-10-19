# React Navigation replace 方法：willUnmount 与 mount 生命周期时序分析

> 探索 React Navigation 中 replace 方法的独特行为，以及组件生命周期事件的执行顺序

## 目录

- [核心问题](#核心问题)
- [replace vs push vs navigate 对比](#replace-vs-push-vs-navigate-对比)
- [生命周期执行顺序](#生命周期执行顺序)
- [为什么会 unmount 后于 mount？](#为什么会-unmount-后于-mount)
- [正确处理方式](#正确处理方式)
- [React Navigation 6+ 生命周期](#react-navigation-6-生命周期)
- [常见问题](#常见问题)

---

## 核心问题

**React Navigation 的 `replace` 方法行为：**

| 特性 | 说明 |
|------|------|
| 触发时机 | 替换当前路由，不保留上一个路由的堆栈 |
| 栈变化 | 栈长度不变，位置不变 |
| 上一个组件 | 会被 unmount |
| 下一个组件 | 会被 mount |

**核心疑问**：上一个组件的 `willUnmount` 是否会晚于下一个组件的 `mount`？

---

## replace vs push vs navigate 对比

### 方法对比表

| 方法 | 行为 | 栈变化 | 使用场景 |
|------|------|--------|----------|
| **push** | 添加新路由到栈顶 | 栈 +1 | 页面 A → 页面 B（保留 A） |
| **replace** | 替换当前路由 | 栈不变 | 页面 A → 页面 B（不保留 A） |
| **replaceAll** | 替换整个栈 | 栈重置为 1 | 重置导航到首页 |
| **navigate** | 跳转（有则跳转，无则添加） | 取决于是否存在 | 通用导航 |
| **goBack** | 返回上一页 | 栈 -1 | 回退操作 |
| **pop** | 弹出到指定位置 | 栈 -N | 批量回退 |
| **popToTop** | 返回栈顶 | 栈重置为 1 | 返回首页 |

### 栈变化示意

```
初始栈: [Home, Profile, Settings]

push('Dashboard')    → [Home, Profile, Settings, Dashboard]  (栈+1)
replace('Dashboard')  → [Home, Profile, Dashboard]              (栈不变，替换Settings)
navigate('Profile')  → [Home, Profile]                          (跳转到已存在的)
goBack()             → [Home, Profile]                          (栈-1)
```

---

## 生命周期执行顺序

### replace 场景的标准顺序

```
1. 新组件开始渲染
2. 旧组件 willUnmount（在确认新组件可以渲染后）
3. 新组件 mount
```

### 实际执行顺序（React 异步渲染）

由于 React 的异步渲染机制，实际顺序可能是：

```
┌─────────────────────────────────────────────────────────────┐
│  1. 新组件 render() 被调用                                  │
│  2. 新组件 commit phase 开始                                │
│  3. 旧组件 willUnmount（在确认新组件可以渲染后）              │
│  4. 新组件 mount（useEffect 执行）                          │
└─────────────────────────────────────────────────────────────┘
```

### 时序图

```
时间线 ─────────────────────────────────────────────────────►

push():
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Home    │    │ Settings │    │ Dashboard│
│  mount   │    │  mount   │    │  mount   │
└──────────┘    └──────────┘    └──────────┘
                           ▲ willUnmount

replace():
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Home    │    │ Settings │    │ Dashboard│
│  mount   │───►│ willUn-  │───►│  mount   │
│          │    │  mount   │    │          │
└──────────┘    └──────────┘    └──────────┘
                            (几乎同时发生)
```

### 关键发现

> ⚠️ **重要**：在 `replace` 场景下，`willUnmount` 和 `mount` 事件几乎同时发生，甚至可能出现 **mount 先于 unmount** 的情况。

---

## 为什么会 unmount 后于 mount？

### 原因分析

1. **React 批量处理更新**
   
   在快速连续调用 `replace` 时，React 会批量处理更新，导致生命周期事件顺序不确定。

2. **InteractionManager / LayoutAnimation 延迟**
   
   如果使用了 `InteractionManager` 或 `LayoutAnimation`，渲染可能被延迟，导致 unmount 晚于 mount。

3. **React Navigation 异步操作**
   
   React Navigation 的导航操作是异步的，在某些情况下会延迟组件的卸载。

4. **快速连续导航**
   
   在上一个导航操作完成前发起新的导航操作，可能导致生命周期事件乱序。

### 代码示例

```jsx
// ❌ 错误示例：依赖 unmount 先于 mount
function ScreenA({ navigation }) {
  useEffect(() => {
    // 假设这里有一个 WebSocket 连接
    const ws = new WebSocket('wss://api.example.com');
    
    return () => {
      // cleanup 函数
      ws.close(); // 可能在 ScreenB mount 之后才执行
    };
  }, []);
  
  return <div>Screen A</div>;
}

// ✅ 正确示例：使用 focus 事件而不是依赖 unmount
function ScreenA({ navigation }) {
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // 页面获得焦点时执行
      const ws = new WebSocket('wss://api.example.com');
      
      return () => ws.close();
    });
    
    return unsubscribe;
  }, [navigation]);
  
  return <div>Screen A</div>;
}
```

---

## 正确处理方式

### 1. 使用 useEffect 清理副作用

```jsx
function ScreenComponent() {
  useEffect(() => {
    // 副作用：订阅、定时器、WebSocket 等
    const subscription = someService.subscribe();
    
    // 返回清理函数
    return () => {
      subscription.unsubscribe();
    };
  }, []); // 空依赖数组，只在 mount/unmount 时执行
  
  return <div>Content</div>;
}
```

### 2. 使用 NavigationContainer 的 ready 状态

```jsx
import { NavigationContainer } from '@react-navigation/native';

function App() {
  const [isReady, setIsReady] = useState(false);
  
  return (
    <NavigationContainer
      onReady={() => setIsReady(true)}
    >
      {/* Navigation UI */}
    </NavigationContainer>
  );
}
```

### 3. 监听路由变化

```jsx
import { useNavigation, useRoute } from '@react-navigation/native';

function ScreenComponent() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // 监听页面获得焦点
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Screen is focused');
    });
    
    return unsubscribe;
  }, [navigation]);
  
  // 监听页面失去焦点
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      console.log('Screen is blurred');
    });
    
    return unsubscribe;
  }, [navigation]);
  
  // 监听路由参数变化
  useEffect(() => {
    console.log('Route params:', route.params);
  }, [route.params]);
  
  return <div>Content</div>;
}
```

### 4. 使用 beforeRemove 事件

```jsx
function ScreenComponent({ navigation }) {
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // 可以阻止导航
      if (!shouldLeave) {
        e.preventDefault();
      }
    });
    
    return unsubscribe;
  }, [navigation]);
  
  return <div>Content</div>;
}
```

---

## React Navigation 6+ 生命周期

### 生命周期完整列表

| 生命周期 | 触发时机 | 可取消 | 说明 |
|----------|----------|--------|------|
| **options** | 配置屏幕选项 | ❌ | 静态配置或通过 `useLayoutEffect` 动态设置 |
| **beforeRemove** | 离开屏幕前 | ✅ | 可以阻止导航操作 |
| **state change** | 导航状态变化时 | ❌ | 整个导航状态树变化 |
| **focus** | 页面获得焦点 | ❌ | 对应 `useFocusEffect` |
| **blur** | 页面失去焦点 | ❌ | 与 focus 配对 |

### beforeRemove 事件

```jsx
navigation.addListener('beforeRemove', (e) => {
  // e.data.action: 触发导航的动作
  // e.data.state: 当前导航状态
  
  if (!isFormDirty) {
    return; // 允许导航
  }
  
  // 阻止导航，显示确认对话框
  e.preventDefault();
  
  showConfirmDialog({
    message: '有未保存的更改，确定要离开吗？',
    onConfirm: () => navigation.dispatch(e.data.action),
  });
});
```

### useFocusEffect vs useEffect

```jsx
import { useFocusEffect } from '@react-navigation/native';

// useFocusEffect 在页面获得焦点时执行
useFocusEffect(
  useCallback(() => {
    // 每次获得焦点时执行
    fetchData();
    
    return () => {
      // 失去焦点时清理（但不是 unmount）
    };
  }, [])
);

// useEffect 在 mount/unmount 时执行
useEffect(() => {
  // 仅在组件挂载时执行
}, []);
```

---

## 常见问题

### Q1: replace 和 navigate 的区别是什么？

| 场景 | replace | navigate |
|------|---------|----------|
| 栈中有目标页面 | 替换当前位置 | 跳转到目标，保持当前位置 |
| 栈中无目标页面 | 添加到栈顶 | 添加到栈顶 |
| 回退行为 | 无法返回上一个页面 | 可以返回 |

### Q2: 为什么 willUnmount 和 mount 会几乎同时发生？

由于 React 的异步渲染和 React Navigation 的批处理机制，组件的卸载和挂载可能被打包在一起处理。在某些情况下，`mount` 可能先于 `willUnmount` 执行。

### Q3: 如何避免生命周期问题？

1. **不要依赖 unmount 清理关键资源** - 使用 `focus`/`blur` 事件
2. **使用 ref 跟踪状态** - 避免依赖渲染顺序
3. **使用可取消的异步操作** - 如 `AbortController`
4. **分离关注点** - 将副作用与 UI 逻辑分开

### Q4: replace 适合哪些场景？

- 用户填写表单提交后，跳转到结果页
- 登录成功后，跳转到主页（防止返回登录页）
- 404 页面重定向到正确页面
- 深层链接处理后的路由规范化

### Q5: 如何测试生命周期顺序？

```jsx
function TestScreen({ navigation, route }) {
  console.log('render');
  
  useEffect(() => {
    console.log('mount');
    return () => console.log('unmount');
  }, []);
  
  useLayoutEffect(() => {
    console.log('layout mount');
    return () => console.log('layout unmount');
  }, []);
  
  return <div>Test</div>;
}

// 使用 navigation.addListener 监听
navigation.addListener('focus', () => console.log('focus'));
navigation.addListener('blur', () => console.log('blur'));
```

---

## 总结

1. **replace** 替换当前路由，不保留历史记录
2. **willUnmount 和 mount** 可能几乎同时发生，甚至可能出现顺序颠倒
3. **不要依赖 unmount 先于 mount** - 使用 `focus`/`blur` 事件管理副作用
4. **使用 beforeRemove** 处理导航确认逻辑
5. **React Navigation 6+** 提供了更完善的生命周期管理 API

---

## 参考资料

- [React Navigation 官方文档](https://reactnavigation.org/)
- [React Navigation 生命周期](https://reactnavigation.org/docs/lifecycle)
- [React Navigation v6 迁移指南](https://reactnavigation.org/docs/upgrading-to-v6)
- [React 组件生命周期](https://react.dev/learn/lifecycle-of-reactive-effects)
