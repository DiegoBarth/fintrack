import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import { useDashboard } from '@/hooks/useDashboard'
import { useSummary } from '@/hooks/useSummary'

beforeEach(() => {
  class MockIntersectionObserver {
    observe = vi.fn()
    disconnect = vi.fn()
    unobserve = vi.fn()
    constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
      queueMicrotask(() => cb([{ isIntersecting: true }]))
    }
  }
  window.IntersectionObserver = MockIntersectionObserver as any
})

vi.mock('@/contexts/PeriodContext', () => ({
  usePeriod: () => ({ month: '1', year: '2026' }),
}))

vi.mock('@/hooks/useDashboard', () => ({
  useDashboard: vi.fn(),
}))

vi.mock('@/hooks/useSummary', () => ({
  useSummary: vi.fn(),
}))

vi.mock('@/components/layout/Layout', () => ({
  Layout: ({ children, title, onBack, containerClassName }: any) => (
    <div data-testid="layout">
      <h1>{title}</h1>
      <button onClick={onBack} data-testid="back-button">Voltar</button>
      <div data-container-class={containerClassName}>{children}</div>
    </div>
  ),
}))

vi.mock('@/components/dashboard/CreditCards', () => ({
  __esModule: true,
  default: ({ cards }: { cards: unknown[] }) => <div data-testid="credit-cards">Cards: {cards.length}</div>,
}))
vi.mock('@/components/dashboard/IncomeExpenseProgress', () => ({
  __esModule: true,
  default: () => <div data-testid="income-expense-progress">Progress</div>,
}))
vi.mock('@/components/dashboard/YearlyBalanceChart', () => ({
  __esModule: true,
  default: () => <div data-testid="yearly-balance-chart">Chart</div>,
}))
vi.mock('@/components/dashboard/TopCategories', () => ({
  __esModule: true,
  default: ({ categories }: { categories: unknown[] }) => <div data-testid="top-categories">Categories: {categories.length}</div>,
}))

vi.mock('@/components/dashboard/skeletons/IncomeExpenseSkeleton', () => ({
  IncomeExpenseSkeleton: () => <div data-testid="income-expense-skeleton">Skeleton</div>,
}))
vi.mock('@/components/dashboard/skeletons/TopCategoriesSkeleton', () => ({
  TopCategoriesSkeleton: () => <div data-testid="top-categories-skeleton">Skeleton</div>,
}))
vi.mock('@/components/dashboard/skeletons/CreditCardsSkeleton', () => ({
  CreditCardsSkeleton: () => <div data-testid="credit-cards-skeleton">Skeleton</div>,
}))
vi.mock('@/components/dashboard/skeletons/YearlyBalanceSkeleton', () => ({
  YearlyBalanceSkeleton: () => <div data-testid="yearly-balance-skeleton">Skeleton</div>,
}))

const defaultDashboard = {
  cardsSummary: [{ card: 'Nubank', total: 500 }],
  topCategories: [{ name: 'Casa', value: 1000 }],
  monthlyBalance: [{ month: 'Jan', balance: 2000 }],
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useDashboard).mockReturnValue({
      dashboard: defaultDashboard,
      isLoading: false,
    } as any)
    vi.mocked(useSummary).mockReturnValue({
      summary: {},
      isLoading: false,
      isError: false,
    } as any)
  })

  it('renders Layout with title Dashboard', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('uses containerClassName max-w-7xl', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    await screen.findByRole('heading', { name: 'Dashboard' })
    expect(document.querySelector('[data-container-class="max-w-7xl"]')).toBeInTheDocument()
  })

  it('renders skeletons when isLoading', async () => {
    vi.mocked(useDashboard).mockReturnValue({
      dashboard: defaultDashboard,
      isLoading: true,
    } as any)
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(await screen.findByTestId('income-expense-skeleton')).toBeInTheDocument()
    expect(screen.getByTestId('credit-cards-skeleton')).toBeInTheDocument()
    expect(screen.getByTestId('top-categories-skeleton')).toBeInTheDocument()
    expect(screen.getByTestId('yearly-balance-skeleton')).toBeInTheDocument()
  })

  it('renders CreditCards with dashboard.cardsSummary when loaded', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(await screen.findByTestId('credit-cards')).toBeInTheDocument()
    expect(screen.getByText(/Cards: 1/)).toBeInTheDocument()
  })

  it('renders IncomeExpenseProgress when loaded', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(await screen.findByTestId('income-expense-progress')).toBeInTheDocument()
  })

  it('renders TopCategories with dashboard.topCategories when loaded', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(await screen.findByTestId('top-categories')).toBeInTheDocument()
    expect(screen.getByText(/Categories: 1/)).toBeInTheDocument()
  })
})
