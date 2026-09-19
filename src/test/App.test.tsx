import { test, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import LearningHome from '../components/LearningHome'

test('home links to real available tasks without claiming learner mastery', () => {
  render(<MemoryRouter><LearningHome lessons={[{ name: '工单交付', path: '/labs/service-desk' }]} /></MemoryRouter>)
  fireEvent.click(screen.getByRole('button', { name: '完成业务任务' }))
  expect(screen.getByRole('link', { name: '开始：工单模块交付 →' }).getAttribute('href')).toBe('/labs/service-desk')
  expect(screen.getByText(/起点选择用于安排任务，不代表已掌握/)).toBeDefined()
})
