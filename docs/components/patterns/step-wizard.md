# 复杂组件流程设计：Stepper / Wizard 模式

> 当确认框、表单成为顺序流程的一个步骤时，如何用状态机思维组织组件？

## 1. 问题背景

### 1.1 典型场景

- 多步骤向导：注册流程（输入信息 → 验证 → 完成）
- 确认对话框作为流程步骤：删除确认 → 密码确认 → 操作执行
- 嵌套流程：主流程中的子流程

### 1.2 问题本质

组件不再是独立的 UI 单元，而是**状态机中的一个状态**。组件之间的关系从"父子"变成"状态转移"。

---

## 2. 流程组件设计模式

### 2.1 Stepper 模式

将流程分解为多个步骤，每步是一个独立组件。

```tsx
// Stepper 组件定义
interface Step {
  id: string;
  title: string;
  component: React.ComponentType<StepProps>;
  validate?: () => boolean | Promise<boolean>;
}

interface StepperProps {
  steps: Step[];
  initialStep?: string;
  onComplete?: (results: StepResults) => void;
}
```

**步骤组件示例**：

```tsx
// Step 1: 信息输入
const UserInfoStep = ({ onNext, data }: StepProps) => {
  const [form, setForm] = useState(data || {});

  const handleNext = () => {
    if (validateForm(form)) {
      onNext({ userInfo: form });
    }
  };

  return (
    <div>
      <input
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />
      <button onClick={handleNext}>下一步</button>
    </div>
  );
};

// Step 2: 确认
const ConfirmStep = ({ onNext, onBack, data }: StepProps) => {
  return (
    <div>
      <p>确认用户名: {data.userInfo.name}</p>
      <button onClick={onBack}>返回</button>
      <button onClick={() => onNext()}>确认</button>
    </div>
  );
};
```

### 2.2 状态机驱动

```tsx
// 使用 useReducer 管理流程状态
type FlowState = 
  | { step: 'userInfo' }
  | { step: 'confirm' }
  | { step: 'loading' }
  | { step: 'success' }
  | { step: 'error'; error: Error };

type FlowAction =
  | { type: 'NEXT'; payload?: any }
  | { type: 'BACK' }
  | { type: 'RESET' }
  | { type: 'COMPLETE' }
  | { type: 'ERROR'; error: Error };

function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'NEXT':
      switch (state.step) {
        case 'userInfo': return { step: 'confirm' };
        case 'confirm': return { step: 'loading' };
        default: return state;
      }
    case 'BACK':
      switch (state.step) {
        case 'confirm': return { step: 'userInfo' };
        default: return state;
      }
    case 'COMPLETE':
      return { step: 'success' };
    case 'ERROR':
      return { step: 'error', error: action.error };
    case 'RESET':
      return { step: 'userInfo' };
    default:
      return state;
  }
}
```

### 2.3 Context 共享流程数据

```tsx
// FlowContext - 流程上下文
const FlowContext = createContext<{
  state: FlowState;
  dispatch: Dispatch<FlowAction>;
  stepData: Record<string, any>;  // 各步骤的数据
  setStepData: (stepId: string, data: any) => void;
} | null>(null);

// FlowProvider
function FlowProvider({ children, initialData }: { children: ReactNode; initialData?: any }) {
  const [state, dispatch] = useReducer(flowReducer, { step: 'userInfo' });
  const [stepData, setStepData] = useState<Record<string, any>>(initialData || {});

  const setStepDataFn = (stepId: string, data: any) => {
    setStepData(prev => ({ ...prev, [stepId]: data }));
  };

  return (
    <FlowContext.Provider value={{ state, dispatch, stepData, setStepDataFn }}>
      {children}
    </FlowContext.Provider>
  );
}

// 使用 Hook 访问
function useFlow() {
  const context = useContext(FlowContext);
  if (!context) throw new Error('useFlow must be used within FlowProvider');
  return context;
}
```

---

## 3. 确认框作为流程步骤

### 3.1 确认框的流程化

```tsx
// ConfirmDialogStep - 确认对话框组件
interface ConfirmDialogStepProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  danger?: boolean;  // 危险操作样式
}

function ConfirmDialogStep({
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  danger = false
}: ConfirmDialogStepProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <p>{message}</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant={danger ? 'danger' : 'primary'}
          loading={loading}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

### 3.2 多级确认流程

```tsx
// 多级确认示例：删除任务流程
type DeleteFlowState =
  | { step: 'confirm'; taskName: string }
  | { step: 'password' }
  | { step: 'loading' }
  | { step: 'success' }
  | { step: 'error'; message: string };

