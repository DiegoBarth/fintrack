import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AddCommitmentModal from '@/components/commitments/AddCommitmentModal'

const mockCreate = vi.fn()
const mockCreateCard = vi.fn()
const mockValidate = vi.fn()

vi.mock('@/contexts/PeriodContext', () => ({
  usePeriod: () => ({ month: '1', year: '2026' }),
}))

vi.mock('@/hooks/useCommitment', () => ({
  useCommitment: () => ({
    create: mockCreate,
    createCard: mockCreateCard,
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
      aria-label="Vencimento"
    />
  ),
}))

vi.mock('@/components/ui/MonthField', () => ({
  MonthField: ({ value, onChange }: any) => (
    <input
      data-testid="month-field"
      type="month"
      value={value || ''}
      onChange={e => onChange(e.target.value || undefined)}
      aria-label="Mês de referência"
    />
  ),
}))

describe('AddCommitmentModal', () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockValidate.mockImplementation((_schema: unknown, data: unknown) => data)
  })

  it('renders modal with title "Novo compromisso" when open', () => {
    render(<AddCommitmentModal isOpen onClose={onClose} />)
    expect(screen.getByText('Novo compromisso')).toBeInTheDocument()
  })

  it('renders description input and category/type selects', () => {
    render(<AddCommitmentModal isOpen onClose={onClose} />)
    expect(screen.getByPlaceholderText(/Aluguel, Parcela/)).toBeInTheDocument()
    expect(screen.getByLabelText('commitment-category')).toBeInTheDocument()
    expect(screen.getByLabelText('commitment-type')).toBeInTheDocument()
  })

  it('shows amount and due date when type is Fixo', async () => {
    render(<AddCommitmentModal isOpen onClose={onClose} />)
    fireEvent.change(screen.getByLabelText('commitment-type'), { target: { value: 'Fixo' } })
    await waitFor(() => {
      expect(screen.getByLabelText(/Repetir por/)).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/Valor \*/)).toBeInTheDocument()
    expect(screen.getByTestId('date-field')).toBeInTheDocument()
  })

  it('shows card select and parcelas when type is Cartão', async () => {
    render(<AddCommitmentModal isOpen onClose={onClose} />)
    fireEvent.change(screen.getByLabelText('commitment-type'), { target: { value: 'Cartão' } })
    await waitFor(() => {
      expect(screen.getByLabelText('commitment-card')).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/Total de parcelas/)).toBeInTheDocument()
  })

  it('calls create and onClose when submitting Fixo with valid data', async () => {
    render(<AddCommitmentModal isOpen onClose={onClose} />)
    fireEvent.change(screen.getByLabelText('commitment-type'), { target: { value: 'Fixo' } })
    await waitFor(() => {
      expect(screen.getByTestId('date-field')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('commitment-category'), { target: { value: 'Casa' } })
    fireEvent.change(screen.getByPlaceholderText(/Aluguel/), { target: { value: 'Aluguel' } })
    fireEvent.change(screen.getByLabelText(/Valor \*/), { target: { value: 'R$ 1.500,00' } })
    fireEvent.change(screen.getByTestId('date-field'), { target: { value: '2026-01-15' } })
    const monthField = screen.getByTestId('month-field')
    if (monthField && !monthField.getAttribute('value')) {
      fireEvent.change(monthField, { target: { value: '2026-01' } })
    }

    fireEvent.click(screen.getByRole('button', { name: /Salvar novo registro/ }))

    await waitFor(() => {
      expect(mockValidate).toHaveBeenCalled()
      expect(mockCreate).toHaveBeenCalled()
    })
    expect(mockCreateCard).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('calls createCard and onClose when submitting Cartão with valid data', async () => {
    render(<AddCommitmentModal isOpen onClose={onClose} />)

    fireEvent.change(screen.getByLabelText('commitment-type'), { target: { value: 'Cartão' } })
    fireEvent.change(screen.getByLabelText('commitment-category'), { target: { value: 'Casa' } })
    fireEvent.change(screen.getByPlaceholderText(/Aluguel/), { target: { value: 'Compras cartão' } })
    fireEvent.change(screen.getByLabelText('commitment-card'), { target: { value: 'Bradesco' } })
    const amountInput = document.getElementById('commitment-total-amount')
    if (amountInput) fireEvent.change(amountInput, { target: { value: 'R$ 3.000,00' } })
    const parcelasInput = document.getElementById('compromisso-total-parcelas')
    if (parcelasInput) fireEvent.change(parcelasInput, { target: { value: '12' } })
    fireEvent.change(screen.getByTestId('date-field'), { target: { value: '2026-01-10' } })

    fireEvent.click(screen.getByRole('button', { name: /Salvar|salvar/ }))

    await waitFor(() => {
      expect(mockValidate).toHaveBeenCalled()
      expect(mockCreateCard).toHaveBeenCalled()
    })
    expect(mockCreate).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('does not call create when validation returns null', async () => {
    mockValidate.mockReturnValue(null)
    render(<AddCommitmentModal isOpen onClose={onClose} />)

    fireEvent.change(screen.getByLabelText('commitment-type'), { target: { value: 'Fixo' } })
    fireEvent.change(screen.getByLabelText('commitment-category'), { target: { value: 'Casa' } })
    fireEvent.change(screen.getByPlaceholderText(/Aluguel/), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /Salvar|salvar/ }))

    await waitFor(() => {
      expect(mockValidate).toHaveBeenCalled()
    })
    expect(mockCreate).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('resets form when modal is closed and reopened', async () => {
    const { rerender } = render(<AddCommitmentModal isOpen onClose={onClose} />)
    fireEvent.change(screen.getByPlaceholderText(/Aluguel/), { target: { value: 'Teste' } })
    expect(screen.getByPlaceholderText(/Aluguel/)).toHaveValue('Teste')

    rerender(<AddCommitmentModal isOpen={false} onClose={onClose} />)
    rerender(<AddCommitmentModal isOpen onClose={onClose} />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Aluguel/)).toHaveValue('')
    })
  })
})
