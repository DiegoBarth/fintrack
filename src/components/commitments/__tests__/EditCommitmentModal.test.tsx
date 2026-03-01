import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import EditCommitmentModal from '@/components/commitments/EditCommitmentModal'
import type { Commitment } from '@/types/Commitment'

const mockUpdate = vi.fn()
const mockRemove = vi.fn()

vi.mock('@/contexts/PeriodContext', () => ({
  usePeriod: () => ({ month: '1', year: '2026' }),
}))

vi.mock('@/hooks/useCommitment', () => ({
  useCommitment: () => ({
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

function createCommitment(overrides: Partial<Commitment> = {}): Commitment {
  return {
    rowIndex: 1,
    description: 'Aluguel',
    category: 'Casa',
    type: 'Fixo',
    amount: 1500,
    dueDate: '10/01/2026',
    referenceMonth: '2026-01',
    ...overrides,
  }
}

describe('EditCommitmentModal', () => {
  const onClose = vi.fn()
  const onConfirm = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when commitment is null', () => {
    const { container } = render(
      <EditCommitmentModal isOpen commitment={null} onClose={onClose} onConfirm={onConfirm} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders BaseModal with commitment description as title', () => {
    const commitment = createCommitment({ description: 'Netflix' })
    render(
      <EditCommitmentModal isOpen commitment={commitment} onClose={onClose} onConfirm={onConfirm} />
    )
    expect(screen.getByRole('heading', { name: 'Netflix' })).toBeInTheDocument()
  })

  it('shows type and due date in info box', () => {
    const commitment = createCommitment({ type: 'Variável', dueDate: '20/02/2026' })
    render(
      <EditCommitmentModal isOpen commitment={commitment} onClose={onClose} onConfirm={onConfirm} />
    )
    expect(screen.getByText('Variável')).toBeInTheDocument()
    expect(screen.getByText('20/02/2026')).toBeInTheDocument()
  })

  it('shows card and installment when commitment is card type', () => {
    const commitment = createCommitment({
      type: 'Cartão',
      card: 'Bradesco',
      installment: 2,
      totalInstallments: 12,
    })
    render(
      <EditCommitmentModal isOpen commitment={commitment} onClose={onClose} onConfirm={onConfirm} />
    )
    expect(screen.getByText('Bradesco')).toBeInTheDocument()
    expect(screen.getByText(/Parc\. 2\/12/)).toBeInTheDocument()
  })

  it('opens ScopeChoiceModal when saving Fixo commitment', async () => {
    const commitment = createCommitment({ type: 'Fixo' })
    render(
      <EditCommitmentModal isOpen commitment={commitment} onClose={onClose} onConfirm={onConfirm} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(screen.getByTestId('scope-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Somente este' }))
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ rowIndex: 1, scope: 'single' })
      )
    })
    expect(onConfirm).toHaveBeenCalledWith(1)
    expect(onClose).toHaveBeenCalled()
  })

  it('calls update directly when saving Variável (no scope modal)', async () => {
    const commitment = createCommitment({ type: 'Variável' })
    render(
      <EditCommitmentModal isOpen commitment={commitment} onClose={onClose} onConfirm={onConfirm} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ rowIndex: 1, scope: 'single' })
      )
    })
  })

  it('opens ConfirmModal when deleting Variável', () => {
    const commitment = createCommitment({ type: 'Variável' })
    render(
      <EditCommitmentModal isOpen commitment={commitment} onClose={onClose} onConfirm={onConfirm} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument()
  })

  it('calls remove and onConfirm when confirming delete for Variável', async () => {
    const commitment = createCommitment({ type: 'Variável' })
    render(
      <EditCommitmentModal isOpen commitment={commitment} onClose={onClose} onConfirm={onConfirm} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar excluir' }))
    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith({ rowIndex: 1, scope: 'single' })
    })
    expect(onConfirm).toHaveBeenCalledWith(1)
    expect(onClose).toHaveBeenCalled()
  })

  it('opens ScopeChoiceModal when deleting Fixo', () => {
    const commitment = createCommitment({ type: 'Fixo' })
    render(
      <EditCommitmentModal isOpen commitment={commitment} onClose={onClose} onConfirm={onConfirm} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(screen.getByTestId('scope-modal')).toBeInTheDocument()
  })

  it('opens ScopeChoiceModal when updating card commitment not on last installment', () => {
    const commitment = createCommitment({
      type: 'Cartão',
      installment: 1,
      totalInstallments: 3,
    })
    render(
      <EditCommitmentModal isOpen commitment={commitment} onClose={onClose} onConfirm={onConfirm} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(screen.getByTestId('scope-modal')).toBeInTheDocument()
  })

  it('calls update directly when saving card on last installment', async () => {
    const commitment = createCommitment({
      type: 'Cartão',
      installment: 3,
      totalInstallments: 3,
    })
    render(
      <EditCommitmentModal isOpen commitment={commitment} onClose={onClose} onConfirm={onConfirm} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled()
    })
  })

  it('calls onClose when Fechar is clicked', () => {
    const commitment = createCommitment()
    render(
      <EditCommitmentModal isOpen commitment={commitment} onClose={onClose} onConfirm={onConfirm} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalled()
  })
})
