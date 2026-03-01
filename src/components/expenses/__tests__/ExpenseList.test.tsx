import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import type { Expense } from '@/types/Expense'

function createExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    rowIndex: 1,
    description: 'Supermercado',
    category: 'Alimentação',
    amount: 250,
    paymentDate: '15/01/2026',
    ...overrides,
  }
}

describe('ExpenseList', () => {
  const onSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows empty state when expenses array is empty', () => {
    render(<ExpenseList expenses={[]} onSelect={onSelect} />)
    expect(screen.getByText('Nenhum gasto cadastrado')).toBeInTheDocument()
  })

  it('renders expense description and amount', () => {
    const expenses = [createExpense({ description: 'Aluguel', amount: 1500 })]
    render(<ExpenseList expenses={expenses} onSelect={onSelect} />)
    expect(screen.getAllByText('Aluguel').length).toBeGreaterThan(0)
    expect(screen.getAllByText('R$ 1.500,00').length).toBeGreaterThan(0)
  })

  it('calls onSelect with expense when item is clicked', () => {
    const expense = createExpense({ rowIndex: 42, description: 'Test Click' })
    render(<ExpenseList expenses={[expense]} onSelect={onSelect} />)
    fireEvent.click(screen.getAllByText('Test Click')[0])
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(expense)
  })

  it('shows Pago and payment date', () => {
    const expenses = [createExpense({ paymentDate: '10/02/2026', description: 'Item Pago' })]
    render(<ExpenseList expenses={expenses} onSelect={onSelect} />)
    expect(screen.getAllByText('Pago').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Pago em 10\/02\/2026/).length).toBeGreaterThan(0)
  })

  it('shows category', () => {
    const expenses = [createExpense({ category: 'Transporte', description: 'Uber' })]
    render(<ExpenseList expenses={[expenses[0]]} onSelect={onSelect} />)
    expect(screen.getAllByText('Transporte').length).toBeGreaterThan(0)
  })

  it('renders multiple expenses', () => {
    const expenses = [
      createExpense({ description: 'A', rowIndex: 1 }),
      createExpense({ description: 'B', rowIndex: 2 }),
    ]
    render(<ExpenseList expenses={expenses} onSelect={onSelect} />)
    expect(screen.getAllByText('A').length).toBeGreaterThan(0)
    expect(screen.getAllByText('B').length).toBeGreaterThan(0)
  })
})
