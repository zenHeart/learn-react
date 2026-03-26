# 用户引导解决方案

> 主流用户引导库对比分析与实战指南

## 📊 库对比总览

| 特性 | react-joyride | driver.js | shepherd.js | intro.js |
|------|---------------|-----------|-------------|----------|
| **Star 数** | 10k+ | 5k+ | 10k+ | 20k+ |
| **框架依赖** | React | 无 | 无 | 无 |
| **遮罩+高亮** | ✅ | ✅ | ❌ | ✅ |
| **步骤引导** | ✅ | ✅ | ✅ | ✅ |
| **React 18 支持** | ✅ | - | - | - |
| **多框架支持** | ❌ | ✅ | ✅ | ✅ |
| **TypeScript 支持** | ✅ | ✅ | ✅ | ✅ |
| **无障碍支持** | 基础 | 基础 | 良好 | 基础 |
| **体积** | ~50KB | ~15KB | ~70KB | ~40KB |
| **最后更新** | 活跃 | 活跃 | 活跃 | 活跃 |
| **许可证** | MIT | MIT | MIT | GPL-3.0 |

---

## 🎯 选型决策树

```
项目使用 React？
├── 是 → 需要遮罩+高亮？
│   ├── 是 → react-joyride ✅ 推荐
│   └── 否 → react-joyride / driver.js 均可
└── 否 → 需要遮罩+高亮？
    ├── 是 → driver.js（轻量）或 intro.js（功能全）
    └── 否 → shepherd.js（专注步骤引导）
```

### 场景推荐

| 场景 | 推荐库 | 原因 |
|------|--------|------|
| **React 项目，简单引导** | react-joyride | 原生 React，集成简单 |
| **React 项目，复杂引导** | react-joyride + 自定义 | 灵活扩展 |
| **多框架项目** | driver.js | 零依赖，超轻量 |
| **企业级产品** | shepherd.js | 成熟稳定，无障碍好 |
| **快速集成，轻量优先** | intro.js | 功能全，体积小 |

---

## 1️⃣ react-joyride

### 简介
专为 React 设计的用户引导库，支持 React 18，功能完整。

### 安装

```bash
npm install react-joyride
# 或
yarn add react-joyride
```

### 基础使用

```tsx
import Joyride, { CallBackProps, STATUS, ACTIONS } from 'react-joyride';

const steps: Step[] = [
  {
    target: '.first-step',
    content: '欢迎使用我们的产品！',
    disableBeacon: true,
    placement: 'center',
  },
  {
    target: '.second-step',
    content: '这是导航栏，您可以在这里切换页面',
    placement: 'bottom',
  },
  {
    target: '.third-step',
    content: '点击这里打开设置',
    placement: 'left',
  },
];

function App() {
  const [run, setRun] = useState(false);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, action } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
    }
  };

  return (
    <div>
      <button onClick={() => setRun(true)}>开始引导</button>
      
      <nav className="first-step">
        {/* 导航内容 */}
      </nav>
      
      <div className="second-step">
        {/* 内容区域 */}
      </div>

      <Joyride
        steps={steps}
        run={run}
        continuous
        showSkipButton
        showProgress
        scrollToFirstStep
        scrollToFirstStepProperty="smooth"
        disableOverlayClose
        spotlightClicks
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 10000,
            arrowColor: '#e3ffeb',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          spotlight: {
            border: '2px solid #00b894',
          },
        }}
      />
    </div>
  );
}
```

### TypeScript 类型定义

```tsx
import Joyride, { Step, CallBackProps, STATUS, ACTIONS, EVENTS } from 'react-joyride';

interface GuideStep extends Step {
  title?: string;
  icon?: React.ReactNode;
}

const steps: GuideStep[] = [
  {
    target: '.selector',
    title: '步骤标题',
    content: '这是描述内容',
    placement: 'bottom',
    disableBeacon: false,
    disableOverlayClose: false,
    spotlightClicks: false,
  },
];

type JoyrideStatus = STATUS.FINISHED | STATUS.SKIPPED | STATUS.RUNNING | STATUS.PAUSED;
type JoyrideAction = ACTIONS.START | ACTIONS.STOP | ACTIONS.NEXT | ACTIONS.PREV | ACTIONS.SKIP;
type JoyrideEvent = EVENTS.STEP_AFTER | EVENTS.STEP_BEFORE | EVENTS.TARGET_NOT_FOUND;
```

### 进阶配置

```tsx
<Joyride
  steps={steps}
  run={isRun}
  continuous={true}
  showSkipButton={true}
  showProgress={true}
  disableOverlayClose={true}
  spotlightClicks={true}
  scrollToFirstStep={true}
  stepIndex={stepIndex}
  locale={{
    back: '上一步',
    close: '关闭',
    last: '完成',
    next: '下一步',
    skip: '跳过',
  }}
  floaterProps={{
    disableAnimation: false,
    styles: {
      floater: {
        filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))',
      },
    },
  }}
  callback={(data) => {
    const { action, index, type, status } = data;
    // 处理回调
  }}
/>
```

