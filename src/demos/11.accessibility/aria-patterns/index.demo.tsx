import { useRef, useState } from 'react'
export default function App() {
  const [choice, setChoice] = useState('a')
  const [result, setResult] = useState('尚未保存。')
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  return <section style={{ padding: 24 }}><h2>键盘操作与对话框焦点</h2>
    <p>先使用浏览器原生控件。需要自定义 listbox 时，再补齐焦点、选中状态和完整键盘合同。</p>
    <label htmlFor="a11y-choice">合成选项</label><select id="a11y-choice" value={choice} onChange={event => setChoice(event.target.value)}><option value="a">选项甲</option><option value="b">选项乙</option><option value="c">选项丙</option></select>
    <button ref={opener} onClick={() => dialog.current?.showModal()}>打开确认对话框</button>
    <dialog ref={dialog} aria-labelledby="dialog-title" onClose={() => opener.current?.focus()}>
      <h3 id="dialog-title">确认合成选项</h3><p>当前选项：{choice}</p>
      <form method="dialog"><button value="cancel">取消</button><button value="confirm" onClick={() => setResult('已在页面确认选项 ' + choice)}>确认</button></form>
    </dialog>
    <p role="status">{result}</p>
    <h3>验收任务</h3><ol><li>只用键盘选择选项并打开对话框。</li><li>Tab/Shift+Tab 不应进入背景；Escape 关闭后焦点应回到触发按钮。</li><li>通过屏幕阅读器检查对话框名称与反馈；此项需要真实辅助技术验证，DOM 测试不能代替。</li><li>迁移成删除确认，明确取消与确认的不同结果；三天后独立复现焦点恢复。</li></ol>
  </section>
}
App.meta = { disableSandpack: true, title: '键盘与焦点管理', tags: ['accessibility', 'keyboard', 'dialog'] }
