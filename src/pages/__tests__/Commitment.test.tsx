import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Commitment from '@/pages/Commitment'
import { useCommitment } from '@/hooks/useCommitment'
import type { Commitment as CommitmentType } from '@/types/Commitment'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockUsePeriod = vi.fn(() => ({ month: '1', year: '2026' }))
vi.mock('@/contexts/PeriodContext', () => ({
  usePeriod: () => mockUsePeriod(),
}))

vi.mock('@/hooks/useCommitment', () => ({
  useCommitment: vi.fn(),
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

vi.mock('@/components/commitments/CommitmentListGrouped', () => ({
  CommitmentListGrouped: ({
    commitments,
    onSelect,
    showStatementInGroupHeaders,
  }: {
    commitments: CommitmentType[]
    onSelect: (c: CommitmentType) => void
    showStatementInGroupHeaders?: boolean
  }) => (
    <div data-testid="commitment-list" data-show-statement={String(showStatementInGroupHeaders)}>
      {commitments.map((c) => (
        <button key={c.rowIndex} onClick={() => onSelect(c)} type="button">
          {c.description}
        </button>
      ))}
    </div>
  ),
}))

vi.mock('@/components/commitments/CommitmentTypeFilter', () => ({
  CommitmentTypeFilter: ({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) => (
    <div data-testid="type-filter" data-value={value ?? 'null'}>
      <button onClick={() => onChange(null)} type="button">Todos</button>
      <button onClick={() => onChange('Fixo')} type="button">Fixo</button>
      <button onClick={() => onChange('Cartão')} type="button">Cartão</button>
    </div>
  ),
}))

vi.mock('@/components/commitments/CommitmentCardFilter', () => ({
  CommitmentCardFilter: ({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) => (
    <div data-testid="card-filter">
      <button onClick={() => onChange(null)} type="button">Todos cartões</button>
      <button onClick={() => onChange('Nubank')} type="button">Nubank</button>
      <button onClick={() => onChange('Itau')} type="button">Itau</button>
    </div>
  ),
}))

vi.mock('@/components/commitments/CommitmentCardStatement', () => ({
  CommitmentCardStatement: ({
    cardName,
    totalStatement,
    onPayStatement,
    allPaid,
  }: {
    cardName: string
    totalStatement: number
    onPayStatement: () => void
    allPaid?: boolean
  }) => (
    <div data-testid="card-statement" data-card={cardName} data-all-paid={String(allPaid)}>
      <span>Fatura {cardName}</span>
      <span>Total: {totalStatement}</span>
      {!allPaid && (
        <button onClick={onPayStatement} type="button">Pagar fatura</button>
      )}
    </div>
  ),
}))

vi.mock('@/components/commitments/CommitmentSkeleton', () => ({
  CommitmentSkeleton: () => <div data-testid="commitment-skeleton">Loading</div>,
}))

vi.mock('@/components/commitments/AddCommitmentModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="add-commitment-modal">
        <button onClick={onClose} type="button">Fechar</button>
      </div>
    ) : null,
}))

vi.mock('@/components/commitments/EditCommitmentModal', () => ({
  __esModule: true,
  default: ({ isOpen, commitment, onClose }: { isOpen: boolean; commitment: CommitmentType | null; onClose: () => void }) =>
    isOpen && commitment ? (
      <div data-testid="edit-commitment-modal">
        <span>{commitment.description}</span>
        <button onClick={onClose} type="button">Fechar</button>
      </div>
    ) : null,
}))

function createCommitment(overrides: Partial<CommitmentType> = {}): CommitmentType {
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

describe('Commitment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCommitment).mockReturnValue({
      commitments: [createCommitment({ description: 'Netflix' })],
      isLoading: false,
      payCardStatement: vi.fn(),
    } as any)
  })

  it('renders Layout with title Compromissos', () => {
    render(
      <MemoryRouter>
        <Commitment />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: 'Compromissos' })).toBeInTheDocument()
  })

  it('renders CommitmentSkeleton when isLoading', () => {
    vi.mocked(useCommitment).mockReturnValue({
      commitments: [],
      isLoading: true,
      payCardStatement: vi.fn(),
    } as any)
    render(
      <MemoryRouter>
        <Commitment />
      </MemoryRouter>
    )
    expect(screen.getByTestId('commitment-skeleton')).toBeInTheDocument()
  })

  it('renders CommitmentListGrouped and CommitmentTypeFilter when not loading', () => {
    render(
      <MemoryRouter>
        <Commitment />
      </MemoryRouter>
    )
    expect(screen.getByTestId('type-filter')).toBeInTheDocument()
    expect(screen.getByTestId('commitment-list')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Netflix' })).toBeInTheDocument()
  })

  it('shows CommitmentCardFilter when type Cartão is selected', () => {
    render(
      <MemoryRouter>
        <Commitment />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cartão' }))
    expect(screen.getByTestId('card-filter')).toBeInTheDocument()
  })

  it('opens AddCommitmentModal when Novo compromisso is clicked', async () => {
    render(
      <MemoryRouter>
        <Commitment />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Novo compromisso' }))
    expect(await screen.findByTestId('add-commitment-modal', {}, { timeout: 2000 })).toBeInTheDocument()
  })

  it('opens EditCommitmentModal when a commitment is selected', async () => {
    const commitments = [createCommitment({ rowIndex: 7, description: 'Internet' })]
    vi.mocked(useCommitment).mockReturnValue({
      commitments,
      isLoading: false,
      payCardStatement: vi.fn(),
    } as any)
    render(
      <MemoryRouter>
        <Commitment />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Internet' }))
    const modal = await screen.findByTestId('edit-commitment-modal', {}, { timeout: 2000 })
    expect(modal).toBeInTheDocument()
    expect(modal).toHaveTextContent('Internet')
  })

  it('calls navigate(/) when Voltar is clicked', () => {
    render(
      <MemoryRouter>
        <Commitment />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByTestId('back-button'))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('shows subtitle with year when month is all', () => {
    mockUsePeriod.mockReturnValue({ month: 'all', year: '2026' })
    render(
      <MemoryRouter>
        <Commitment />
      </MemoryRouter>
    )
    const subtitle = screen.getByTestId('subtitle')
    expect(subtitle).toHaveTextContent('2026')
    expect(subtitle).toHaveTextContent('Total:')
    mockUsePeriod.mockReturnValue({ month: '1', year: '2026' })
  })

  it('filters list by type Fixo and clears card filter when switching from Cartão', () => {
    const commitments = [
      createCommitment({ rowIndex: 1, description: 'Aluguel', type: 'Fixo' }),
      createCommitment({ rowIndex: 2, description: 'Fatura Nubank', type: 'Cartão', card: 'Nubank' }),
    ]
    vi.mocked(useCommitment).mockReturnValue({
      commitments,
      isLoading: false,
      payCardStatement: vi.fn(),
    } as any)
    render(
      <MemoryRouter>
        <Commitment />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cartão' }))
    expect(screen.getByTestId('card-filter')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Nubank' }))
    expect(screen.getByTestId('card-statement')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Fixo' }))
    expect(screen.getByTestId('commitment-list')).toHaveTextContent('Aluguel')
    expect(screen.getByTestId('commitment-list')).not.toHaveTextContent('Fatura Nubank')
    expect(screen.queryByTestId('card-statement')).not.toBeInTheDocument()
  })

  it('shows CommitmentCardStatement when Cartão and card are selected', () => {
    const commitments = [
      createCommitment({ rowIndex: 1, type: 'Cartão', card: 'Nubank', amount: 500 }),
      createCommitment({ rowIndex: 2, type: 'Cartão', card: 'Nubank', amount: 300 }),
    ]
    vi.mocked(useCommitment).mockReturnValue({
      commitments,
      isLoading: false,
      payCardStatement: vi.fn(),
    } as any)
    render(
      <MemoryRouter>
        <Commitment />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cartão' }))
    fireEvent.click(screen.getByRole('button', { name: 'Nubank' }))
    const statement = screen.getByTestId('card-statement')
    expect(statement).toBeInTheDocument()
    expect(statement).toHaveTextContent('Fatura Nubank')
    expect(statement).toHaveTextContent('Total: 800')
  })

  it('calls payCardStatement when Pagar fatura is clicked', async () => {
    const payCardStatement = vi.fn().mockResolvedValue(undefined)
    const commitments = [
      createCommitment({ rowIndex: 10, type: 'Cartão', card: 'Nubank', amount: 100 }),
      createCommitment({ rowIndex: 11, type: 'Cartão', card: 'Nubank', amount: 200 }),
    ]
    vi.mocked(useCommitment).mockReturnValue({
      commitments,
      isLoading: false,
      payCardStatement,
    } as any)
    render(
      <MemoryRouter>
        <Commitment />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cartão' }))
    fireEvent.click(screen.getByRole('button', { name: 'Nubank' }))
    fireEvent.click(screen.getByRole('button', { name: 'Pagar fatura' }))
    await expect(payCardStatement).toHaveBeenCalledWith({
      rowIndexes: [10, 11],
      paymentDate: expect.any(String),
    })
  })

  it('does not throw when payCardStatement rejects', async () => {
    const payCardStatement = vi.fn().mockRejectedValue(new Error('API error'))
    const commitments = [
      createCommitment({ rowIndex: 5, type: 'Cartão', card: 'Itau', amount: 50 }),
    ]
    vi.mocked(useCommitment).mockReturnValue({
      commitments,
      isLoading: false,
      payCardStatement,
    } as any)
    render(
      <MemoryRouter>
        <Commitment />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cartão' }))
    fireEvent.click(screen.getByRole('button', { name: 'Itau' }))
    fireEvent.click(screen.getByRole('button', { name: 'Pagar fatura' }))
    await expect(payCardStatement).toHaveBeenCalled()
  })

  it('passes showStatementInGroupHeaders false when card is selected', () => {
    const commitments = [
      createCommitment({ rowIndex: 1, type: 'Cartão', card: 'Nubank', description: 'Parcela' }),
    ]
    vi.mocked(useCommitment).mockReturnValue({
      commitments,
      isLoading: false,
      payCardStatement: vi.fn(),
    } as any)
    render(
      <MemoryRouter>
        <Commitment />
      </MemoryRouter>
    )
    expect(screen.getByTestId('commitment-list')).toHaveAttribute('data-show-statement', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Cartão' }))
    fireEvent.click(screen.getByRole('button', { name: 'Nubank' }))
    expect(screen.getByTestId('commitment-list')).toHaveAttribute('data-show-statement', 'false')
  })

  it('shows allPaid when all filtered commitments are paid', () => {
    const commitments = [
      createCommitment({
        rowIndex: 1,
        type: 'Cartão',
        card: 'Nubank',
        amount: 100,
        paymentDate: '05/01/2026',
      }),
    ]
    vi.mocked(useCommitment).mockReturnValue({
      commitments,
      isLoading: false,
      payCardStatement: vi.fn(),
    } as any)
    render(
      <MemoryRouter>
        <Commitment />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cartão' }))
    fireEvent.click(screen.getByRole('button', { name: 'Nubank' }))
    const statement = screen.getByTestId('card-statement')
    expect(statement).toHaveAttribute('data-all-paid', 'true')
    expect(screen.queryByRole('button', { name: 'Pagar fatura' })).not.toBeInTheDocument()
  })

  it('closes AddCommitmentModal when Fechar is clicked', async () => {
    render(
      <MemoryRouter>
        <Commitment />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Novo compromisso' }))
    await screen.findByTestId('add-commitment-modal', {}, { timeout: 2000 })
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByTestId('add-commitment-modal')).not.toBeInTheDocument()
  })

  it('closes EditCommitmentModal when Fechar is clicked', async () => {
    const commitments = [createCommitment({ rowIndex: 1, description: 'Conta' })]
    vi.mocked(useCommitment).mockReturnValue({
      commitments,
      isLoading: false,
      payCardStatement: vi.fn(),
    } as any)
    render(
      <MemoryRouter>
        <Commitment />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Conta' }))
    await screen.findByTestId('edit-commitment-modal', {}, { timeout: 2000 })
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByTestId('edit-commitment-modal')).not.toBeInTheDocument()
  })

  it('filters list by card when Cartão and card selected', () => {
    const commitments = [
      createCommitment({ rowIndex: 1, description: 'Nubank Parcela 1', type: 'Cartão', card: 'Nubank' }),
      createCommitment({ rowIndex: 2, description: 'Itau Parcela 1', type: 'Cartão', card: 'Itau' }),
    ]
    vi.mocked(useCommitment).mockReturnValue({
      commitments,
      isLoading: false,
      payCardStatement: vi.fn(),
    } as any)
    render(
      <MemoryRouter>
        <Commitment />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cartão' }))
    expect(screen.getByTestId('commitment-list')).toHaveTextContent('Nubank Parcela 1')
    expect(screen.getByTestId('commitment-list')).toHaveTextContent('Itau Parcela 1')
    fireEvent.click(screen.getByRole('button', { name: 'Nubank' }))
    expect(screen.getByTestId('commitment-list')).toHaveTextContent('Nubank Parcela 1')
    expect(screen.getByTestId('commitment-list')).not.toHaveTextContent('Itau Parcela 1')
  })
})