---

## 2️⃣ driver.js

### 简介
轻量级（~15KB）、零框架依赖的高亮引导库。

### 安装

```bash
npm install driver.js
# 或
yarn add driver.js
```

### 基础使用

```tsx
import Driver, { DriverOptions, DriverObject } from 'driver.js';
import 'driver.js/dist/driver.min.css';

const driver = new Driver({
  animate: true,
  opacity: 0.75,
  padding: 5,
  allowClose: true,
  overlayClickNext: false,
  doneBtnText: '完成',
  nextBtnText: '下一步',
  prevBtnText: '上一步',
});

function startGuide() {
  driver.defineSteps([
    {
      element: '.first-step',
      popover: {
        title: '欢迎',
        description: '这是您的控制台首页',
        position: 'bottom-center',
      },
    },
    {
      element: '.second-step',
      popover: {
        title: '统计数据',
        description: '查看您的关键指标',
        position: 'left',
      },
    },
    {
      element: '.third-step',
      popover: {
        title: '快速操作',
        description: '使用快捷操作提升效率',
        position: 'right',
      },
      onNext: () => {
        // 自定义下一步行为
      },
    },
  ]);

  driver.start();
}

// 暂停/继续/重置
driver.stop();
driver.refresh();
driver.reset();
```

### TypeScript 类型

```tsx
import Driver, { DriverOptions, DriverPopoverOptions, DriverStep } from 'driver.js';

interface PopoverConfig extends DriverPopoverOptions {
  title?: string;
  description?: string;
}

interface GuideStep {
  element?: string | HTMLElement;
  popover: PopoverConfig;
  onNext?: () => void;
  onPrev?: () => void;
}

const options: DriverOptions = {
  animate: true,
  opacity: 0.75,
  padding: 5,
  allowClose: true,
  overlayClickNext: false,
  showProgress: true,
  steps: [],
};

const driverObj: DriverObject = new Driver(options);
```

---

## 3️⃣ shepherd.js

### 简介
成熟的步骤引导库，专注于无障碍和可访问性。

### 安装

```bash
npm install shepherd.js
# 或
yarn add shepherd.js
```

### 基础使用

```tsx
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

class MyTour {
  tour: Shepherd.Tour;

  constructor() {
    this.tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shadow-md bg-purple-dark',
        scrollTo: true,
        cancelIcon: {
          enabled: true,
        },
      },
    });
  }

  start() {
    this.tour.addSteps([
      {
        id: 'welcome',
        text: '欢迎使用我们的应用！',
        attachTo: {
          element: '.first-step',
          on: 'bottom',
        },
        buttons: [
          {
            text: '跳过',
            action: this.tour.cancel,
          },
          {
            text: '下一步',
            action: this.tour.next,
          },
        ],
      },
      {
        id: 'navigation',
        text: '这是导航区域，您可以通过它访问各个模块。',
        attachTo: {
          element: '.second-step',
          on: 'right',
        },
        buttons: [
          {
            text: '上一步',
            action: this.tour.back,
          },
          {
            text: '下一步',
            action: this.tour.next,
          },
        ],
      },
      {
        id: 'complete',
        text: '引导完成，开始探索吧！',
        buttons: [
          {
            text: '完成',
            action: this.tour.complete,
          },
        ],
      },
    ]);

    this.tour.start();
  }
}

const myTour = new MyTour();
myTour.start();
```

### TypeScript 类型

```tsx
import Shepherd, { Tour, Step, StepOptions, ButtonOptions } from 'shepherd.js';

interface CustomStepOptions extends StepOptions {
  id: string;
  customProp?: string;
}

const stepOptions: StepOptions = {
  text: '步骤内容',
  attachTo: {
    element: '.selector',
    on: 'bottom',
  },
  buttons: [
    {
      text: '按钮文字',
      action: () => {},
      classes: 'custom-button-class',
    },
  ],
  classes: 'additional-classes',
  scrollTo: { behavior: 'smooth', block: 'center' },
  modalOverlayOpeningPadding: 10,
  modalOverlayOpeningRadius: 5,
};

const tour: Tour = new Shepherd.Tour({
  useModalOverlay: true,
  defaultStepOptions: stepOptions,
});
```

---

## 4️⃣ intro.js

### 简介
轻量级（~40KB）、功能全面的引导库，支持 React/Vue/Angular。

### 安装

```bash
npm install intro.js
# 或
yarn add intro.js
```

### 基础使用

```tsx
import introJs from 'intro.js';
import 'intro.js/introjs.css';

// 方式一：HTML 属性方式
// <div data-intro="这是引导内容" data-step="1" />

// 方式二：编程方式
function startGuide() {
  introJs()
    .setOptions({
      steps: [
        {
          element: '.first-step',
          intro: '欢迎使用！这是第一步介绍',
          position: 'bottom',
        },
        {
          element: '.second-step',
          intro: '这是第二步，您可以在这里查看数据',
          position: 'left',
        },
        {
          element: '.third-step',
          intro: '最后一步，点击开始使用',
          position: 'right',
        },
      ],
      showStepNumbers: true,
      showProgress: true,
      showBullets: true,
      skipLabel: '跳过',
      prevLabel: '上一步',
      nextLabel: '下一步',
      doneLabel: '完成',
      overlayOpacity: 0.5,
      helperElementPadding: 10,
    })
    .oncomplete(() => {
      console.log('引导完成');
    })
    .onskip(() => {
      console.log('用户跳过');
    })
    .start();
}

// 控制方法
const intro = introJs();
intro.start();
intro.exit();
intro.previous();
intro.next();
intro.goToStep(2);
intro.refresh();
```

