# Learn React

一个通过示例从头学习 React 的交互式学习平台。

## 📖 项目简介

本项目是一个专门为 React 学习者设计的交互式教学平台，通过丰富的示例代码和实时预览功能，帮助开发者从基础到高级逐步掌握 React 的核心概念。

**核心理念**: 理论与实践相结合，每个概念都配有详细的代码示例和理论说明，支持多文件组织和整体阅读，让学习者能够完整理解从概念到实现的全过程。

### 🎯 核心特性

- **交互式学习**：基于 Sandpack 的在线代码编辑器，支持实时预览
- **理论实践结合**：文档与代码同时展示，支持多文件整体阅读
- *#### 模式4: 纯文档模式

```
demos/02.state/
└── context-guide.demo.md        # 纯文档，无演示代码，单独渲染
```

**特点**: 使用 `.demo.md` 格式的纯文档文件，会被系统自动识别并单独渲染，无需配套的代码文件

#### 模式5: 任意 Markdown 文档

```
demos/02.state/
├── context-guide.md             # 任意 .md 文件，单独渲染
├── README.md                    # 文件夹级别文档
└── advanced-patterns.md        # 另一个独立文档
```

**特点**:

- 支持任何 `.md` 文件作为独立文档路由
- 无需 `.demo.md` 后缀，任何 `.md` 文件都可以
- 按优先级处理：优先匹配 demo 文件，其次是文件夹级别 demo，最后是独立文档
- 支持 `README.md` 等标准文档文件

#### 模式6: 编号子目录

```
demos/02.state/
├── context-guide.demo.md
└── 01.dynamic-context/
    ├── index.demo.jsx
    └── index.md
```

**说明**:
- **实践导向**：每个概念都配有可运行的示例代码和理论解析
- **源码分析**：深入 React 内部实现机制的详细解析
- **灵活学习**：支持按标签筛选、按难度分级、按顺序学习

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

- **多文件解析**: 支持 React 组件、HTML、JavaScript 等多种文件类型
- **依赖关系处理**: 自动处理文件间的依赖关系，确保示例完整运行
- **文档自动关联**: 智能匹配同名 `.md` 文件，实现文档与代码同步
- **Sandpack 集成**: 生成 Sandpack 可用格式，支持实时编辑预览
- **元数据提取**: 从组件和文档中提取标签、分类等信息

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

项目支持多种 demos 组织方式：

#### 1. 基础示例格式

- **React 组件**: `.demo.jsx/.demo.tsx` 格式
- **HTML 示例**: `.demo.html` 格式
- **Markdown 文档**: `.demo.md` 格式

#### 2. 组合型示例（推荐）

- **组件+文档**: 同时包含组件代码和 markdown 说明文档，支持代码与理论同步学习
- **多文件联动**: 支持多个辅助文件，便于理解复杂概念的完整实现
- **整体阅读**: 文档与代码可同时展示，提供完整的学习上下文
- **纯文档**: 只包含 markdown 文档，专注于理论知识和概念讲解

#### 3. 目录结构示例

```
demos/
├── 04.component/
│   ├── ErrorBoundary/
│   │   ├── index.demo.jsx           # 主要演示组件
│   │   └── READEME.md               # 详细理论说明
│   └── Form/
│       ├── index.demo.jsx           # 表单演示
│       ├── validation.js            # 验证逻辑
│       ├── utils.js                 # 工具函数
│       └── index.md                 # 使用指南
└── 02.state/
    ├── context-guide.demo.md        # 纯理论文档
    └── 01.dynamic-context/
        ├── index.demo.jsx           # 动态上下文示例
        ├── theme-context.js         # 主题上下文定义
        └── index.md                 # 实现原理说明
```

**优势**: 多文件组织便于理解完整的实现流程，文档与代码相互补充，提供全面的学习体验

#### 4. 功能特性

