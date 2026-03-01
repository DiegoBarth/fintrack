import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import EditExpenseModal from '@/components/expenses/EditExpenseModal'
import type { Expense } from '@/types/Expense'

const mockUpdate = vi.fn()
const mockRemove = vi.fn()

vi.mock('@/contexts/PeriodContext', () => ({
  usePeriod: () => ({ month: '1', year: '2026' }),
}))

vi.mock('@/hooks/useExpense', () => ({
  useExpense: () => ({
    update: mockUpdate,
    remove: mockRemove,
    isSaving: false,
    isDeleting: false,
  }),
}))

vi.mock('@/contexts/toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    clear: vi.fn(),
  }),
}))

vi.mock('@/components/ui/BaseModal', () => ({
  BaseModal: ({ children, title, onSave, onDelete, onClose }: any) => (
    <div data-testid="base-modal">
      <h2>{title}</h2>
      <button onClick={onClose}>Fechar</button>
      <button onClick={onSave}>Salvar</button>
      <button onClick={onDelete}>Excluir</button>
      {children}
    </div>
  ),
}))

vi.mock('@/components/ui/ConfirmModal', () => ({
  ConfirmModal: ({ isOpen, onConfirm, onClose }: any) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <button onClick={() => onConfirm()}>Confirmar excluir</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    ) : null,
}))

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

describe('EditExpenseModal', () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when expense is null', () => {
    const { container } = render(
      <EditExpenseModal isOpen expense={null} onClose={onClose} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders BaseModal with expense description as title', () => {
    const expense = createExpense({ description: 'Aluguel' })
    render(<EditExpenseModal isOpen expense={expense} onClose={onClose} />)
    expect(screen.getByRole('heading', { name: 'Aluguel' })).toBeInTheDocument()
  })

  it('shows category and original payment date', () => {
    const expense = createExpense({ category: 'Casa', paymentDate: '10/02/2026' })
    render(<EditExpenseModal isOpen expense={expense} onClose={onClose} />)
    expect(screen.getByText(/Categoria:/)).toBeInTheDocument()
    expect(screen.getByText('Casa')).toBeInTheDocument()
    expect(screen.getByText(/Data original:/)).toBeInTheDocument()
    expect(screen.getByText('10/02/2026')).toBeInTheDocument()
  })

  it('shows amount input with expense amount', () => {
    const expense = createExpense({ amount: 1500 })
    render(<EditExpenseModal isOpen expense={expense} onClose={onClose} />)
    const amountInput = screen.getByLabelText(/Valor do gasto/)
    expect(amountInput).toHaveAttribute('value')
    expect((amountInput as HTMLInputElement).value).toMatch(/1\.500,00/)
  })

  it('calls update and onClose when saving', async () => {
    const expense = createExpense({ rowIndex: 5 })
    render(<EditExpenseModal isOpen expense={expense} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/Valor do gasto/), {
      target: { value: 'R$ 300,00' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ rowIndex: 5, amount: 300 })
      )
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('opens ConfirmModal when Excluir is clicked', () => {
    const expense = createExpense()
    render(<EditExpenseModal isOpen expense={expense} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument()
  })

  it('calls remove and onClose when confirming delete', async () => {
    const expense = createExpense({ rowIndex: 3 })
    render(<EditExpenseModal isOpen expense={expense} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar excluir' }))

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith(3)
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when Fechar is clicked', () => {
    const expense = createExpense()
    render(<EditExpenseModal isOpen expense={expense} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalled()
  })
})
