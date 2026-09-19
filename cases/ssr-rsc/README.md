# SSR / RSC 边界案例

这是独立的本地服务工程，不部署到 GitHub Pages。固定 Next.js 16.3.5、React/React DOM 19.3.0、Node 22 与 pnpm 9.15.4；与静态学习站的 React 19.1.0 机制实验分别维护锁文件。

```sh
cd cases/ssr-rsc
pnpm install --frozen-lockfile
NEXT_TELEMETRY_DISABLED=1 pnpm build
pnpm test
pnpm start --port 4318
```

打开本地 4318 端口。前置：组件、事件、HTTP、异步函数、模块边界。

交付：服务端读取的课程页、可水合的点赞组件、错误恢复入口、HTTP 验证和浏览器记录。所有输入为合成数据。

## 必须解释的三个维度

- RSC 规定组件模块在哪里执行、什么结果跨越边界；SSR 生成初始 HTML。两者可以一起使用，不能列为互斥方案。
- `counter.jsx` 的 `'use client'` 声明客户端模块边界；它仍可能参与初始 HTML 预渲染。`window` 等浏览器 API 应留在事件或客户端 Effect 中。
- `error.jsx` 是 Client Component。持续故障仍然存在时，reset 不能凭空修复它；本案例通过移除 `fail=1` 解除受控故障。

依据：[React Server Components](https://react.dev/reference/rsc/server-components)、[Next error 文件约定](https://nextjs.org/docs/app/api-reference/file-conventions/error)。访问日期 2026-09-19。这里只解释固定案例行为，不对所有框架版本的缓存、SEO 或路由策略作概括排名。

## 递进学习与验收

1. 示范：检查 HTTP 响应中的标题，点击点赞并观察没有整页导航。
2. 补全：遮住 `server-only` 模块中的 DTO 返回，补出只包含允许公开字段的结果。
3. 独立：重建本案例，提交初始 HTML、交互测试和浏览器构建文件检查结果。
4. 排错：注入 `/?fail=1`；确认 fallback 可见，reset 在持续故障下仍失败，清除条件后恢复。
5. 迁移：增加文章详情和元数据，讨论哪些数据允许进入 props。再比较静态生成与请求时渲染，写出缓存更新策略及验证步骤。
6. 三天后复测：无提示解释服务端组件、客户端边界、SSR 与水合的关系，重新证明合成私有标记没有泄露。

测试只使用 `LAB_PRIVATE_NOTE` 合成标记，不读真实 token。HTTP 测试检查初始 HTML 和 `.next/static` 客户端文件；它不能证明任意未来代码都不泄露。真实密钥不得进入 `NEXT_PUBLIC_*`、组件 props、报错、日志或公开测试材料。

## 完整 HTML 与流式反馈

根路由等待课程准备后返回完整 HTML，可在禁用 JavaScript 时阅读。`/slow` 单独包含 loading 边界，流式结果可能先出现在隐藏片段并由脚本揭示。检查原始 HTML 含标题并不能证明禁用 JavaScript 后标题可见。浏览器测试必须区分这两个行为。
