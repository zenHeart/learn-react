/**
 * TypeScript with React - 展示 React + TypeScript 的核心用法
 *
 * 覆盖：
 * 1. Props 类型定义
 * 2. useState 类型推断
 * 3. 事件类型
 * 4. 泛型组件
 */

import { useState, ReactNode } from 'react';

// 1. Props 类型定义
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  children?: ReactNode;
}

function Button({ label, onClick, variant = 'primary', disabled = false, children }: ButtonProps) {
  const colors = {
    primary: '#2563eb',
    secondary: '#6b7280',
    danger: '#dc2626'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 16px',
        background: colors[variant],
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1
      }}
    >
      {children || label}
    </button>
  );
}

// 2. 带默认值的 Props
interface CardProps {
  title: string;
  description?: string;
  onClose?: () => void;
}

function Card({ title, description, onClose }: CardProps) {
  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '16px',
      maxWidth: '300px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {onClose && (
          <button onClick={onClose} aria-label="关闭卡片" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
            ×
          </button>
        )}
      </div>
      {description && <p style={{ color: '#666', marginTop: '8px' }}>{description}</p>}
    </div>
  );
}

// 3. useState 类型推断
function Counter() {
  const [count, setCount] = useState<number>(0);
  const [name, setName] = useState<string>('');

  return (
    <div style={{ padding: '16px' }}>
      <h4>Counter: {count}</h4>
      <button onClick={() => setCount(c => c + 1)} style={{ marginRight: '8px' }}>+</button>
      <button onClick={() => setCount(c => c - 1)}>-</button>

      <h4 style={{ marginTop: '16px' }}>Name: {name || '(empty)'}</h4>
      <input
        aria-label="合成名称"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Type your name"
        style={{ padding: '8px', width: '200px' }}
      />
    </div>
  );
}

// 4. 事件类型
function FormWithTypes() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    alert(`Submitted: ${formData.get('name')}`);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Typed event: inspect the value in memory; do not log learner input.
    void e.target.value;
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
      <input
        type="text"
        name="name"
        aria-label="测试名称"
        placeholder="Your name"
        onChange={handleInput}
        style={{ padding: '8px', marginRight: '8px' }}
      />
      <button type="submit" style={{ padding: '8px 16px' }}>Submit</button>
    </form>
  );
}

// 5. 泛型组件
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {items.map((item, index) => (
        <li key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

function App() {
  const fruits = ['Apple', 'Banana', 'Orange'];
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>React + TypeScript</h2>

      <h3>1. Props with Types</h3>
      <Button label="Click me" onClick={() => alert('Clicked!')} variant="primary" />
      <Button label="Disabled" onClick={() => {}} disabled />

      <h3 style={{ marginTop: '24px' }}>2. Optional Props</h3>
      <Card title="Hello" description="This is a card" onClose={() => alert('Closed')} />
      <Card title="Minimal" />

      <h3 style={{ marginTop: '24px' }}>3. useState Types</h3>
      <Counter />

      <h3 style={{ marginTop: '24px' }}>4. Event Types</h3>
      <FormWithTypes />

      <h3 style={{ marginTop: '24px' }}>5. Generic Components</h3>
      <List
        items={fruits}
        keyExtractor={(item) => item}
        renderItem={(fruit) => <span style={{ padding: '4px' }}>{fruit}</span>}
      />
      <List
        items={users}
        keyExtractor={(user) => user.id}
        renderItem={(user) => <span style={{ padding: '4px' }}>{user.name} (id: {user.id})</span>}
      />
    </div>
  );
}

App.meta = {
  tags: ['typescript', 'generics', 'props', 'type-safety'],
  title: 'React + TypeScript',
  description: '为组件 props、state、事件和自定义 Hook 编写完整类型定义'
};

export default App;
