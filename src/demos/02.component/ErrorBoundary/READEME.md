# 错误捕获组件

## 知识点
1. 自定义插槽组件处理内层组件的渲染错误
   1. 采用 componentDidCatch 捕获子组件渲染错误
      1. 返回两个参数
         1. 参数 1 为内部抛出的 error 对象
         2. 参数 2 为 react 返回的渲染信息，componentStack 字段返回错误的渲染组件结构
2. 组件外层包裹错误组件处理渲染异常
3. 使用限制
   1. 只能捕获渲染错误，事件监听内部错误无法捕获
   2. 只能捕获子组件，外层或 Error 自身错误无法处理

官方示例参见 [error boundary](https://codepen.io/gaearon/pen/wqvxGa?editors=0010)