// Flow 组件
function DeleteTaskFlow({ taskId, taskName, onClose }: DeleteTaskFlowProps) {
  const [state, dispatch] = useReducer(deleteFlowReducer, {
    step: 'confirm',
    taskName
  });

  return (
    <Dialog open onClose={onClose}>
      {state.step === 'confirm' && (
        <ConfirmDialogStep
          title="确认删除"
          message={`确定要删除任务"${state.taskName}"吗？此操作无法撤销。`}
          onConfirm={() => dispatch({ type: 'NEXT' })}
          onCancel={onClose}
          danger
        />
      )}
      {state.step === 'password' && (
        <PasswordConfirmStep
          onConfirm={(password) => dispatch({ type: 'SUBMIT', password })}
          onBack={() => dispatch({ type: 'BACK' })}
        />
      )}
      {state.step === 'loading' && <LoadingSpinner />}
      {state.step === 'success' && <SuccessMessage onClose={onClose} />}
      {state.step === 'error' && (
        <ErrorMessage
          message={state.message}
          onRetry={() => dispatch({ type: 'RETRY' })}
        />
      )}
    </Dialog>
  );
}
```

---

## 4. 组件与状态分离

### 4.1 核心原则

```
UI 组件 = 纯函数（接收 props，渲染视图）
流程逻辑 = 状态机（管理状态转移）
数据层 = Context/Hooks（共享数据）
```

### 4.2 组件即状态

```tsx
// 每个步骤组件都是"状态"的视觉呈现
// 组件本身不管理流程，只负责渲染和emit事件

// Step 组件签名
interface StepComponentProps {
  data: any;           // 该步骤的数据
  onComplete: (data?: any) => void;  // 完成当前步骤
  onError?: (error: Error) => void;   // 错误处理
}

// 例如：PaymentStep
function PaymentStep({ data, onComplete }: StepComponentProps) {
  const { amount, orderId } = data;
  
  const handlePayment = async () => {
    const result = await processPayment(orderId, amount);
    onComplete(result);  // 完成并传递结果
  };

  return <PaymentForm amount={amount} onSubmit={handlePayment} />;
}
```

### 4.3 流程编排器

```tsx
// FlowOrchestrator - 流程编排器
function FlowOrchestrator<T extends string>({
  steps: stepDefinitions,
  initialStep,
  onComplete,
  onError
}: FlowOrchestratorProps) {
  const [currentStepId, setCurrentStepId] = useState(initialStep);
  const [stepResults, setStepResults] = useState<Record<string, any>>({});

  const currentStep = stepDefinitions.find(s => s.id === currentStepId);
  const StepComponent = currentStep?.component;

  const handleStepComplete = (result?: any) => {
    const newResults = { ...stepResults, [currentStepId]: result };
    setStepResults(newResults);

    // 查找下一步
    const currentIndex = stepDefinitions.findIndex(s => s.id === currentStepId);
    const nextStep = stepDefinitions[currentIndex + 1];

    if (nextStep) {
      setCurrentStepId(nextStep.id);
    } else {
      onComplete?.(newResults);
    }
  };

  if (!StepComponent) {
    return <div>流程结束</div>;
  }

  return (
    <StepComponent
      data={stepResults[currentStepId]}
      onComplete={handleStepComplete}
    />
  );
}
```

---

## 5. 实际应用：表单提交流程

### 5.1 场景：用户注册流程

```tsx
// 步骤定义
const registrationSteps: Step[] = [
  {
    id: 'basic-info',
    title: '基本信息',
    component: BasicInfoStep,
    validate: (data) => !!data.email && !!data.password
  },
  {
    id: 'profile',
    title: '个人资料',
    component: ProfileStep,
    validate: (data) => !!data.name
  },
  {
    id: 'confirm',
    title: '确认信息',
    component: ConfirmStep
  },
  {
    id: 'complete',
    title: '完成',
    component: CompleteStep
  }
];

// 使用
function RegistrationPage() {
  const handleComplete = async (results) => {
    await registerUser({
      ...results['basic-info'],
      ...results['profile']
    });
  };

  return (
    <FlowProvider initialStep="basic-info">
      <FlowOrchestrator
        steps={registrationSteps}
        onComplete={handleComplete}
      />
    </FlowProvider>
  );
}
```

### 5.2 各步骤组件实现

```tsx
// BasicInfoStep
function BasicInfoStep({ data, onComplete }: StepProps) {
  const [form, setForm] = useState(data || {});

  return (
    <Form>
      <input
        label="邮箱"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        label="密码"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
      />
      <Button onClick={() => onComplete(form)}>下一步</Button>
    </Form>
  );
}

