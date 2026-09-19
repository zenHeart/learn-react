# React 学习能力矩阵

本系列按技术领域组织，岗位路线组合能力，业务案例提供任务约束。`curriculum.json` 是引用索引；岗位原文含义保存在 `market-evidence.json`，不把框架文档当招聘要求。

| 能力范围 | 可执行入口 | 验收重点 |
| --- | --- | --- |
| JSX、组件、状态、类型 | `src/demos/test/Counter.demo.tsx`；`src/demos/06.typescript/01.props-types/index.demo.tsx` | Props、步长、回调、重置、类型边界；组件测试 |
| Hooks、Effect、异步错误 | `src/demos/08.async/lab/README.md` | 旧成功/旧失败、取消、卸载、重试与反例 |
| 错误边界、Suspense | `src/demos/07.error-boundary/index.demo.tsx`、`Suspense.demo.tsx` | 真正 lazy 导入、渲染故障与重建恢复；不能用定时器假装挂起 |
| 路由与数据边界 | `src/demos/05.router/typed-routes.demo.tsx` | 动态参数、嵌套、登录跳转、未知路径；服务端授权边界 |
| 表单 | `src/demos/06.forms/01.controlled-form/index.demo.tsx` | 交叉字段重验、错误关联、隐私与提交语义 |
| 客户端状态 / 服务器缓存 | `docs/course-tasks.md` 的 data-fetching-pattern | Context/MobX/Redux 历史例子作为起点；Query/RTK/Zustand 按任务比较，不混为同一种状态 |
| 测试 | `src/test/`、三个 lab 的 `*.test.mjs` | 实际组件、负向路径、真实 HTTP；测试用合成材料 |
| 可访问性与移动输入 | `src/demos/11.accessibility/aria-patterns/index.demo.tsx` | 键盘、焦点恢复、触控；屏幕阅读器需人工验证 |
| 性能 | `src/demos/09.performance/measured-list.demo.tsx` | 有界工作量、相同结果、测量条件和波动；不用任意提速指标 |
| SSR/RSC | `cases/ssr-rsc/README.md` | 初始 HTML、水合、流式反馈、错误边界、服务器数据边界 |
| 源码机制 | `src/demos/13.mechanisms/lab/README.md` | 固定版本队列和身份；模型省略范围 |
| 工程与业务交付 | `src/demos/12.business/lab/README.md`、`DEPLOY.md` | 幂等、版本冲突、CI、构建来源、公开产物检查与部署回执 |

## 岗位路线

- 前端交付：基础 → 表单/类型 → 异步 → 工单 → 测试/可访问性 → 发布。
- 需要服务端框架的岗位：在前端交付上补 SSR/RSC、数据边界、缓存和迁移；不把 Next.js 设成所有 React 学习者的必修前提。
- 移动 Web：在组件基础上强化窄屏、触控、键盘和辅助技术，仍需端到端业务任务。
- 架构与机制：在真实交付证据上补源码、性能测量、选型、迁移与评审。读懂文件名或背概念不等于架构能力。

岗位来源是三条国际资深岗位便利样本。它支持某些任务的需求关联，不能证明完整中国就业要求，更不能保证获得工作。资历要求、优先项、任选工具和明确非必需项单独保存。

## 状态与持续建设

目录和任务覆盖、内容验证、岗位提及和学习者掌握分别记录。`manual` 表示设计/辅助技术/迁移成果需要人工评价，不表示测试通过。`not-run` 表示尚未验收。既有历史演示并非全部经过本轮内容复核，应逐条按固定版本和案例合同迁移。

学习者需要提交独立作品、反例诊断、不同约束的迁移和延迟复测。本轮没有评价真实学习者，不生成虚构的掌握分数。
