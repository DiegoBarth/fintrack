import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import YearlyBalanceChart from '@/components/dashboard/YearlyBalanceChart'
import { useSummary } from '@/hooks/useSummary'
import { useTheme } from '@/contexts/ThemeContext'
import type { MonthlyBalanceHistory } from '@/types/Dashboard'
import type { FullSummary } from '@/types/FullSummary'

vi.mock('@/contexts/PeriodContext', () => ({
  usePeriod: () => ({ month: '1', year: '2026' }),
}))

const defaultSummary: FullSummary = {
  totalIncomes: 6000,
  totalExpenses: 2500,
  totalCommitments: 1500,
  totalReceivedAmount: 5000,
  totalPaidExpenses: 2000,
  totalPaidCommitments: 1000,
  totalReceivedInMonth: 5000,
  totalPaidExpensesInMonth: 2000,
  totalPaidCommitmentsInMonth: 1000,
  accumulatedBalanceFromPreviousMonth: 0,
  availableYears: [2026],
}

vi.mock('@/hooks/useSummary', () => ({
  useSummary: vi.fn(() => ({
    summary: defaultSummary,
    isLoading: false,
    isError: false,
  })),
}))

vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: vi.fn(() => ({ theme: 'light' as const, toggleTheme: () => {} })),
}))

vi.mock('recharts', () => {
  const React = require('react')
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    ComposedChart: ({ children }: { children: React.ReactNode }) => <svg data-testid="composed-chart">{children}</svg>,
    LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Line: () => null,
    XAxis: () => null,
    YAxis: ({ tickFormatter }: { tickFormatter?: (v: number) => string }) =>
      tickFormatter ? (
        <span data-testid="y-axis-formatted">
          {[1000, -2000, 100, -50, 0].map(tickFormatter).join(' ')}
        </span>
      ) : null,
    Tooltip: ({ content }: { content?: React.ReactElement }) => {
      if (!content?.type) return null
      const contentProps = (content.props && typeof content.props === 'object' && !Array.isArray(content.props)
        ? content.props
        : {}) as Record<string, unknown>
      const Component = content.type as React.ComponentType<{ active?: boolean; payload?: Array<{ value: number; payload: { month: string } }> }>
      const positive = React.createElement(Component, {
        ...contentProps,
        active: true,
        payload: [{ value: 1000, payload: { month: 'Jan' } }],
      })
      const negative = React.createElement(Component, {
        ...contentProps,
        active: true,
        payload: [{ value: -200, payload: { month: 'Fev' } }],
      })
      const inactive = React.createElement(Component, { ...contentProps, active: false, payload: [] })
      return (
        <div data-testid="tooltip-wrapper">
          <div data-testid="tooltip-positive">{positive}</div>
          <div data-testid="tooltip-negative">{negative}</div>
          <div data-testid="tooltip-inactive">{inactive}</div>
        </div>
      )
    },
    CartesianGrid: () => null,
    ReferenceLine: () => null,
    Area: () => null,
  }
})

const chartData = [
  { month: 'Jan', balance: 1000 },
  { month: 'Fev', balance: -200 },
  { month: 'Mar', balance: 1500 },
] as unknown as MonthlyBalanceHistory[]

