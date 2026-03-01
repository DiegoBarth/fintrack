import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { IncomeList } from '@/components/incomes/IncomeList'
import type { Income } from '@/types/Income'

function createIncome(overrides: Partial<Income> = {}): Income {
  return {
    rowIndex: 1,
    description: 'Salário',
    expectedDate: '05/01/2026',
    referenceMonth: '2026-01',
    amount: 3500,
    ...overrides,
  }
}

describe('IncomeList', () => {
  const onSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows empty state when incomes array is empty', () => {
    render(<IncomeList incomes={[]} onSelect={onSelect} />)
    expect(screen.getByText('Nenhuma receita cadastrada')).toBeInTheDocument()
  })

  it('renders income description and amount', () => {
    const incomes = [createIncome({ description: 'Freela', amount: 1200 })]
    render(<IncomeList incomes={incomes} onSelect={onSelect} />)
    expect(screen.getAllByText('Freela').length).toBeGreaterThan(0)
    expect(screen.getAllByText('R$ 1.200,00').length).toBeGreaterThan(0)
  })

  it('calls onSelect with income when item is clicked', () => {
    const income = createIncome({ rowIndex: 42, description: 'Test Click' })
    render(<IncomeList incomes={[income]} onSelect={onSelect} />)
    fireEvent.click(screen.getAllByText('Test Click')[0])
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(income)
  })

  it('shows Recebido and received date when income has receivedDate', () => {
    const incomes = [
      createIncome({
        receivedDate: '10/01/2026',
        expectedDate: '05/01/2026',
        description: 'Item Recebido',
      }),
    ]
    render(<IncomeList incomes={incomes} onSelect={onSelect} />)
    expect(screen.getAllByText('Recebido').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Recebido em 10\/01\/2026/).length).toBeGreaterThan(0)
  })

  it('shows Em aberto and Previsto para when income has no receivedDate', () => {
    const incomes = [
      createIncome({
        expectedDate: '15/02/2026',
        description: 'Salário Fevereiro',
      }),
    ]
    render(<IncomeList incomes={incomes} onSelect={onSelect} />)
    expect(screen.getAllByText('Em aberto').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Previsto para 15\/02\/2026/).length).toBeGreaterThan(0)
  })

  it('renders multiple incomes', () => {
    const incomes = [
      createIncome({ description: 'A', rowIndex: 1 }),
      createIncome({ description: 'B', rowIndex: 2 }),
    ]
    render(<IncomeList incomes={incomes} onSelect={onSelect} />)
    expect(screen.getAllByText('A').length).toBeGreaterThan(0)
    expect(screen.getAllByText('B').length).toBeGreaterThan(0)
  })
})
