import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MonthlySummary from '@/components/home/MonthlySummary'

vi.mock('@/contexts/PeriodContext', () => ({
  usePeriod: () => ({ month: '1', year: '2026' }),
}))

vi.mock('@/hooks/useSummary', () => ({
  useSummary: () => ({
    summary: {
      totalIncomes: 5000,
      totalExpenses: 2000,
      totalCommitments: 1000,
      totalReceivedAmount: 4000,
      totalPaidExpenses: 1500,
      totalPaidCommitments: 500,
      accumulatedBalanceFromPreviousMonth: 500,
      availableYears: [2026],
    },
    isLoading: false,
  }),
}))

vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light' }),
}))

describe('MonthlySummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders title Resumo do Mês', () => {
    render(<MonthlySummary />)
    expect(screen.getByRole('heading', { name: 'Resumo do Mês' })).toBeInTheDocument()
  })

  it('renders Entradas card with amount', () => {
    render(<MonthlySummary />)
    expect(screen.getByText('Entradas')).toBeInTheDocument()
    expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument()
  })

  it('renders Gastos and Compromissos cards', () => {
    render(<MonthlySummary />)
    expect(screen.getByText('Gastos')).toBeInTheDocument()
    expect(screen.getByText('Compromissos')).toBeInTheDocument()
    expect(screen.getAllByText('R$ 2.000,00').length).toBeGreaterThan(0)
    expect(screen.getByText('R$ 1.000,00')).toBeInTheDocument()
  })

  it('renders Saldo Atual and Saldo Final do Mês', () => {
    render(<MonthlySummary />)
    expect(screen.getByText('Saldo Atual')).toBeInTheDocument()
    expect(screen.getByText('Saldo Final do Mês')).toBeInTheDocument()
  })

  it('shows current balance from received minus paid', () => {
    render(<MonthlySummary />)
    const currentBalance = 4000 - 1500 - 500
    expect(currentBalance).toBe(2000)
    const cards = screen.getAllByText('R$ 2.000,00')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('shows subtitle with accumulated balance when non-zero', () => {
    render(<MonthlySummary />)
    expect(screen.getByText(/Inclui saldo do mês anterior/)).toBeInTheDocument()
    expect(screen.getByText(/R\$\s*500,00/)).toBeInTheDocument()
  })
})

function numberToCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
