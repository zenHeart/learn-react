import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Counter from '../demos/test/Counter.demo'

describe('Counter', () => {
  it('renders with initial count', () => {
    render(<Counter />)
    expect(screen.getByText('Count: 0')).toBeDefined()
  })

  it('increments count on + button click', () => {
    render(<Counter />)
    const incrementBtn = screen.getByText('+')
    fireEvent.click(incrementBtn)
    expect(screen.getByText('Count: 1')).toBeDefined()
  })

  it('decrements count on - button click', () => {
    render(<Counter initialCount={5} />)
    const decrementBtn = screen.getByText('-')
    fireEvent.click(decrementBtn)
    expect(screen.getByText('Count: 4')).toBeDefined()
  })

  it('resets count to initial value', () => {
    render(<Counter initialCount={10} />)
    fireEvent.click(screen.getByText('+'))
    fireEvent.click(screen.getByText('+'))
    expect(screen.getByText('Count: 12')).toBeDefined()

    fireEvent.click(screen.getByText('Reset'))
    expect(screen.getByText('Count: 10')).toBeDefined()
  })

  it('calls onCountChange callback', () => {
    const mockCallback = vi.fn()
    render(<Counter onCountChange={mockCallback} />)
    fireEvent.click(screen.getByText('+'))
    expect(mockCallback).toHaveBeenCalledWith(1)
  })

  it('renders with custom initial count', () => {
    render(<Counter initialCount={42} />)
    expect(screen.getByText('Count: 42')).toBeDefined()
  })
})


it('supports an explicit step without changing the reset target', () => {
  render(<Counter initialCount={2} step={3} />)
  fireEvent.click(screen.getByRole('button', { name: '增加计数' }))
  expect(screen.getByText('Count: 5')).toBeDefined()
  fireEvent.click(screen.getByRole('button', { name: '减少计数' }))
  expect(screen.getByText('Count: 2')).toBeDefined()
})
