import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Home from '@/pages/Home'

const mockPrefetch = vi.fn()

vi.mock('@/contexts/PeriodContext', () => ({
  usePeriod: () => ({ month: '1', year: '2026' }),
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ prefetchQuery: mockPrefetch }),
}))

vi.mock('@/services/incomeQuery', () => ({
  getIncomesQueryOptions: (year: string) => ({ queryKey: ['incomes', year] }),
}))
vi.mock('@/services/expenseQuery', () => ({
  getExpensesQueryOptions: (year: string) => ({ queryKey: ['expenses', year] }),
}))
vi.mock('@/services/commitmentQuery', () => ({
  getCommitmentsQueryOptions: (year: string) => ({ queryKey: ['commitments', year] }),
}))
vi.mock('@/services/dashboardQuery', () => ({
  getDashboardQueryOptions: (month: string, year: string) => ({ queryKey: ['dashboard', month, year] }),
}))

vi.mock('@/components/layout/Layout', () => ({
  Layout: ({ children, title, onLogout, showPeriodoFilters, headerSlot }: any) => (
    <div data-testid="layout">
      <h1>{title}</h1>
      {headerSlot}
      {showPeriodoFilters && <span data-testid="period-filters" />}
      {children}
    </div>
  ),
}))

vi.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}))

vi.mock('@/components/home/QuickActions', () => ({
  __esModule: true,
  default: () => <div data-testid="quick-actions">QuickActions</div>,
}))
vi.mock('@/components/home/Alerts', () => ({
  __esModule: true,
  default: () => <div data-testid="alerts">Alerts</div>,
}))
vi.mock('@/components/home/MonthlySummary', () => ({
  __esModule: true,
  default: () => <div data-testid="monthly-summary">MonthlySummary</div>,
}))

describe('Home', () => {
  const onLogout = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Layout with title Home', () => {
    render(<Home onLogout={onLogout} />)
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument()
  })

  it('passes onLogout and showPeriodoFilters to Layout', () => {
    render(<Home onLogout={onLogout} />)
    expect(screen.getByTestId('layout')).toBeInTheDocument()
    expect(screen.getByTestId('period-filters')).toBeInTheDocument()
  })

  it('renders ThemeToggle in header slot', () => {
    render(<Home onLogout={onLogout} />)
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })

  it('prefetches incomes expenses commitments and dashboard queries', () => {
    render(<Home onLogout={onLogout} />)
    expect(mockPrefetch).toHaveBeenCalledWith({ queryKey: ['incomes', '2026'] })
    expect(mockPrefetch).toHaveBeenCalledWith({ queryKey: ['expenses', '2026'] })
    expect(mockPrefetch).toHaveBeenCalledWith({ queryKey: ['commitments', '2026'] })
    expect(mockPrefetch).toHaveBeenCalledWith({ queryKey: ['dashboard', '1', '2026'] })
  })

  it('renders Alerts section', async () => {
    render(<Home onLogout={onLogout} />)
    expect(await screen.findByTestId('alerts')).toBeInTheDocument()
  })

  it('renders MonthlySummary section', async () => {
    render(<Home onLogout={onLogout} />)
    expect(await screen.findByTestId('monthly-summary')).toBeInTheDocument()
  })

  it('renders QuickActions in fixed bottom section', async () => {
    render(<Home onLogout={onLogout} />)
    expect(await screen.findByTestId('quick-actions')).toBeInTheDocument()
  })
})
