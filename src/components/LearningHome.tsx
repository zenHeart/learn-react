import { useState } from 'react'
import { Link } from 'react-router'
import './LearningHome.css'

type Lesson = { name: string; path: string }
const stages = [
  { id: 'foundation', title: '基础与组件', prefixes: ['/00.concept/', '/01.jsx/', '/02.component/'],
    outcome: '把界面拆成组件，让输入、状态和渲染形成可解释的数据流。',
    task: '独立做一个可筛选的列表，说明哪些数据应该存入 state，并用稳定的 key 保留输入。',
    picks: [['/00.concept/02.BuildWithJSX', '用 JSX 构建第一个界面'], ['/01.jsx/03.ListRender', '列表渲染与稳定标识']] },
  { id: 'effects', title: '状态与副作用', prefixes: ['/03.hooks/'],
    outcome: '区分渲染计算、事件处理和与外部系统同步的副作用。',
    task: '预测一次状态更新后的渲染，再为订阅或请求添加清理；说明闭包读取的是哪次渲染的数据。',
    picks: [['/03.hooks/apis/01_useState', '状态更新与渲染'], ['/03.hooks/03_useEffect_clean', 'Effect 的清理与生命周期']] },
  { id: 'delivery', title: '业务模块交付', prefixes: ['/labs/service-desk', '/labs/async-race', '/06.forms', '/07.error-boundary', '/08.async', '/11.accessibility'],
    outcome: '把加载、空态、校验、失败恢复和键盘操作一起纳入交付。',
    task: '完成一个可重试的查询表单。故意制造乱序响应，证明旧结果不能覆盖新选择。',
    picks: [['/labs/service-desk', '工单模块交付'], ['/labs/async-race', '异步请求与竞态诊断']] },
  { id: 'ecosystem', title: '生态与工具选择', prefixes: ['/04.state-manage/', '/05.router/', '/06.typescript/'],
    outcome: '围绕项目约束选择路由、类型与状态工具，说明替代方案和代价。',
    task: '区分组件本地状态、跨页面状态与服务端缓存，为一个工具选择写出采用和放弃的理由。',
    picks: [['/05.router/typed-routes', '路由与访问控制边界'], ['/06.typescript/01.props-types', '组件 Props 的类型边界']] },
  { id: 'performance', title: '性能与工程验证', prefixes: ['/09.performance/'],
    outcome: '用测量定位问题，用测试和可重复的构建证明改动。',
    task: '记录慢交互的测量条件，比较优化前后的结果，并解释 memo 为什么可能没有帮助。',
    picks: [['/09.performance/measured-list', '可测量的列表优化'], ['/09.performance/LazyComponent', '按需加载组件']] },
  { id: 'mechanism', title: '机制与源码', prefixes: ['/labs/state-mechanism', '/10.theory/'],
    outcome: '从可观察行为追到实现机制，明确教学模型与真实 React 源码的边界。',
    task: '先预测 key 变化对状态的影响，再复现最小机制；阅读固定版本源码，列出模型省略的行为。',
    picks: [['/labs/state-mechanism', '状态队列与身份复现'], ['/10.theory/vdom', '最小虚拟 DOM 模型']] },
] as const

const startingPoints = [
  { id: 'foundation', label: '从基础开始', brief: '先做出一个能交互的小界面，再解释它为什么这样更新。' },
  { id: 'delivery', label: '完成业务任务', brief: '从状态和 Effect 出发，交付包含失败恢复的业务模块。' },
  { id: 'mechanism', label: '追踪底层机制', brief: '从行为预测开始，用最小复现和固定版本源码检查你的解释。' },
] as const

export default function LearningHome({ lessons }: { lessons: Lesson[] }) {
  const [start, setStart] = useState<string>('foundation')
  const selected = startingPoints.find(point => point.id === start)!
  const targetStage = stages.find(stage => stage.id === start)!
  const available = (stage: typeof stages[number]) => lessons.filter(lesson =>
    stage.prefixes.some(prefix => prefix.endsWith('/') ? lesson.path.startsWith(prefix) : lesson.path === prefix || lesson.path.startsWith(prefix + '/')))
  const links = (stage: typeof stages[number]) => {
    const entries = available(stage)
    const curated = stage.picks.flatMap(([path, label]) => entries.some(entry => entry.path === path) ? [{ path, label }] : [])
    return curated.length ? curated : entries.slice(0, 2).map(entry => ({ path: entry.path, label: entry.name.replace(/^\d+[._-]?/, '').replace(/[._-]/g, ' ') }))
  }
  const next = links(targetStage)[0]

  return (
    <div className="learning-home">
      <header className="learning-intro">
        <p className="learning-eyebrow">LEARN REACT · 学习路线</p>
        <h1>从写出组件，到独立交付与理解机制</h1>
        <p>每次学习完成一个能运行、能解释、能排错的作品。按任务选择起点，遇到缺口再回补基础。</p>
      </header>

      <section className="learning-start" aria-labelledby="start-title">
        <h2 id="start-title">这次从哪里开始</h2>
        <div className="learning-choices" role="group" aria-label="选择学习起点">
          {startingPoints.map(point => <button key={point.id} type="button" aria-pressed={start === point.id} onClick={() => setStart(point.id)}>{point.label}</button>)}
        </div>
        <p aria-live="polite">{selected.brief}</p>
        <p className="learning-task">{targetStage.task}</p>
        {next ? <Link className="learning-primary" to={next.path}>开始：{next.label} →</Link> : <p>这个起点的课程正在补充，请先从基础与组件开始。</p>}
        <p className="learning-note">起点选择用于安排任务，不代表已掌握。先独立尝试，再根据卡住的位置选择课程。</p>
      </section>

      <section aria-labelledby="route-title">
        <div className="learning-section-heading"><h2 id="route-title">围绕真实任务学习</h2><span>基础 → 交付 → 机制与迁移</span></div>
        <div className="learning-grid">
          {stages.map((stage, index) => <article className="learning-stage" key={stage.id}>
            <p className="learning-stage-number">{String(index + 1).padStart(2, '0')}</p>
            <h3>{stage.title}</h3>
            <p>{stage.outcome}</p>
            <details><summary>用什么任务检验</summary><p>{stage.task}</p></details>
            {links(stage).length ? <ul>{links(stage).map(link => <li key={link.path}><Link to={link.path}>{link.label} →</Link></li>)}</ul> : <p className="learning-note">课程待补充</p>}
          </article>)}
        </div>
      </section>

      <section className="learning-evidence" aria-labelledby="evidence-title">
        <h2 id="evidence-title">怎样证明自己学会了</h2>
        <ol>
          <li><strong>解释：</strong>先预测运行结果，再说明数据流、边界和取舍。</li>
          <li><strong>独立完成：</strong>关闭参考实现，从新起点交付代码和测试。</li>
          <li><strong>排错与迁移：</strong>修复陌生故障，换一组约束再次完成任务。</li>
          <li><strong>延迟复测：</strong>隔一段时间无提示重做，记录遗忘和提示依赖。</li>
        </ol>
        <p>示例能运行、读完一篇文档和独立掌握是不同的证据。保留你的作品、失败记录与测试结果，用它们决定下一步。</p>
      </section>
      <footer className="learning-footer"><Link to="/curriculum">能力矩阵与岗位路线</Link><Link to="/sources">固定版本来源</Link><Link to="/tasks">跨模块任务</Link><a href="https://learn.zenheart.site/pathways/">查看跨系列学习路线 →</a><span>领域知识长期维护，岗位任务按证据更新。</span></footer>
    </div>
  )
}
