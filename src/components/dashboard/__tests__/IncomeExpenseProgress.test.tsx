import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import IncomeExpenseProgress from '@/components/dashboard/IncomeExpenseProgress'
import type { FullSummary } from '@/types/FullSummary'

function createSummary(overrides: Partial<FullSummary> = {}): FullSummary {
  return {
    totalIncomes: 5000,
    totalExpenses: 2000,
    totalCommitments: 1000,
    totalReceivedAmount: 0,
    totalPaidExpenses: 0,
    totalPaidCommitments: 0,
    totalReceivedInMonth: 4000,
    totalPaidExpensesInMonth: 1500,
    totalPaidCommitmentsInMonth: 500,
    availableYears: [2026],
    ...overrides,
  }
}

describe('IncomeExpenseProgress', () => {
  it('returns null when summary is null', () => {
    const { container } = render(<IncomeExpenseProgress summary={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders section title Progresso do período', () => {
    render(<IncomeExpenseProgress summary={createSummary()} />)
    expect(screen.getByRole('heading', { name: 'Progresso do período' })).toBeInTheDocument()
  })

  it('renders Receitas with received and total amounts', () => {
    render(
      <IncomeExpenseProgress
        summary={createSummary({ totalIncomes: 5000, totalReceivedInMonth: 2500 })}
      />
    )
    expect(screen.getByText('Receitas')).toBeInTheDocument()
    expect(screen.getByText(/R\$ 2\.500,00 \/ R\$ 5\.000,00/)).toBeInTheDocument()
  })

  it('renders Despesas with paid and planned amounts', () => {
    render(
      <IncomeExpenseProgress
        summary={createSummary({
          totalExpenses: 2000,
          totalCommitments: 1000,
          totalPaidExpensesInMonth: 800,
          totalPaidCommitmentsInMonth: 400,
        })}
      />
    )
    expect(screen.getByText('Despesas')).toBeInTheDocument()
    expect(screen.getByText(/R\$ 1\.200,00/)).toBeInTheDocument()
    expect(screen.getByText(/R\$ 3\.000,00/)).toBeInTheDocument()
  })

  it('shows income percentage text', () => {
    render(
      <IncomeExpenseProgress
        summary={createSummary({ totalIncomes: 1000, totalReceivedInMonth: 500 })}
      />
    )
    expect(screen.getByText('50.0%')).toBeInTheDocument()
    expect(screen.getByText(/50\.0% do esperado/)).toBeInTheDocument()
  })

  it('shows expense percentage text', () => {
    render(
      <IncomeExpenseProgress
        summary={createSummary({
          totalExpenses: 1000,
          totalCommitments: 0,
          totalPaidExpensesInMonth: 500,
          totalPaidCommitmentsInMonth: 0,
        })}
      />
    )
    expect(screen.getByText(/50\.0% do limite planejado/)).toBeInTheDocument()
  })
})