### React 封装

```tsx
import { useEffect, useRef } from 'react';
import introJs from 'intro.js';
import 'intro.js/introjs.css';

interface UseIntroOptions {
  steps: Array<{
    element: string;
    intro: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
  }>;
  enabled?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function useIntroJs(options: UseIntroOptions) {
  const { steps, enabled = false, onComplete, onSkip } = options;
  const introRef = useRef<introJs.IntroJs | null>(null);

  useEffect(() => {
    if (enabled && steps.length > 0) {
      introRef.current = introJs().setOptions({
        steps,
        showStepNumbers: true,
        showProgress: true,
      });

      if (onComplete) {
        introRef.current.oncomplete(onComplete);
      }

      if (onSkip) {
        introRef.current.onkip(onSkip);
      }

      introRef.current.start();

      return () => {
        introRef.current?.exit();
      };
    }
  }, [enabled, steps, onComplete, onSkip]);

  return introRef.current;
}
```

### TypeScript 类型

```tsx
import introJs from 'intro.js';

interface IntroStep {
  element?: string | HTMLElement;
  intro: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  step?: number;
}

interface IntroOptions {
  steps: IntroStep[];
  showStepNumbers?: boolean;
  showProgress?: boolean;
  showBullets?: boolean;
  skipLabel?: string;
  prevLabel?: string;
  nextLabel?: string;
  doneLabel?: string;
  overlayOpacity?: number;
  helperElementPadding?: number;
  disableInteraction?: boolean;
}

const intro = introJs();
intro.setOptions({
  steps: [],
  showStepNumbers: true,
} as IntroOptions);
```

---

## ⚠️ 设计注意事项

### 1. 可访问性 (Accessibility)

```tsx
// ✅ 正确：添加 aria 属性
<div
  role="button"
  aria-label="开始引导教程"
  tabIndex={0}
>
  <button onClick={startTour}>开始引导</button>
</div>

// ❌ 避免：仅依赖视觉高亮
<div className="tour-target">内容</div>

// 引导内容添加 aria-live
<div aria-live="polite" className="sr-only">
  {currentStepContent}
</div>
```

### 2. 性能优化

```tsx
// ✅ 延迟加载引导库
const Joyride = lazy(() => import('react-joyride'));

// ✅ 只在需要时加载
function App() {
  const [showTour, setShowTour] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowTour(true)}>帮助</button>
      {showTour && (
        <Suspense fallback={null}>
          <Joyride steps={steps} />
        </Suspense>
      )}
    </>
  );
}

// ✅ 使用 Intersection Observer 检测元素可见性
const observer = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      // 元素可见，可以开始引导
    }
  },
  { threshold: 0.5 }
);
```

### 3. 国际化

```tsx
// react-joyride 国际化示例
const locale = {
  back: i18n.t('tour:back'),
  close: i18n.t('tour:close'),
  last: i18n.t('tour:last'),
  next: i18n.t('tour:next'),
  skip: i18n.t('tour:skip'),
};

<Joyride
  steps={translatedSteps}
  locale={locale}
/>

// 翻译文件结构
// locales/zh-CN/tour.json
{
  "back": "上一步",
  "close": "关闭",
  "last": "完成",
  "next": "下一步",
  "skip": "跳过"
}
```

### 4. 响应式处理

```tsx
// 监听 resize 和 scroll 重新定位
useEffect(() => {
  const handleResize = () => {
    // 刷新引导位置
    driver?.refresh();
  };

  window.addEventListener('resize', handleResize, { passive: true });
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// 移动端考虑
const isMobile = window.innerWidth < 768;
const placement = isMobile ? 'bottom' : 'right';
```

### 5. 常见问题

| 问题 | 解决方案 |
|------|----------|
| **目标元素被遮挡** | 使用 `scrollTo` 滚动到可见区域 |
| **元素不存在** | 监听 `targetNotFound` 事件，提供降级处理 |
| **动态内容** | 使用 MutationObserver 监听 DOM 变化 |
| **多步引导过长** | 分段引导，提供跳过选项 |
| **用户中途离开** | 记录进度，支持恢复 |

---

## 📁 相关资源

- [react-joyride 文档](https://react-joyride.com/)
- [driver.js 文档](https://driverjs.com/)
- [shepherd.js 文档](https://shepherdjs.com/)
- [intro.js 文档](https://introjs.com/)

---

## 🔄 更新日志

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.0.0 | 2026-03-26 | 初始文档，集成四大库对比 |
