# Markdown 文档功能使用说明

## 概述

现在 learn-react 项目支持为每个 demo 添加对应的 markdown 文档，提供更详细的说明和教程。

## 功能特性

✅ **保持现有功能不变** - 所有现有的 demo 和导航功能完全保持不变
✅ **Meta 信息优先读取** - 如果存在 markdown 文件，优先从中读取 meta 信息
✅ **响应式布局** - 桌面端左右布局，移动端上下布局
✅ **自动检测** - 系统自动检测每个 demo 是否有对应的 markdown 文档

## 使用方法

### 1. 为单个 demo 文件添加文档

如果你有一个 demo 文件：`src/demos/01.jsx/Props.demo.jsx`

创建对应的 markdown 文件：`src/demos/01.jsx/Props.md`

```markdown
---
title: "Props 详细说明"
description: "深入了解 React Props 的使用方法"
tags: ["jsx", "props", "tutorial"]
---

# Props 详细说明

Props 是 React 中组件间数据传递的核心机制...
```

### 2. 为文件夹类型的 demo 添加文档

如果你有一个文件夹 demo：`src/demos/02.state/01.dynamic-context/index.demo.jsx`

创建对应的 markdown 文件：`src/demos/02.state/01.dynamic-context/index.md`

```markdown
---
title: "动态 Context 详解"
description: "深入了解 React Context 的动态用法"
tags: ["state", "context", "dynamic"]
---

# 动态 Context 详解

本示例展示了如何创建可以动态修改的 React Context...
```

## 文件命名规则

| Demo 文件 | 对应的 Markdown 文件 |
|-----------|---------------------|
| `Props.demo.jsx` | `Props.md` |
| `Children.demo.tsx` | `Children.md` |
| `index.demo.jsx` | `index.md` |
| `demo.demo.html` | `demo.md` |

**规则**：去掉 `.demo.{ext}` 后缀，添加 `.md` 后缀

## YAML Front Matter 支持

每个 markdown 文件可以包含 YAML front matter 来定义元数据：

```markdown
---
title: "显示标题"
description: "描述信息"
tags: ["标签1", "标签2"]
---

# 文档内容
```

### 支持的字段

- `title` - 文档标题
- `description` - 描述信息
- `tags` - 标签数组
- 其他自定义字段

## 布局说明

### 桌面端（宽度 ≥ 768px）
- 左侧：Markdown 文档
- 右侧：Demo 示例
- 左右各占 50% 宽度

### 移动端（宽度 < 768px）
- 上方：Markdown 文档（最大高度 50vh）
- 下方：Demo 示例

## 示例效果

当你访问有对应 markdown 文档的 demo 时，界面会自动变为：

```
┌─────────────────┬─────────────────┐
│                 │                 │
│   Markdown      │   Demo 示例     │
│   文档内容      │   (Sandpack)    │
│                 │                 │
└─────────────────┴─────────────────┘
```

## 最佳实践

1. **文档结构** - 使用清晰的标题层级
2. **代码示例** - 在文档中包含相关的代码片段
3. **说明右侧示例** - 解释右侧 demo 展示的内容
4. **包含最佳实践** - 提供使用建议和注意事项

## 兼容性

- 如果没有对应的 markdown 文件，demo 会按原来的方式渲染
- 现有的所有功能（导航、标签、搜索等）完全不受影响
- 支持所有类型的 demo（.jsx、.tsx、.html、文件夹类型）

## 故障排除

1. **markdown 文件不生效** - 检查文件名是否正确匹配
2. **YAML 格式错误** - 确保 YAML front matter 格式正确
3. **样式问题** - 检查 CSS 变量是否正确定义 