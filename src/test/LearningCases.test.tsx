import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import ControlledForm from '../demos/06.forms/01.controlled-form/index.demo'
import ErrorDemo from '../demos/07.error-boundary/index.demo'
import SuspenseDemo from '../demos/07.error-boundary/Suspense.demo'
import ServiceDesk from '../demos/12.business/lab/ServiceDeskLab'
import Mechanism from '../demos/13.mechanisms/lab/StateMechanismLab'
import Routing from '../demos/05.router/typed-routes.demo'

describe('teaching examples enforce observable contracts', () => {
  test('route parameters, signed-out redirect and unknown paths are observable', async () => {
    render(<Routing />)
    fireEvent.click(screen.getByRole('link', { name: '用户 123' }))
    expect(screen.getByText('用户详情：123')).toBeDefined()
    fireEvent.click(screen.getByRole('link', { name: '设置' }))
    expect(await screen.findByText('请使用演示登录按钮，再进入设置。')).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: '演示登录' }))
    expect(await screen.findByRole('heading', { name: '设置页面' })).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: '退出演示登录' }))
    expect(await screen.findByText('请使用演示登录按钮，再进入设置。')).toBeDefined()
    fireEvent.click(screen.getByRole('link', { name: '未知路径' }))
    expect(screen.getByText('路径不存在，请返回首页。')).toBeDefined()
  })
  test('cross-field errors update when the original password changes, without exposing its value', () => {
    const { container } = render(<ControlledForm />)
    const password = screen.getByLabelText('演示口令')
    const confirmation = screen.getByLabelText('确认演示口令')
    fireEvent.change(password, { target: { value: 'synthetic-first' } })
    fireEvent.change(confirmation, { target: { value: 'synthetic-first' } })
    fireEvent.blur(confirmation)
    expect(screen.queryByText('两次输入不一致')).toBeNull()
    fireEvent.change(password, { target: { value: 'synthetic-second' } })
    expect(confirmation.getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByText('两次输入不一致')).toBeDefined()
    expect(container.textContent).not.toContain('synthetic-first')
    expect(container.textContent).not.toContain('synthetic-second')
  })
  test('rendering failure is contained and reset remounts the child', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      render(<ErrorDemo />)
      for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: '增加计数' }))
      expect(screen.getByText('Something went wrong')).toBeDefined()
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
      expect(screen.getByText('计数：0')).toBeDefined()
    } finally { log.mockRestore() }
  })
  test('lazy module resolves inside a real Suspense boundary', async () => {
    render(<SuspenseDemo />)
    fireEvent.click(screen.getByRole('button', { name: '加载分割模块' }))
    expect(await screen.findByText('独立模块已加载，可以开始交互。')).toBeDefined()
  })
  test('business UI retains request intent across response loss and retry', () => {
    render(<MemoryRouter><ServiceDesk /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('标题（1–80 字）'), { target: { value: '测试工单' } })
    fireEvent.click(screen.getByLabelText(/模拟下一次响应丢失/))
    fireEvent.click(screen.getByRole('button', { name: '提交工单 / 重试' }))
    expect(screen.getByRole('alert').textContent).toContain('响应丢失')
    fireEvent.click(screen.getByRole('button', { name: '提交工单 / 重试' }))
    expect(screen.getByRole('status').textContent).toContain('没有重复创建')
    expect(screen.getAllByRole('heading', { name: 'T-1 · 测试工单' })).toHaveLength(1)
  })
  test('actual React replacement and function queues produce different results', () => {
    render(<MemoryRouter><Mechanism /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('预测最终数值'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: '三次 setCount(count + 1)' }))
    expect(screen.getByLabelText('真实 React 状态').textContent).toBe('1')
    fireEvent.change(screen.getByLabelText('预测最终数值'), { target: { value: '4' } })
    fireEvent.click(screen.getByRole('button', { name: '三次函数更新' }))
    expect(screen.getByLabelText('真实 React 状态').textContent).toBe('4')
  })
})
