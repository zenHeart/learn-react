import { useState, version } from 'react'
import { Link } from 'react-router'
import { processQueue } from './model.mjs'
import '../../08.async/lab/lab.css'

function Counter({ name }: { name: string }) {
  const [count, setCount] = useState(0)
  return <p><button onClick={() => setCount(n => n + 1)} aria-label={`${name} 加一`}>{name}：<output aria-label={`${name} 的状态`}>{count}</output></button></p>
}
function OtherCounter({ name }: { name: string }) { return <Counter name={name} /> }
function IdentityExperiment({ useIndex }: { useIndex: boolean }) {
  const [order, setOrder] = useState(['甲', '乙'])
  const [alternate, setAlternate] = useState(false)
  const Component = alternate ? OtherCounter : Counter
  return <><div className="race-actions"><button onClick={() => setOrder(items => [...items].reverse())}>反转列表</button><button onClick={() => setAlternate(value => !value)}>切换组件类型</button></div>
    {order.map((name, index) => <Component key={useIndex ? index : name} name={name} />)}</>
}
export default function StateMechanismLab() {
  const [count, setCount] = useState(0)
  const [prediction, setPrediction] = useState('')
  const [result, setResult] = useState<ReturnType<typeof processQueue> | null>(null)
  const [feedback, setFeedback] = useState('先预测，再选择一种更新方式。')
  const [indexKey, setIndexKey] = useState(false)
  const run = (functional: boolean) => {
    const actions = functional ? [1, 2, 3].map(() => (n: number) => n + 1) : [count + 1, count + 1, count + 1]
    const expected = processQueue(count, actions)
    for (const action of actions) setCount(action)
    setResult(expected)
    setFeedback(Number(prediction) === expected.state ? '预测吻合。现在解释队列中每一步的输入。' : `预测不符：模型得到 ${expected.state}。检查替换值是否来自同一次渲染。`)
  }
  return <article className="race-lab">
    <Link to="/">← 学习路线</Link><p className="race-label">机制复现 · 更新队列与状态身份</p>
    <h1>用真实 React 检查你的状态模型</h1>
    <p>运行时 React {version}。源码解释固定在 v19.1.0；升级运行时后需要重新核对。教学模型只保留队列归约和同层身份匹配，不实现 Fiber 调度。</p>
    <fieldset><legend>1. 同一事件中连续更新三次</legend>
      <p>真实 React 当前值：<output aria-label="真实 React 状态">{count}</output></p>
      <label htmlFor="state-prediction">预测最终数值</label><input id="state-prediction" type="number" value={prediction} onChange={e => setPrediction(e.target.value)} />
      <div className="race-actions"><button disabled={prediction === ''} onClick={() => run(false)}>三次 setCount(count + 1)</button><button disabled={prediction === ''} onClick={() => run(true)}>三次函数更新</button><button onClick={() => { setCount(0); setResult(null); setPrediction(''); setFeedback('已重置，请重新预测。') }}>重置队列实验</button></div>
      <p role="status">{feedback}</p>
      {result && <><p>教学模型结果：<output aria-label="模型状态">{result.state}</output>；与 React 实际值{result.state === count ? '一致' : '不同，请排查'}。</p><ol>{result.steps.map((step, i) => <li key={i}>{step.kind === 'replace' ? '替换' : '函数更新'}：{step.before} → {step.after}</li>)}</ol></>}
    </fieldset>
    <fieldset><legend>2. 状态属于哪个组件实例</legend>
      <p>先给甲加一，再反转列表。预测状态跟随甲，还是留在原来的位置。切换组件类型，再观察状态。</p>
      <label><input type="checkbox" checked={indexKey} onChange={e => setIndexKey(e.target.checked)} /> 使用数组索引作为 key（切换会重置实验）</label>
      <IdentityExperiment key={String(indexKey)} useIndex={indexKey} />
    </fieldset>
    <h2>追到固定版本源码</h2>
    <p><a href="https://github.com/facebook/react/blob/4a9df08157f001c01b078d259748512211233dcf/packages/react-reconciler/src/ReactFiberHooks.js">ReactFiberHooks.js</a>：定位 basicStateReducer、updateReducerImpl、dispatchSetState。解释替换值与函数如何进入队列，再找出教学模型省略的 lane 判断。</p>
    <p><a href="https://github.com/facebook/react/blob/4a9df08157f001c01b078d259748512211233dcf/packages/react-reconciler/src/ReactChildFiber.js">ReactChildFiber.js</a>：定位 reconcileSingleElement、updateSlot、updateElement，追踪 key、elementType 与复用/删除分支。key 只在当前兄弟范围内比较。</p>
    <h2>递进练习与验收</h2><ol>
      <li>示范：预测 0 起点的两种三次更新，运行并记录每一步。</li>
      <li>补全：遮住 model.mjs 的队列归约，实现混合“替换 → 函数 → 替换”。验收不能只测加一。</li>
      <li>独立：从空文件实现模型和反例测试，再用真实 React UI 检查结果。</li>
      <li>排错：解释索引 key 导致可编辑列表内容错位的原因，修复并保留回归测试。</li>
      <li>迁移：新增 transition、Suspense 或跨父节点移动，先说明现有模型无法证明什么，再阅读对应实现。</li>
      <li>延迟复测：三天后无提示解释混合队列与 key/type 重置，并提交源码定位和运行记录。</li>
    </ol>
    <details><summary>模型边界</summary><p>模型不含优先级、重放、eager bailout、并发中断、DOM 提交和 Effect。开发模式还可能重复调用纯更新函数检查副作用。模型与三个按钮的结果一致，只验证这些受控情景，不等于复现 React 全部行为。</p></details>
  </article>
}
