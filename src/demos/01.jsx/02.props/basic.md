---
title: "Props 详细说明"
description: "深入了解 React Props 的使用方法和最佳实践"
tags: ["jsx", "props", "tutorial"]
---

# Props 详细说明

Props（properties 的简写）是 React 中组件间数据传递的核心机制。

## 基本概念

Props 是**只读的**，组件不能修改自己的 props。这确保了数据流的单向性和可预测性。

## 使用方式

### 1. 字符串 Props
```jsx
<Welcome name="Alice" />
```

### 2. 表达式 Props
```jsx
<Welcome name={user.name} age={user.age} />
```

### 3. 布尔值 Props
```jsx
<Button disabled={true} />
// 或者简写
<Button disabled />
```

## 右侧示例说明

右侧的示例展示了以下几种 Props 用法：

1. **字符串字面量赋值** - 直接用引号传递字符串
2. **表达式赋值** - 使用 `{}` 包裹 JavaScript 表达式
3. **布尔值处理** - 布尔 Props 的不同写法

## 最佳实践

1. **使用 PropTypes 进行类型检查**
2. **提供默认值**
3. **保持 Props 接口简洁**
4. **避免传递过多 Props**

## 高级用法

### 默认值设置
```jsx
function Button({ text = "Click me", onClick }) {
  return <button onClick={onClick}>{text}</button>;
}
```

### Props 解构
```jsx
function Welcome({ name, age, className }) {
  return <div className={className}>Hello {name}!</div>;
}
``` 