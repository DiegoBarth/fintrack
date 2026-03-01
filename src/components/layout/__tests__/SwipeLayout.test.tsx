import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { SwipeLayout } from '@/components/layout/SwipeLayout'
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation'

vi.mock('@/hooks/useSwipeNavigation', () => ({
  useSwipeNavigation: vi.fn(),
}))

function renderSwipeLayout(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<SwipeLayout />}>
          <Route index element={<span>Home outlet</span>} />
          <Route path="incomes" element={<span>Incomes outlet</span>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

const createHandlers = () => ({
  ref: vi.fn() as (el: HTMLElement | null) => void,
  onTouchStart: vi.fn(),
  onTouchMove: vi.fn(),
  onTouchEnd: vi.fn(),
  onMouseDown: vi.fn(),
  onMouseMove: vi.fn(),
  onMouseUp: vi.fn(),
  onMouseLeave: vi.fn(),
})

describe('SwipeLayout', () => {
  beforeEach(() => {
    vi.mocked(useSwipeNavigation).mockReturnValue({
      handlers: createHandlers(),
      arrow: null,
    })
  })

  it('renders container with min-h-screen and overflow-x-hidden', () => {
    const { container } = renderSwipeLayout()
    const wrapper = container.querySelector('.relative.min-h-screen.overflow-x-hidden')
    expect(wrapper).toBeInTheDocument()
  })

  it('renders main and Outlet content', () => {
    renderSwipeLayout()
    expect(screen.getByText('Home outlet')).toBeInTheDocument()
    expect(document.querySelector('main')).toBeInTheDocument()
  })

  it('calls useSwipeNavigation and spreads handlers on wrapper div', () => {
    const handlers = createHandlers()
    vi.mocked(useSwipeNavigation).mockReturnValue({ handlers, arrow: null })
    renderSwipeLayout()
    expect(useSwipeNavigation).toHaveBeenCalled()
    const wrapper = document.querySelector('.relative.min-h-screen.overflow-x-hidden')
    expect(wrapper).toBeInTheDocument()
  })

  it('renders SwipeArrow with arrow from useSwipeNavigation', () => {
    vi.mocked(useSwipeNavigation).mockReturnValue({
      handlers: createHandlers(),
      arrow: 'left',
    })
    renderSwipeLayout()
    const arrowWrapper = document.querySelector('.fixed.z-\\[9999\\]')
    expect(arrowWrapper).toBeInTheDocument()
    expect(arrowWrapper).toHaveClass('left-4')
  })

  it('renders correct outlet for nested route', () => {
    renderSwipeLayout('/incomes')
    expect(screen.getByText('Incomes outlet')).toBeInTheDocument()
    expect(screen.queryByText('Home outlet')).not.toBeInTheDocument()
  })

  it('renders SwipeArrow with right direction when arrow is right', () => {
    vi.mocked(useSwipeNavigation).mockReturnValue({
      handlers: createHandlers(),
      arrow: 'right',
    })
    renderSwipeLayout()
    const arrowWrapper = document.querySelector('.fixed.z-\\[9999\\]')
    expect(arrowWrapper).toHaveClass('right-4')
  })

  it('renders SwipeArrow with up direction when arrow is up', () => {
    vi.mocked(useSwipeNavigation).mockReturnValue({
      handlers: createHandlers(),
      arrow: 'up',
    })
    renderSwipeLayout()
    const arrowWrapper = document.querySelector('.fixed.z-\\[9999\\]')
    expect(arrowWrapper).toHaveClass('top-4')
  })
})
