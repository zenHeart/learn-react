# Learn React

An interactive React learning platform with live code examples and real-time preview.

## Overview

Interactive teaching platform combining theory with practice. Each concept includes runnable code examples, detailed explanations, and multi-file organization for comprehensive learning.

**Core Features:**
- Real-time code editing with Sandpack integration
- Theory and practice side-by-side
- Multi-file examples with documentation
- Tag-based filtering and progressive learning
- Source code analysis and performance insights

## Quick Start

**Online**: <https://blog.zenheart.site/learn-react/>

**Local Setup:**
```bash
npm install -g pnpm
git clone <repository-url>
cd learn-react
pnpm install
pnpm dev
```

Open `http://localhost:5173` to start learning.

## Technology Stack

- **Frontend**: React 19.1.0 + TypeScript + Vite 5.4.10
- **Editor**: Sandpack (CodeSandbox-based)
- **Styling**: Tailwind CSS + Less
- **Routing**: React Router v7
- **Package Manager**: pnpm

## Learning Content

### Basic to Advanced Topics
- **Concepts** (00.concept): React elements, JSX, components, Virtual DOM
- **JSX Syntax** (01.jsx): Props, children, rendering, fragments
- **State Management** (02.state): Context API, state lifting
- **Hooks** (03.hooks): useState, useEffect, custom hooks, rules
- **Components** (04.component): Function/class components, communication, forms
- **Advanced**: Performance optimization, routing, TypeScript, MobX integration
- **Theory** (10.theory): Source code analysis, Fiber architecture, MVP implementation

## Example Organization

### File Formats
- **React Components**: `*.demo.jsx`, `*.demo.tsx`
- **HTML Examples**: `*.demo.html`
- **Pure Documentation**: `*.md`

### Organization Modes

#### Single File
```
demos/01.jsx/Props.demo.jsx
```

#### Component + Documentation
```
demos/04.component/ErrorBoundary/
├── demo1.demo.jsx          # Main demo
└── demo1.md               # Documentation
```

#### Multi-file Examples
```
demos/02.state/01.dynamic-context/
├── index.demo.jsx          # Uses parent dir name
├── index.md                # Explanation
└── theme-context.js        # Helper file
```

#### Pure Documentation
```
demos/02.state/
└── context-guide.md   # Theory-only content
```

## Key Features

### Intelligent Parsing
- Automatic file dependency resolution
- Smart document-code association
- Metadata extraction from components
- Multi-file example support

### Enhanced Learning
- Real-time code editing and preview
- Tag-based content filtering
- Progressive difficulty levels
- Theory-practice integration
- Mobile-responsive design

## Contributing

### Adding Examples

1. Create files in `src/demos/` using format: `*.demo.jsx|tsx|html`
2. Add component metadata:
   ```javascript
   Component.meta = {
     tags: ['hooks', 'state'],
     title: 'Example Title',
     description: 'Brief description'
   };
   ```

### Adding Documentation

- **Same-named files**: `index.md` for `index.demo.jsx`
- **Directory docs**: `README.md` or `READEME.md`
- **Pure theory**: `*.demo.md` files
- **Multi-file**: Add helper files in same directory

### Directory Conventions

- Use meaningful names
- Numeric prefixes for ordering (`01.dynamic-context`)
- `index.demo.jsx` uses parent directory name
- Support multi-level organization

## Development

- Use TypeScript
- Follow React best practices
- Add clear comments
- Ensure examples run independently

## Deployment

```bash
pnpm run deploy
```

Automatically deploys to GitHub Pages.

## References

- [React Documentation](https://react.dev/)
- [Sandpack Documentation](https://sandpack.codesandbox.io/docs)
- [react.dev Source](https://github.com/reactjs/react.dev)



**Note**: Learning project designed for hands-on practice. Contributions welcome via Issues and Pull Requests.


