# SSR、RSC 与运行环境边界

可运行案例、固定依赖、交付物与验证命令见 [SSR/RSC 案例](../cases/ssr-rsc/README.md)。静态站使用 React 19.1.0；独立案例使用 Next.js 16.3.5 / React 19.3.0，不能混用源码版本结论。

RSC 与 SSR 描述不同维度：前者划分组件执行与序列化边界，后者生成 HTML。客户端组件可以参与服务端初始预渲染，再在浏览器水合。浏览器专属对象不能无条件放进可能服务端执行的 render。

`error.jsx` 必须是客户端组件；`loading.jsx` 定义路由加载反馈。普通 Effect 数据请求并不会自动触发 Suspense。缓存、静态生成和请求时渲染应按具体框架版本与路由配置核验，不能归纳成笼统的“SEO 差/好/最好”。

服务端数据通过 props 或渲染结果传给客户端后就已公开。`server-only` 可以阻止错误导入，但不能阻止作者主动把秘密序列化出去。案例以合成标记验证此边界，不使用真实凭据。

来源：[React RSC](https://react.dev/reference/rsc/server-components)、[Next error](https://nextjs.org/docs/app/api-reference/file-conventions/error)，访问 2026-09-19。GitHub Pages 只托管静态构建产物，不提供本例需要的 Node 服务。
