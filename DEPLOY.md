# 发布 Learn React

只从已推送的 `master` 发布。`pnpm deploy` 验证干净主线后派发 GitHub Actions；它不重新初始化 dist 的 Git 历史，不强推 gh-pages，也不在命令行传递凭据。

CI 执行实际课程测试、构建、版本与隐私检查，再通过 Pages artifact 发布。仓库 Pages 的构建来源须设置为 GitHub Actions。HashRouter 使用 URL fragment，刷新课程不需要把所有 404 伪装成首页。

默认基础路径是 `/learn-react/`。仅在核对精确域名、所有权和用户授权后，设置仓库 Actions 变量 `LEARN_SITE_DOMAIN` 并配置同名 Pages 自定义域名；构建会改用 `/` 并生成 CNAME。不要硬编码待确认的拼写。

发布后读取 `version.json`，要求 commit 等于本次主线 SHA 且 dirty=false；验证首页、课程入口和 HTTPS。源码及 dist 检查不能被 CI 绿灯替代。共享产物不得包含 token、Cookie、本机配置、个人画像、私有研究原文或原始会话；CLI 使用目标机器已有的凭据链，回执仅保留公开提交、测试和部署状态。
