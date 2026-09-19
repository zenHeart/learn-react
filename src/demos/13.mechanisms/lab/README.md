# 状态队列与身份：源码机制复现

案例性质：依据 React 官方行为合同设计的机制实验。前置：函数、闭包、数组归约、组件与 state、事件更新、key。运行时由锁文件固定 React 19.1.0；源码固定 [v19.1.0 commit 4a9df08157f001c01b078d259748512211233dcf](https://github.com/facebook/react/tree/4a9df08157f001c01b078d259748512211233dcf)。上游仓库采集时的 HEAD 不能代替此版本。

入口：`/#/labs/state-mechanism`。任务：预测一次事件中的连续更新，写出最小队列模型，用真实 React 比对；再通过列表反转与组件类型切换解释状态身份。

## 从行为到实现

替换值在事件执行时已求值，函数更新则读取归约到该步骤的状态。三个相同替换值与三个递增函数形成不同队列。混合替换和函数时顺序仍然影响结果。[官方更新队列说明](https://react.dev/learn/queueing-a-series-of-state-updates)

同一兄弟范围内，key 参与识别对应元素；组件类型改变会重建其子树。索引 key 在列表重排后可能让状态留在位置上，而不是跟随业务实体。[官方状态保留与重置说明](https://react.dev/learn/preserving-and-resetting-state)

阅读以下固定版本文件，定位符号并记录输入、分支、输出及被省略的机制：

| 文件 | 符号 | 需要解释 |
| --- | --- | --- |
| `packages/react-reconciler/src/ReactFiberHooks.js` | `basicStateReducer`、`updateReducerImpl`、`dispatchSetState` | action、队列、lane 与更新归约 |
| `packages/react-reconciler/src/ReactChildFiber.js` | `reconcileSingleElement`、`updateSlot`、`updateElement` | key、elementType 与复用/删除 |

教学 `processQueue` 只模拟纯队列归约。`reconcileIdentity` 只模拟唯一 key 的同层身份；它不是 React diff 算法。真实源码还处理优先级、重放、中断、eager bailout、提交与 Effect，本模型均未实现。不要根据三个示范情景推广到并发渲染的全部行为。

## 交付、反馈与验收

1. 示范：0 起点分别做三次替换、三次函数更新；先写预测，再观察真实 React 与模型输出。
2. 补全：遮住归约函数，实现“替换为 10 → 加一 → 替换为 3”；验收最终值和每步轨迹。
3. 独立：从空文件实现模型与测试，禁止复制答案；提交源码定位和模型边界。
4. 排错：给甲加一后反转列表，比较稳定 key 与索引 key；变更组件类型证明状态重置。
5. 迁移：设计带编辑草稿的可排序列表，证明输入跟随实体。再讨论跨父节点移动为什么超出本模型。
6. 延迟：三天后无提示复现混合队列和身份错误，记录提示依赖与结果。

```sh
node --test src/demos/13.mechanisms/lab/model.test.mjs
```

负向情景包括错误使用同一渲染快照、索引身份错位、类型变化、重复 key。模型测试只能证明模型；页面验收必须实际点击运行中的 React，并对比状态和重置结果。掌握评价还需要独立作品、陌生迁移题与延迟复测，不能拿内容验证通过代替学习者证据。