- **智能文档关联**: 自动关联同名 `.md` 文件（如 `index.md` 对应 `index.demo.jsx`）
- **多文件支持**: 一个示例可包含多个辅助文件，便于理解复杂实现
- **理论与实践结合**: 文档与代码可同时展示，提供完整学习上下文
- **灵活组织方式**: 支持 `README.md`、`READEME.md`、`index.md` 等多种文档格式
- **自动元数据提取**: 从组件和文档中自动提取标签、分类等信息
- **标签分类过滤**: 支持按技术栈、难度等维度筛选学习内容
- **渐进式学习**: 数字前缀控制学习顺序，`index.demo.jsx` 使用父目录名
- **纯文档模式**: 支持 `.demo.md` 格式的纯理论文档，无需配套代码文件

## 🚀 部署

项目支持自动部署到 GitHub Pages：

```bash
pnpm run deploy
```

## 🤝 贡献指南

### 添加新示例

1. 在 `src/demos/` 目录下创建新的示例文件
2. 文件名格式：`*.demo.jsx`、`*.demo.tsx` 或 `*.demo.html`
3. 添加组件元数据：
   ```javascript
   YourComponent.meta = {
     tags: ['your-tag'],
     title: 'Your Title',
     description: 'Your Description'
   };
   ```

### 添加文档说明

1. **单文件文档**: 创建与示例同名的 `.md` 文件（如 `index.md` 对应 `index.demo.jsx`）
2. **目录文档**: 在示例目录中创建 `README.md` 或 `READEME.md` 文件
3. **多文件组织**: 在目录中添加多个辅助文件，便于理解复杂实现
4. **文档内容**: 支持完整的 markdown 语法，包括代码块、图表、链接等
5. **学习体验**: 文档会与代码演示同时展示，提供完整的学习上下文
6. **纯文档模式**: 支持只有理论说明的概念性内容（`.demo.md` 格式）

**最佳实践**: 为复杂示例创建详细的实现说明，包含设计思路、关键代码解析、使用场景等

### 支持的组织模式

#### 模式1: 单文件示例

```
demos/01.jsx/Props.demo.jsx
```

#### 模式2: index 文件（使用父目录名）

```
demos/02.state/01.dynamic-context/
├── index.demo.jsx               # 使用父目录名 "dynamic-context"
├── index.md                     # 对应的文档
└── theme-context.js             # 辅助文件
```

#### 模式3: 组件+文档（README.md）

```
demos/04.component/ErrorBoundary/
├── index.demo.jsx               # 演示组件
└── READEME.md                   # 文档说明（注意文件名）
```

#### 模式4: 纯文档

```
demos/02.state/
└── context-guide.demo.md        # 纯文档，无演示代码，单独渲染
```

**特点**: 使用 `.demo.md` 格式的纯文档文件，会被系统自动识别并单独渲染，无需配套的代码文件

#### 模式5: 编号子目录

```
demos/02.state/
├── context-guide.demo.md
└── 01.dynamic-context/
    ├── index.demo.jsx
    └── index.md
```

**说明**:

- 使用数字前缀进行排序，便于按学习顺序组织内容
- `index.demo.jsx` 会使用父目录名作为组件名
- 支持同名 `.md` 文件作为文档（如 `index.md` 对应 `index.demo.jsx`）
- 也支持 `README.md` 或 `READEME.md` 作为目录文档

### 目录规范

- 使用有意义的目录名
- 按功能模块组织
- 支持多级目录结构
- 支持数字前缀排序（如 `01.dynamic-context`）
- **`index.demo.jsx` 特殊处理**：会使用父目录名作为组件名
- **文档关联**：支持同名 `.md` 文件（如 `index.md`）或 `README.md`
- 数字前缀用于控制学习顺序和导航显示顺序

### 开发规范

- 使用 TypeScript
- 遵循 React 最佳实践
- 添加必要的注释
- 确保示例可独立运行

## 📝 待办事项

项目当前的开发计划可以在 [todo.md](./todo.md) 中查看，包括：

- [x] 支持单独渲染文档（纯 `.demo.md` 文件）
- [x] 支持任意 `.md` 文件作为独立文档路由
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


