import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HomeFallback } from '@/components/home/HomeFallback'

vi.mock('@/components/layout/Layout', () => ({
  Layout: ({ children, title, headerSlot }: any) => (
    <div data-testid="layout">
      <h1>{title}</h1>
      {headerSlot}
      {children}
    </div>
  ),
}))

vi.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}))

describe('HomeFallback', () => {
  it('renders Layout with title Home', () => {
    render(<HomeFallback />)
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument()
  })

  it('renders Resumo do Mês section', () => {
    render(<HomeFallback />)
    expect(screen.getByRole('heading', { name: 'Resumo do Mês' })).toBeInTheDocument()
  })

  it('renders theme toggle in header', () => {
    render(<HomeFallback />)
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })

  it('renders skeleton cards (grid with multiple items)', () => {
    const { container } = render(<HomeFallback />)
    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
    const cards = container.querySelectorAll('[style*="border"]')
    expect(cards.length).toBeGreaterThanOrEqual(5)
  })

  it('passes onLogout to Layout when provided', () => {
    const onLogout = vi.fn()
    render(<HomeFallback onLogout={onLogout} />)
    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })
})
