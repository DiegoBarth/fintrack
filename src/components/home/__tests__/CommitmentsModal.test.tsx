import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CommitmentModal, { AlertsModal } from '@/components/home/CommitmentsModal'
import type { Commitment } from '@/types/Commitment'
import type { AlertItem } from '@/types/AlertItem'

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

describe('AlertsModal', () => {
  const onClose = vi.fn()
  const onSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when isOpen is false', () => {
    const { container } = render(
      <AlertsModal isOpen={false} onClose={onClose} title="Test" items={[]} onSelect={onSelect} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders title and item count', () => {
    const items: AlertItem[] = [
      { kind: 'commitment', commitment: createCommitment({ description: 'Item 1' }) },
    ]
    render(<AlertsModal isOpen title="Vencidos" items={items} onClose={onClose} onSelect={onSelect} />)
    expect(screen.getByRole('heading', { name: 'Vencidos' })).toBeInTheDocument()
    expect(screen.getByText('1 item pendente')).toBeInTheDocument()
  })

  it('renders commitment item with description and due date', () => {
    const items: AlertItem[] = [
      {
        kind: 'commitment',
        commitment: createCommitment({
          description: 'Netflix',
          dueDate: '15/02/2026',
          amount: 55,
        }),
      },
    ]
    render(<AlertsModal isOpen title="Vencem hoje" items={items} onClose={onClose} onSelect={onSelect} />)
    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText(/Vence em 15\/02\/2026/)).toBeInTheDocument()
    expect(screen.getByText('R$ 55,00')).toBeInTheDocument()
    expect(screen.getByText('Pendente')).toBeInTheDocument()
  })

  it('renders card group item with card name and total', () => {
    const items: AlertItem[] = [
      {
        kind: 'cardGroup',
        card: 'Bradesco',
        commitments: [
          createCommitment({ rowIndex: 1, amount: 500 }),
          createCommitment({ rowIndex: 2, amount: 300 }),
        ],
        totalAmount: 800,
      },
    ]
    render(<AlertsModal isOpen title="Cartões" items={items} onClose={onClose} onSelect={onSelect} />)
    expect(screen.getByText('Cartão Bradesco')).toBeInTheDocument()
    expect(screen.getByText(/2 compromissos/)).toBeInTheDocument()
    expect(screen.getByText('R$ 800,00')).toBeInTheDocument()
  })

  it('calls onSelect when commitment item is clicked', () => {
    const commitment = createCommitment({ rowIndex: 42, description: 'Click me' })
    const items: AlertItem[] = [{ kind: 'commitment', commitment }]
    render(<AlertsModal isOpen title="Test" items={items} onClose={onClose} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Click me'))
    expect(onSelect).toHaveBeenCalledWith({ kind: 'commitment', commitment })
  })

  it('shows empty state when items is empty', () => {
    render(<AlertsModal isOpen title="Vencidos" items={[]} onClose={onClose} onSelect={onSelect} />)
    expect(screen.getByText('Tudo em dia!')).toBeInTheDocument()
    expect(screen.getByText(/não tem compromissos pendentes/)).toBeInTheDocument()
  })

  it('calls onClose when Fechar button is clicked', () => {
    render(<AlertsModal isOpen title="Test" items={[]} onClose={onClose} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalled()
  })
})

describe('CommitmentModal', () => {
  const onClose = vi.fn()
  const onSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when isOpen is false', () => {
    const { container } = render(
      <CommitmentModal isOpen={false} onClose={onClose} title="Lista" items={[]} onSelect={onSelect} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders commitment list with description due date and amount', () => {
    const items: Commitment[] = [
      createCommitment({ description: 'Aluguel', dueDate: '05/01/2026', amount: 1200 }),
    ]
    render(
      <CommitmentModal isOpen title="Pendentes" items={items} onClose={onClose} onSelect={onSelect} />
    )
    expect(screen.getByRole('heading', { name: 'Pendentes' })).toBeInTheDocument()
    expect(screen.getByText('Aluguel')).toBeInTheDocument()
    expect(screen.getByText(/Vence em 05\/01\/2026/)).toBeInTheDocument()
    expect(screen.getByText('R$ 1.200,00')).toBeInTheDocument()
  })

  it('calls onSelect with commitment when item is clicked', () => {
    const commitment = createCommitment({ rowIndex: 10, description: 'Item' })
    render(
      <CommitmentModal isOpen title="Test" items={[commitment]} onClose={onClose} onSelect={onSelect} />
    )
    fireEvent.click(screen.getByText('Item'))
    expect(onSelect).toHaveBeenCalledWith(commitment)
  })

  it('shows plural itens pendentes when multiple items', () => {
    const items: Commitment[] = [
      createCommitment({ rowIndex: 1 }),
      createCommitment({ rowIndex: 2 }),
    ]
    render(
      <CommitmentModal isOpen title="Test" items={items} onClose={onClose} onSelect={onSelect} />
    )
    expect(screen.getByText('2 itens pendentes')).toBeInTheDocument()
  })
})
