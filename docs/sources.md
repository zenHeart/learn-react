# 固定版本来源与适用边界

采集日期：2026-09-19。以下是源码研究快照；采集时的 HEAD 不是发布版本，也不能证明课程已覆盖该仓库。实际依赖以各工程锁文件为准。

| 仓库 | 固定研究快照 |
| --- | --- |
| [react](https://github.com/facebook/react) | `59aff3e18cb5b3a336c280bbfa57ec37999511b9` |
| [react.dev](https://github.com/reactjs/react.dev) | `b011783fcc7a39da9eefd4274147a1444860a12b` |
| [react-router](https://github.com/remix-run/react-router) | `58c47cd0057513939b9f7605792d0aeddd231e0d` |
| [redux-toolkit](https://github.com/reduxjs/redux-toolkit) | `c9dac937d77adc3bf04842a43955e81d0e7a46da` |
| [zustand](https://github.com/pmndrs/zustand) | `b57db4f86ef179285da216eeb291266da82c361c` |
| [query](https://github.com/TanStack/query) | `2a495979b4eefc075fd641bd89a745e99f54a446` |
| [next.js](https://github.com/vercel/next.js) | `7b58e5880cbac52ec705ee2039e963c32a854951` |
| [vite](https://github.com/vitejs/vite) | `e9078f865cdff6bed77cd729214a7e2868f126b5` |
| [vitest](https://github.com/vitest-dev/vitest) | `a0a939653bc8441848579bb6ac18706372242cd6` |
| [react-testing-library](https://github.com/testing-library/react-testing-library) | `20ce75f2907ca0e5c5a8ae595c0e9a4e368c7800` |
| [playwright](https://github.com/microsoft/playwright) | `07f1a6154795f055f341b8972086533e8e48b36f` |
| [bulletproof-react](https://github.com/alan2207/bulletproof-react) | `9506629ed003a561c6627735480cce4994244bb4` |

## 与运行时对齐

静态站 React 19.1.0 对齐 `4a9df08157f001c01b078d259748512211233dcf`，不使用上表研究 HEAD 冒充发布 tag。机制案例定位：ReactFiberHooks.js 的 basicStateReducer:1300、updateReducerImpl:1351、dispatchSetState:3735；ReactChildFiber.js 的 updateElement:518、updateSlot:777、reconcileSingleElement:1621。行号仅适用于该固定提交。

独立 SSR/RSC 案例固定 Next.js 16.3.5 / React 19.3.0；其解释不套用 React 19.1.0 内部实现。其他上游快照用于阅读与比较，未逐一映射到本地依赖版本前，不能作为源码调用链的最终证据。

## 文档与岗位证据

- [状态队列](https://react.dev/learn/queueing-a-series-of-state-updates) 与 [身份重置](https://react.dev/learn/preserving-and-resetting-state)：行为合同。
- [React RSC](https://react.dev/reference/rsc/server-components) 与 [Next error](https://nextjs.org/docs/app/api-reference/file-conventions/error)：框架边界。
- [TypeScript React](https://www.typescriptlang.org/docs/handbook/react.html)：类型入口，具体规则需要追到对应类型或 API。
- [WAI 教程](https://www.w3.org/WAI/tutorials/)：跨框架可访问性指导，不是 React 专属规范。
- [Web Vitals](https://web.dev/articles/vitals)：网页体验指标；组件渲染次数不是完整用户体验指标。
- 岗位证据见 [market-evidence.json](market-evidence.json)：三条公开国际资深岗位便利样本，不能外推中国市场、新人岗位或市场频率。

上述页面在 2026-09-19 核验；网站后续可能更新。仓库采用条件和许可证应从固定快照的 LICENSE 核查；不把“可访问”写成“允许无限复制”。社区架构示例是选项，不是官方规定。
