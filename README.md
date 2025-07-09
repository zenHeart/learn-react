# Learn React

一个通过示例从头学习 React 的交互式学习平台。

## 📖 项目简介

本项目是一个专门为 React 学习者设计的交互式教学平台，通过丰富的示例代码和实时预览功能，帮助开发者从基础到高级逐步掌握 React 的核心概念。

### 🎯 核心特性

- **交互式学习**：基于 Sandpack 的在线代码编辑器，支持实时预览
- **系统性内容**：从基础概念到高级特性的完整学习路径
- **实践导向**：每个概念都配有可运行的示例代码
- **源码分析**：深入 React 内部实现机制的详细解析
- **多种场景**：涵盖 JSX、组件、状态管理、生命周期、性能优化等

## 🚀 快速开始

### 在线体验

访问 <https://blog.zenheart.site/learn-react/> 开始在线学习

### 本地运行

1. 确保已安装 Node.js 环境
2. 全局安装 pnpm（版本 ≥ 9.x）
   ```bash
   npm install -g pnpm
   ```
3. 克隆项目并安装依赖
   ```bash
   git clone <repository-url>
   cd learn-react
   pnpm install
   ```
4. 启动开发服务器
   ```bash
   pnpm dev
   ```
5. 在浏览器中打开 `http://localhost:5173` 开始学习

## 🏗️ 项目架构

### 技术栈

- **前端框架**: React 19.1.0 + TypeScript
- **构建工具**: Vite 5.4.10
- **代码编辑器**: Sandpack（基于 CodeSandbox）
- **样式方案**: Tailwind CSS + Less
- **状态管理**: MobX（部分示例）
- **路由**: React Router v7
- **包管理**: pnpm

### 目录结构

```
learn-react/
├── src/
│   ├── components/                 # 核心组件
│   │   ├── Nav.tsx                # 导航组件
│   │   ├── Editor.tsx             # 编辑器组件
│   │   ├── Sandpack/              # 原版 Sandpack 组件
│   │   └── SandpackNew/           # 增强版 Sandpack 组件
│   ├── demos/                     # 示例代码目录
│   │   ├── 00.concept/           # 基础概念
│   │   ├── 01.jsx/               # JSX 语法
│   │   ├── 02.state/             # 状态管理
│   │   ├── 03.hooks/             # Hooks 用法
│   │   ├── 04.component/         # 组件开发
│   │   ├── 06.mbox/              # MobX 集成
│   │   ├── 06.typescript/        # TypeScript 集成
│   │   ├── 07.router/            # 路由管理
│   │   ├── 09.performance/       # 性能优化
│   │   ├── 10.theory/            # 原理分析
│   │   └── ...
│   ├── utils/                    # 工具函数
│   │   └── demoComponentParser/  # 示例解析器
│   ├── const.tsx                 # 常量定义
│   ├── App.tsx                   # 主应用组件
│   └── main.tsx                  # 应用入口
├── scripts/
│   └── deploy.sh                 # 部署脚本
├── package.json                  # 项目配置
├── vite.config.ts               # Vite 配置
├── tsconfig.json                # TypeScript 配置
└── README.md                    # 项目说明
```

## 📚 学习内容

### 1. 基础概念 (00.concept)

- React 元素创建
- JSX 语法介绍
- 组件基础概念
- 虚拟 DOM 原理

### 2. JSX 语法 (01.jsx)

- 动态标签变量
- 属性传递 (Props)
- 子元素处理 (Children)
- 列表渲染
- 条件渲染
- 插槽模式

### 3. 状态管理 (02.state)

- Context API
- 动态 Context
- 状态提升

### 4. Hooks 用法 (03.hooks)

- useState 基础用法
- useEffect 生命周期
- useEffect 清理机制
- 自定义 Hooks
- Hooks 规则

### 5. 组件开发 (04.component)

- 函数组件
- 类组件
- 组件通信
- 表单处理
- 生命周期管理

### 6. 高级特性

- 性能优化 (09.performance)
- 路由管理 (07.router)
- 状态管理库集成 (06.mbox)
- TypeScript 集成 (06.typescript)

### 7. 原理分析 (10.theory)

- 虚拟 DOM 实现
- React 源码分析
- Fiber 架构解析
- MVP 实现原理

## 🔧 核心实现

### Sandpack 集成

项目基于 [react.dev](https://github.com/reactjs/react.dev) 的 Sandpack 实现，提供了：

- 实时代码编辑
- 即时预览
- 错误提示
- 多文件支持

### 示例解析系统

通过 `demoComponentParser` 工具，自动解析示例代码：

- 支持 React 组件解析
- 支持 HTML 文件解析
- 自动处理文件依赖关系
- 生成 Sandpack 可用格式

### 导航系统

智能的树形导航结构：

- 自动根据文件路径生成层级结构
- 支持标签分类
- 动态加载示例组件

## 🎨 自定义功能

### 增强版 Sandpack

在原版基础上增强了：

- 更好的 TypeScript 支持
- 自定义主题
- 移动端适配
- 性能优化

### 示例管理

- 支持 `.demo.jsx/.demo.tsx` 格式
- 支持 `.demo.html` 格式
- 自动提取组件元数据
- 支持标签分类

## 🚀 部署

项目支持自动部署到 GitHub Pages：

```bash
pnpm run deploy
```

## 🤝 贡献指南

### 添加新示例

1. 在 `src/demos/` 目录下创建新的示例文件
2. 文件名格式：`*.demo.jsx` 或 `*.demo.tsx`
3. 添加组件元数据：
   ```javascript
   YourComponent.meta = {
     tags: ['your-tag'],
     title: 'Your Title',
     description: 'Your Description'
   };
   ```

### 目录规范

- 使用有意义的目录名
- 按功能模块组织
- 支持多级目录结构
- `index.demo.jsx` 文件会使用父目录名

### 开发规范

- 使用 TypeScript
- 遵循 React 最佳实践
- 添加必要的注释
- 确保示例可独立运行

## 📝 待办事项

项目当前的开发计划可以在 [todo.md](./todo.md) 中查看，包括：

- [ ] 移除 Sandpack 依赖，支持任意版本 React
- [ ] 完善 Hooks 使用场景示例
- [ ] 添加错误边界处理
- [ ] 补充官方文档学习内容
- [ ] 性能优化相关示例

## 📖 参考资料

- [React 官方文档](https://react.dev/)
- [Sandpack 文档](https://sandpack.codesandbox.io/docs)
- [react.dev 源码](https://github.com/reactjs/react.dev)

## 📄 许可证

本项目采用 MIT 许可证，详情请参阅 [LICENSE](./LICENSE) 文件。

---

💡 **提示**: 这是一个学习项目，建议结合实际练习来加深理解。如果你在学习过程中遇到问题，欢迎提交 Issue 或 Pull Request！


