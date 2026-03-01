import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Expense from '@/pages/Expense'
import { useExpense } from '@/hooks/useExpense'
import type { Expense as ExpenseType } from '@/types/Expense'

vi.mock('@/contexts/PeriodContext', () => ({
  usePeriod: () => ({ month: '1', year: '2026' }),
}))

vi.mock('@/hooks/useExpense', () => ({
  useExpense: vi.fn(),
}))

vi.mock('@/components/layout/Layout', () => ({
  Layout: ({ children, title, onBack, subtitle }: any) => (
    <div data-testid="layout">
      <h1>{title}</h1>
      <button onClick={onBack} data-testid="back-button">Voltar</button>
      {subtitle && <span data-testid="subtitle">{subtitle}</span>}
      {children}
    </div>
  ),
}))

vi.mock('@/components/expenses/ExpenseList', () => ({
  ExpenseList: ({ expenses, onSelect }: { expenses: ExpenseType[]; onSelect: (e: ExpenseType) => void }) => (
    <div data-testid="expense-list">
      {expenses.map((e) => (
        <button key={e.rowIndex} onClick={() => onSelect(e)} type="button">
          {e.description}
        </button>
      ))}
    </div>
  ),
}))

vi.mock('@/components/expenses/ExpenseSkeleton', () => ({
  ExpenseSkeleton: () => <div data-testid="expense-skeleton">Loading</div>,
}))

vi.mock('@/components/expenses/AddExpenseModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="add-expense-modal">
        <button onClick={onClose} type="button">Fechar</button>
      </div>
    ) : null,
}))

vi.mock('@/components/expenses/EditExpenseModal', () => ({
  __esModule: true,
  default: ({ isOpen, expense, onClose }: { isOpen: boolean; expense: ExpenseType | null; onClose: () => void }) =>
    isOpen && expense ? (
      <div data-testid="edit-expense-modal">
        <span>{expense.description}</span>
        <button onClick={onClose} type="button">Fechar</button>
      </div>
    ) : null,
}))

function createExpense(overrides: Partial<ExpenseType> = {}): ExpenseType {
  return {
    rowIndex: 1,
    description: 'Supermercado',
    category: 'Alimentação',
    amount: 250,
    paymentDate: '15/01/2026',
    ...overrides,
  }
}

const defaultUseExpenseReturn = {
  expenses: [createExpense({ description: 'Mercado', amount: 100 })],
  isLoading: false,
  isError: false,
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  isSaving: false,
  isDeleting: false,
}

describe('Expense', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useExpense).mockReturnValue({ ...defaultUseExpenseReturn })
  })

  it('renders Layout with title Gastos', () => {
    render(
      <MemoryRouter>
        <Expense />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: 'Gastos' })).toBeInTheDocument()
  })

  it('renders ExpenseSkeleton when isLoading', () => {
    vi.mocked(useExpense).mockReturnValue({
      ...defaultUseExpenseReturn,
      expenses: [],
      isLoading: true,
    })
    render(
      <MemoryRouter>
        <Expense />
      </MemoryRouter>
    )
    expect(screen.getByTestId('expense-skeleton')).toBeInTheDocument()
  })

  it('renders ExpenseList with expenses when not loading', () => {
    const expenses = [createExpense({ description: 'Item B' })]
    vi.mocked(useExpense).mockReturnValue({
      ...defaultUseExpenseReturn,
      expenses,
    })
    render(
      <MemoryRouter>
        <Expense />
      </MemoryRouter>
    )
    expect(screen.getByTestId('expense-list')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Item B' })).toBeInTheDocument()
  })

  it('shows subtitle with month and total', () => {
    render(
      <MemoryRouter>
        <Expense />
      </MemoryRouter>
    )
    expect(screen.getByTestId('subtitle')).toBeInTheDocument()
    expect(screen.getByTestId('subtitle').textContent).toMatch(/Total:/)
  })

  it('opens AddExpenseModal when Novo gasto button is clicked', async () => {
    render(
      <MemoryRouter>
        <Expense />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Novo gasto' }))
    expect(await screen.findByTestId('add-expense-modal', {}, { timeout: 2000 })).toBeInTheDocument()
  })

  it('opens EditExpenseModal when an expense is selected', async () => {
    const expenses = [createExpense({ rowIndex: 3, description: 'Aluguel' })]
    vi.mocked(useExpense).mockReturnValue({
      ...defaultUseExpenseReturn,
      expenses,
    })
    render(
      <MemoryRouter>
        <Expense />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Aluguel' }))
    const modal = await screen.findByTestId('edit-expense-modal', {}, { timeout: 2000 })
    expect(modal).toBeInTheDocument()
    expect(modal).toHaveTextContent('Aluguel')
  })
})
