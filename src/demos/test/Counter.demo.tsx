/**
 * Demo component: Counter
 * 用于测试的简单计数器组件
 */

import { useState } from 'react';

interface CounterProps {
  initialCount?: number;
  step?: number;
  onCountChange?: (count: number) => void;
}

function Counter({ initialCount = 0, step = 1, onCountChange }: CounterProps) {
  const [count, setCount] = useState(initialCount);

  const increment = () => {
    const newCount = count + step;
    setCount(newCount);
    onCountChange?.(newCount);
  };

  const decrement = () => {
    const newCount = count - step;
    setCount(newCount);
    onCountChange?.(newCount);
  };

  const reset = () => {
    setCount(initialCount);
    onCountChange?.(initialCount);
  };

  return (
    <div style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
      <h4>Count: {count}</h4>
      <button aria-label="减少计数" onClick={decrement} style={{ marginRight: '8px' }}>-</button>
      <button onClick={reset} style={{ marginRight: '8px' }}>Reset</button>
      <button aria-label="增加计数" onClick={increment}>+</button>
    </div>
  );
}

Counter.meta = {
  tags: ['testing', 'counter', 'hooks'],
  title: 'Counter 组件测试',
  description: '可测试的计数器组件，用于演示 React Testing Library 用法'
};

export default Counter;
