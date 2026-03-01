import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AddIncomeModal from '@/components/incomes/AddIncomeModal'

const mockCreate = vi.fn()
const mockValidate = vi.fn()

vi.mock('@/contexts/PeriodContext', () => ({
  usePeriod: () => ({ month: '1', year: '2026' }),
}))

vi.mock('@/hooks/useIncome', () => ({
  useIncome: () => ({
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

vi.mock('@/components/ui/BaseModal', () => ({
  BaseModal: ({ children, title, onSave, onClose }: any) => (
    <div data-testid="base-modal">
      <h2>{title}</h2>
      <button onClick={onClose}>Fechar</button>
      <button onClick={onSave}>Salvar</button>
      {children}
    </div>
  ),
}))

vi.mock('@/components/ui/DateField', () => ({
  DateField: ({ value, onChange }: any) => (
    <input
      data-testid="date-field"
      type="date"
      value={value ? (value instanceof Date ? value.toISOString().slice(0, 10) : value) : ''}
      onChange={e => onChange(e.target.value ? new Date(e.target.value) : undefined)}
      aria-label="Data"
    />
  ),
}))

vi.mock('@/components/ui/MonthField', () => ({
  MonthField: ({ value, onChange }: any) => (
    <input
      data-testid="month-field"
      type="month"
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      aria-label="Mês de referência"
    />
  ),
}))

describe('AddIncomeModal', () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockValidate.mockImplementation((_schema: unknown, data: unknown) => data)
  })

  it('renders modal with title Nova receita when open', () => {
    render(<AddIncomeModal isOpen onClose={onClose} />)
    expect(screen.getByText('Nova receita')).toBeInTheDocument()
  })

  it('renders description amount months and date fields', () => {
    render(<AddIncomeModal isOpen onClose={onClose} />)
    expect(screen.getByPlaceholderText(/Salário, Venda de Produto/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Valor da receita em reais/)).toBeInTheDocument()
    expect(screen.getByTestId('month-field')).toBeInTheDocument()
    expect(screen.getByText(/Data Prevista \*/)).toBeInTheDocument()
    expect(screen.getAllByTestId('date-field').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/Repetir por \(meses\)/)).toBeInTheDocument()
  })

  it('calls create and onClose when submitting with valid data', async () => {
    render(<AddIncomeModal isOpen onClose={onClose} />)
    fireEvent.change(screen.getByPlaceholderText(/Salário, Venda de Produto/), {
      target: { value: 'Freela' },
    })
    fireEvent.change(screen.getByLabelText(/Valor da receita em reais/), {
      target: { value: 'R$ 1.500,00' },
    })
    fireEvent.change(screen.getByTestId('month-field'), {
      target: { value: '2026-01' },
    })
    const dateFields = screen.getAllByTestId('date-field')
    const expectedDateField = dateFields[0]
    fireEvent.change(expectedDateField, {
      target: { value: '2026-01-20' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar/ }))

    await waitFor(() => {
      expect(mockValidate).toHaveBeenCalled()
      expect(mockCreate).toHaveBeenCalled()
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('does not call create when validation returns null', async () => {
    mockValidate.mockReturnValue(null)
    render(<AddIncomeModal isOpen onClose={onClose} />)
    fireEvent.change(screen.getByPlaceholderText(/Salário, Venda de Produto/), {
      target: { value: '' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar/ }))

    await waitFor(() => {
      expect(mockValidate).toHaveBeenCalled()
    })
    expect(mockCreate).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('resets form when modal is closed and reopened', async () => {
    const { rerender } = render(<AddIncomeModal isOpen onClose={onClose} />)
    fireEvent.change(screen.getByPlaceholderText(/Salário, Venda de Produto/), {
      target: { value: 'Teste' },
    })
    expect(screen.getByPlaceholderText(/Salário, Venda de Produto/)).toHaveValue('Teste')

    rerender(<AddIncomeModal isOpen={false} onClose={onClose} />)
    rerender(<AddIncomeModal isOpen onClose={onClose} />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Salário, Venda de Produto/)).toHaveValue('')
    })
  })
})