// ProfileStep
function ProfileStep({ data, onComplete }: StepProps) {
  const [form, setForm] = useState(data || {});

  return (
    <Form>
      <input
        label="姓名"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />
      <Button onClick={() => onComplete(form)}>下一步</Button>
    </Form>
  );
}

// ConfirmStep
function ConfirmStep({ data, onComplete }: StepProps) {
  const { 'basic-info': basicInfo, profile } = data;

  return (
    <div>
      <p>邮箱: {basicInfo.email}</p>
      <p>姓名: {profile.name}</p>
      <Button onClick={onComplete}>确认注册</Button>
    </div>
  );
}
```

---

## 6. 状态机模式进阶

### 6.1 XState 集成

```tsx
import { useMachine } from '@xstate/react';
import { setup, assign } from 'xstate';

// 状态机定义
const registrationMachine = setup({
  types: {
    context: {} as {
      email: string;
      password: string;
      name: string;
    },
    events: {} as
      | { type: 'NEXT'; data: Partial<typeof context> }
      | { type: 'BACK' }
      | { type: 'SUBMIT' }
  },
  actions: {
    assignData: assign({
      ...context
    })
  }
}).createMachine({
  id: 'registration',
  initial: 'basicInfo',
  context: { email: '', password: '', name: '' },
  states: {
    basicInfo: {
      on: {
        NEXT: {
          target: 'profile',
          actions: 'assignData'
        }
      }
    },
    profile: {
      on: {
        NEXT: {
          target: 'confirm',
          actions: 'assignData'
        },
        BACK: 'basicInfo'
      }
    },
    confirm: {
      on: {
        SUBMIT: 'submitting',
        BACK: 'profile'
      }
    },
    submitting: {
      invoke: {
        src: 'submitRegistration',
        onDone: 'success',
        onError: 'error'
      }
    },
    success: {
      type: 'final'
    },
    error: {
      on: {
        RETRY: 'submitting',
        BACK: 'confirm'
      }
    }
  }
});
```

### 6.2 使用 XState 的组件

```tsx
function RegistrationFlow() {
  const [state, send] = useMachine(registrationMachine);

  return (
    <div>
      {state.matches('basicInfo') && (
        <BasicInfoStep onNext={(data) => send({ type: 'NEXT', data })} />
      )}
      {state.matches('profile') && (
        <ProfileStep
          onNext={(data) => send({ type: 'NEXT', data })}
          onBack={() => send({ type: 'BACK' })}
        />
      )}
      {state.matches('confirm') && (
        <ConfirmStep
          onSubmit={() => send({ type: 'SUBMIT' })}
          onBack={() => send({ type: 'BACK' })}
        />
      )}
      {state.matches('submitting') && <LoadingSpinner />}
      {state.matches('success') && <SuccessMessage />}
      {state.matches('error') && (
        <ErrorMessage onRetry={() => send({ type: 'RETRY' })} />
      )}
    </div>
  );
}
```

---

## 7. 最佳实践

### 7.1 设计原则

1. **组件纯化**：UI 组件只负责渲染，流程逻辑交给状态机
2. **数据不可变**：每步数据通过回调传递，不在组件内部修改
3. **错误边界**：每个步骤都应有错误处理
4. **进度可见**：用户应始终知道当前在哪一步

### 7.2 性能优化

```tsx
// 使用 React.memo 优化步骤切换
const ConfirmStep = React.memo(function ConfirmStep({ data, onComplete }) {
  // ...
});

// 懒加载非首步组件
const ProfileStep = lazy(() => import('./ProfileStep'));
const ConfirmStep = lazy(() => import('./ConfirmStep'));
```

### 7.3 可访问性

```tsx
// 确保键盘导航和屏幕阅读器支持
function StepContainer({ children, currentStep }) {
  return (
    <div role="region" aria-label={`步骤 ${currentStep}`}>
      <h2>第 {getStepNumber(currentStep)} 步</h2>
      {children}
    </div>
  );
}
```

---

## 8. 相关文档

- [React 组件设计](../component-design.md)
- [Context 与状态管理](../context-patterns.md)
- [XState 状态机](../xstate-integration.md)
