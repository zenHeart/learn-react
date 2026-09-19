import { useState } from 'react'

type Fields = { username: string; email: string; password: string; confirmPassword: string }
const names = ['username', 'email', 'password', 'confirmPassword'] as const
const labels = { username: '合成用户名', email: '测试邮箱', password: '演示口令', confirmPassword: '确认演示口令' }
export function validate(data: Fields): Partial<Fields> {
  const errors: Partial<Fields> = {}
  if (data.username.trim().length < 3) errors.username = '用户名至少 3 个字符'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = '请输入有效的测试邮箱'
  if (data.password.length < 8) errors.password = '演示口令至少 8 个字符'
  if (data.confirmPassword !== data.password) errors.confirmPassword = '两次输入不一致'
  return errors
}
export default function App() {
  const [data, setData] = useState<Fields>({ username: '', email: '', password: '', confirmPassword: '' })
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({})
  const [feedback, setFeedback] = useState('')
  const errors = validate(data)
  return <section style={{ maxWidth: 500, margin: 'auto', padding: 24 }}>
    <h2>受控表单与交叉字段校验</h2>
    <p>只使用合成数据，例如 learner@example.invalid；不要填写真实密码。此页面不注册账户、不发送或保存输入。口令不会出现在调试输出中。</p>
    <form noValidate onSubmit={event => { event.preventDefault(); setTouched(Object.fromEntries(names.map(name => [name, true]))); setFeedback(Object.keys(errors).length ? '请修正字段错误。' : '本地校验通过，尚未发送到服务器。') }}>
      {names.map(name => <div key={name} style={{ marginBottom: 16 }}>
        <label htmlFor={`form-${name}`}>{labels[name]}</label>
        <input id={`form-${name}`} name={name} type={name.toLowerCase().includes('password') ? 'password' : name === 'email' ? 'email' : 'text'} autoComplete="off"
          value={data[name]} onChange={event => { setData({ ...data, [name]: event.target.value }); setFeedback('') }} onBlur={() => setTouched({ ...touched, [name]: true })}
          aria-invalid={Boolean(touched[name] && errors[name])} aria-describedby={`error-${name}`} style={{ display: 'block', width: '100%', padding: 8, font: 'inherit' }} />
        <span id={`error-${name}`} role="status">{touched[name] && errors[name]}</span>
      </div>)}
      <button type="submit">校验表单</button><p role="status">{feedback}</p>
    </form>
    <details><summary>任务、反例与迁移</summary><p>先让两次口令一致，触碰确认字段，再修改第一项。确认错误应立即出现。独立实现验证函数及反例测试；再迁移为服务端校验，解释为什么前端校验不能提供安全保证。三天后无提示重做。</p></details>
  </section>
}
App.meta = { disableSandpack: true, tags: ['forms', 'validation', 'controlled-components'], title: '受控表单与交叉字段校验' }
