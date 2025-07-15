---
title: "动态 Context 详解"
description: "深入了解 React Context 的动态用法和最佳实践"
tags: ["state", "context", "dynamic"]
---

# 动态 Context 详解

本示例展示了如何创建可以动态修改的 React Context。

## 核心概念

### Context 解决的问题
1. **Props Drilling** - 避免在组件树中逐级传递 props
2. **全局状态管理** - 在组件树中共享状态
3. **主题切换** - 动态改变应用的主题

### 实现步骤

#### 1. 创建 Context
```jsx
// theme-context.js
import React from 'react'
export const themes = {
  light: {
    background: '#fefefe',
    color: '#888',
    padding: '10px'
  },
  dark: {
    background: '#333',
    color: '#f3f3f3',
    padding: '10px'
  }
}

export default React.createContext(themes.light)
```

#### 2. 提供 Context
使用 `Context.Provider` 包裹组件树，并提供 `value` 属性。

#### 3. 消费 Context
- **函数组件**：使用 `Context.Consumer` 或 `useContext` Hook
- **类组件**：使用 `static contextType` 或 `Context.Consumer`

## 右侧示例说明

右侧的示例展示了：

1. **Context 定义** - 在 `theme-context.js` 中定义主题
2. **Provider 使用** - 在 App 组件中提供 Context
3. **Consumer 使用** - 在 ThemeButton 组件中消费 Context
4. **动态更新** - 通过按钮切换主题

## 关键特性

### 动态 Context 的核心
- **状态提升** - 将 Context 值存储在组件的 state 中
- **函数传递** - 通过 Context 传递修改函数
- **事件处理** - 子组件通过事件修改 Context

### 最佳实践
1. **合理使用** - 不要过度使用 Context
2. **性能考虑** - 避免频繁的 Context 更新
3. **类型安全** - 使用 TypeScript 定义 Context 类型
4. **默认值** - 为 Context 提供有意义的默认值

## 常见问题解答

### Q1: 为什么 createContext 需要初始值？
> 初始值用于处理组件不在 Provider 包裹范围内的情况。

### Q2: 如何修改 Context 的值？
> 通过 Provider 的 value 属性传递 state 和修改函数。

### Q3: 类组件如何使用 Context？
> 使用 `static contextType` 绑定 Context，然后通过 `this.context` 访问。