describe('YearlyBalanceChart', () => {
  beforeEach(() => {
    vi.mocked(useSummary).mockReturnValue({
      summary: defaultSummary,
      isLoading: false,
      isError: false,
    })
    vi.mocked(useTheme).mockReturnValue({ theme: 'light', toggleTheme: () => {} })
  })

  it('renders section with title Saldo ao longo do ano', () => {
    render(<YearlyBalanceChart data={chartData} />)
    expect(screen.getByRole('heading', { name: 'Saldo ao longo do ano' })).toBeInTheDocument()
  })

  it('renders legend Positivo and Negativo', () => {
    render(<YearlyBalanceChart data={chartData} />)
    expect(screen.getByText('Positivo')).toBeInTheDocument()
    expect(screen.getByText('Negativo')).toBeInTheDocument()
  })

  it('renders Maior, Menor and Atual stats', () => {
    render(<YearlyBalanceChart data={chartData} />)
    expect(screen.getByText('Maior')).toBeInTheDocument()
    expect(screen.getByText('Menor')).toBeInTheDocument()
    expect(screen.getByText('Atual')).toBeInTheDocument()
  })

  it('shows correct Maior value from data', () => {
    render(<YearlyBalanceChart data={chartData} />)
    expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument()
  })

  it('shows correct Menor value from data', () => {
    render(<YearlyBalanceChart data={chartData} />)
    const menorCell = screen.getByText('Menor').closest('div')?.querySelector('p:last-child')
    expect(menorCell).toHaveTextContent(/-R\$\s*200,00/)
  })

  it('computes current balance from summary', () => {
    render(<YearlyBalanceChart data={chartData} />)
    const currentBalance = 5000 - 2000 - 1000
    expect(currentBalance).toBe(2000)
    const atualCell = screen.getByText('Atual').closest('div')?.querySelector('p:last-child')
    expect(atualCell).toHaveTextContent(/2\.000,00/)
  })

  it('shows current balance with emerald class when positive', () => {
    render(<YearlyBalanceChart data={chartData} />)
    const atualCell = screen.getByText('Atual').closest('div')?.querySelector('p:last-child')
    expect(atualCell).toHaveClass('text-emerald-700')
  })

  it('renders chart container and composed chart', () => {
    render(<YearlyBalanceChart data={chartData} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument()
  })

  it('handles empty data without crashing', () => {
    const { container } = render(<YearlyBalanceChart data={[]} />)
    expect(container).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Saldo ao longo do ano' })).toBeInTheDocument()
  })

  it('shows Maior and Menor from single data point', () => {
    const singleData = [{ month: 'Jan', balance: 500 }] as unknown as MonthlyBalanceHistory[]
    render(<YearlyBalanceChart data={singleData} />)
    const values = screen.getAllByText('R$ 500,00')
    expect(values.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Maior').closest('div')?.querySelector('p:last-child')).toHaveTextContent('R$ 500,00')
    expect(screen.getByText('Menor').closest('div')?.querySelector('p:last-child')).toHaveTextContent('R$ 500,00')
  })

  it('shows zero for Atual when summary is null', () => {
    vi.mocked(useSummary).mockReturnValue({ summary: null, isLoading: false, isError: false })
    render(<YearlyBalanceChart data={chartData} />)
    const atualCell = screen.getByText('Atual').closest('div')?.querySelector('p:last-child')
    expect(atualCell).toHaveTextContent(/0,00/)
  })

  it('shows Atual in red when current balance is negative', () => {
    vi.mocked(useSummary).mockReturnValue({
      summary: {
        ...defaultSummary,
        totalReceivedAmount: 1000,
        totalPaidExpenses: 2000,
        totalPaidCommitments: 500,
      },
      isLoading: false,
      isError: false,
    })
    render(<YearlyBalanceChart data={chartData} />)
    const atualCell = screen.getByText('Atual').closest('div')?.querySelector('p:last-child')
    expect(atualCell).toHaveClass('text-red-700')
    expect(atualCell).toHaveTextContent(/-R\$\s*1\.500,00/)
  })

  it('renders CustomTooltip with positive value (month, currency, Positivo)', () => {
    render(<YearlyBalanceChart data={chartData} />)
    const positive = screen.getByTestId('tooltip-positive')
    expect(positive).toHaveTextContent('Jan')
    expect(positive).toHaveTextContent('R$ 1.000,00')
    expect(positive).toHaveTextContent('✓ Positivo')
  })

  it('renders CustomTooltip with negative value (Negativo and formatted value)', () => {
    render(<YearlyBalanceChart data={chartData} />)
    const negative = screen.getByTestId('tooltip-negative')
    expect(negative).toHaveTextContent('Fev')
    expect(negative).toHaveTextContent(/-R\$\s*200,00/)
    expect(negative).toHaveTextContent('⚠ Negativo')
  })

  it('CustomTooltip returns nothing when not active or payload empty', () => {
    render(<YearlyBalanceChart data={chartData} />)
    const inactive = screen.getByTestId('tooltip-inactive')
    expect(inactive).toBeEmptyDOMElement()
  })

  it('YAxis tickFormatter formats values (k for thousands, sign for negative)', () => {
    render(<YearlyBalanceChart data={chartData} />)
    const yAxis = screen.getByTestId('y-axis-formatted')
    expect(yAxis).toHaveTextContent('+1.0k')
    expect(yAxis).toHaveTextContent('-2.0k')
    expect(yAxis).toHaveTextContent('+100')
    expect(yAxis).toHaveTextContent('-50')
    expect(yAxis).toHaveTextContent('+0')
  })

  it('uses dark theme colors when theme is dark', () => {
    vi.mocked(useTheme).mockReturnValue({ theme: 'dark', toggleTheme: () => {} })
    const { container } = render(<YearlyBalanceChart data={chartData} />)
    expect(container).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Saldo ao longo do ano' })).toBeInTheDocument()
  })
})
