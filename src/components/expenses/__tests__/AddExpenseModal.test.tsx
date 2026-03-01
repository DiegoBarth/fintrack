import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AddExpenseModal from '@/components/expenses/AddExpenseModal'

const mockCreate = vi.fn()
const mockValidate = vi.fn()

vi.mock('@/contexts/PeriodContext', () => ({
  usePeriod: () => ({ month: '1', year: '2026' }),
}))

vi.mock('@/hooks/useExpense', () => ({
  useExpense: () => ({
    create: mockCreate,
    isSaving: false,
  }),
}))

vi.mock('@/hooks/useValidation', () => ({
  useValidation: () => ({ validate: mockValidate }),
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

vi.mock('@/components/ui/CustomSelect', () => ({
  CustomSelect: ({ value, onChange, options, id }: any) => (
    <select
      data-testid={id || 'custom-select'}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      aria-label={id}
    >
      <option value="">Selecione</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  ),
}))

vi.mock('@/components/ui/DateField', () => ({
  DateField: ({ value, onChange }: any) => (
    <input
      data-testid="date-field"
      type="date"
      value={value ? value.toISOString().slice(0, 10) : ''}
      onChange={e => onChange(e.target.value ? new Date(e.target.value) : undefined)}
      aria-label="Data de pagamento"
    />
  ),
}))

describe('AddExpenseModal', () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockValidate.mockImplementation((_schema: unknown, data: unknown) => data)
  })

  it('renders modal with title Novo Gasto when open', () => {
    render(<AddExpenseModal isOpen onClose={onClose} />)
    expect(screen.getByText('Novo Gasto')).toBeInTheDocument()
  })

  it('renders description amount category and date fields', () => {
    render(<AddExpenseModal isOpen onClose={onClose} />)
    expect(screen.getByPlaceholderText(/Aluguel, Supermercado/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Valor do gasto/)).toBeInTheDocument()
    expect(screen.getByLabelText('expense-category')).toBeInTheDocument()
    expect(screen.getByTestId('date-field')).toBeInTheDocument()
  })

  it('calls create and onClose when submitting with valid data', async () => {
    render(<AddExpenseModal isOpen onClose={onClose} />)
    fireEvent.change(screen.getByPlaceholderText(/Aluguel, Supermercado/), {
      target: { value: 'Mercado' },
    })
    fireEvent.change(screen.getByLabelText(/Valor do gasto/), {
      target: { value: 'R$ 100,00' },
    })
    fireEvent.change(screen.getByLabelText('expense-category'), {
      target: { value: 'Alimentação' },
    })
    fireEvent.change(screen.getByTestId('date-field'), {
      target: { value: '2026-01-20' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar novo registro/ }))

    await waitFor(() => {
      expect(mockValidate).toHaveBeenCalled()
      expect(mockCreate).toHaveBeenCalled()
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('does not call create when validation returns null', async () => {
    mockValidate.mockReturnValue(null)
    render(<AddExpenseModal isOpen onClose={onClose} />)
    fireEvent.change(screen.getByPlaceholderText(/Aluguel, Supermercado/), {
      target: { value: '' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar novo registro/ }))

    await waitFor(() => {
      expect(mockValidate).toHaveBeenCalled()
    })
    expect(mockCreate).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('resets form when modal is closed and reopened', async () => {
    const { rerender } = render(<AddExpenseModal isOpen onClose={onClose} />)
    fireEvent.change(screen.getByPlaceholderText(/Aluguel, Supermercado/), {
      target: { value: 'Teste' },
    })
    expect(screen.getByPlaceholderText(/Aluguel, Supermercado/)).toHaveValue('Teste')

    rerender(<AddExpenseModal isOpen={false} onClose={onClose} />)
    rerender(<AddExpenseModal isOpen onClose={onClose} />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Aluguel, Supermercado/)).toHaveValue('')
    })
  })
})
