import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import EditIncomeModal from '@/components/incomes/EditIncomeModal'
import type { Income } from '@/types/Income'

const mockUpdate = vi.fn()
const mockRemove = vi.fn()

vi.mock('@/contexts/PeriodContext', () => ({
  usePeriod: () => ({ month: '1', year: '2026' }),
}))

vi.mock('@/hooks/useIncome', () => ({
  useIncome: () => ({
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

vi.mock('@/components/ScopeChoiceModal', () => ({
  ScopeChoiceModal: ({ isOpen, onConfirm, onClose }: any) =>
    isOpen ? (
      <div data-testid="scope-modal">
        <button onClick={() => onConfirm('single')}>Somente este</button>
        <button onClick={() => onConfirm('future')}>Este e os próximos</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    ) : null,
}))

vi.mock('@/components/ui/DateField', () => ({
  DateField: ({ value, onChange }: any) => (
    <div data-testid="date-field">
      <button onClick={() => onChange(new Date(2026, 0, 15))}>Escolher data</button>
    </div>
  ),
}))

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

describe('EditIncomeModal', () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when income is null', () => {
    const { container } = render(
      <EditIncomeModal isOpen income={null} onClose={onClose} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders BaseModal with income description as title', () => {
    const income = createIncome({ description: 'Freela' })
    render(<EditIncomeModal isOpen income={income} onClose={onClose} />)
    expect(screen.getByRole('heading', { name: 'Freela' })).toBeInTheDocument()
  })

  it('shows amount input with income amount', () => {
    const income = createIncome({ amount: 2500 })
    render(<EditIncomeModal isOpen income={income} onClose={onClose} />)
    const amountInput = screen.getByLabelText(/Valor da receita em reais/)
    expect(amountInput).toHaveAttribute('value')
    expect((amountInput as HTMLInputElement).value).toMatch(/2\.500,00/)
  })

  it('shows Data de recebimento label', () => {
    const income = createIncome()
    render(<EditIncomeModal isOpen income={income} onClose={onClose} />)
    expect(screen.getByText('Data de recebimento')).toBeInTheDocument()
  })

  it('opens ScopeChoiceModal when Salvar is clicked', () => {
    const income = createIncome({ rowIndex: 5 })
    render(<EditIncomeModal isOpen income={income} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(screen.getByTestId('scope-modal')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Somente este' })).toBeInTheDocument()
  })

  it('calls update and onClose when scope Somente este is selected', async () => {
    const income = createIncome({ rowIndex: 5 })
    render(<EditIncomeModal isOpen income={income} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/Valor da receita em reais/), {
      target: { value: 'R$ 4.000,00' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Somente este' }))

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ rowIndex: 5, amount: 4000, scope: 'single' })
      )
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('opens ScopeChoiceModal for delete when Excluir is clicked', () => {
    const income = createIncome()
    render(<EditIncomeModal isOpen income={income} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(screen.getByTestId('scope-modal')).toBeInTheDocument()
  })

  it('calls remove and onClose when confirming delete with scope', async () => {
    const income = createIncome({ rowIndex: 3 })
    render(<EditIncomeModal isOpen income={income} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    fireEvent.click(screen.getByRole('button', { name: 'Este e os próximos' }))

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith({ rowIndex: 3, scope: 'future' })
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when Fechar is clicked', () => {
    const income = createIncome()
    render(<EditIncomeModal isOpen income={income} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalled()
  })
})
