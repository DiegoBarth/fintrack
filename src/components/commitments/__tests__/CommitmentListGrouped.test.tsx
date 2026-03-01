import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CommitmentListGrouped } from '@/components/commitments/CommitmentListGrouped'
import type { Commitment } from '@/types/Commitment'

function createCommitment(overrides: Partial<Commitment> = {}): Commitment {
  return {
    rowIndex: 1,
    description: 'Item',
    category: 'Casa',
    type: 'Fixo',
    amount: 100,
    dueDate: '10/01/2026',
    referenceMonth: '2026-01',
    ...overrides,
  }
}

describe('CommitmentListGrouped', () => {
  const onSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty CommitmentList when commitments is empty', () => {
    render(<CommitmentListGrouped commitments={[]} onSelect={onSelect} />)
    expect(screen.getByText('Nenhum compromisso cadastrado')).toBeInTheDocument()
  })

  it('groups Fixo commitments under Fixo section', () => {
    const commitments = [
      createCommitment({ type: 'Fixo', description: 'Aluguel', rowIndex: 1 }),
    ]
    render(<CommitmentListGrouped commitments={commitments} onSelect={onSelect} />)
    expect(screen.getByRole('heading', { name: 'Fixo' })).toBeInTheDocument()
    expect(screen.getAllByText('Aluguel').length).toBeGreaterThan(0)
  })

  it('groups Cartão by card and shows card name in header', () => {
    const commitments = [
      createCommitment({
        type: 'Cartão',
        card: 'Bradesco',
        description: 'Fatura Bradesco',
        rowIndex: 1,
      }),
    ]
    render(<CommitmentListGrouped commitments={commitments} onSelect={onSelect} />)
    expect(screen.getByRole('heading', { name: 'Cartão • Bradesco' })).toBeInTheDocument()
    expect(screen.getAllByText('Fatura Bradesco').length).toBeGreaterThan(0)
  })

  it('treats unknown type as Variável and groups under Variável', () => {
    const commitments = [
      createCommitment({
        type: '' as Commitment['type'],
        description: 'Outro',
        rowIndex: 1,
      }),
    ]
    render(<CommitmentListGrouped commitments={commitments} onSelect={onSelect} />)
    expect(screen.getByRole('heading', { name: 'Variável' })).toBeInTheDocument()
    expect(screen.getAllByText('Outro').length).toBeGreaterThan(0)
  })

  it('shows total in group header when showStatementInGroupHeaders is true', () => {
    const commitments = [
      createCommitment({ type: 'Fixo', amount: 100, rowIndex: 1 }),
      createCommitment({ type: 'Fixo', amount: 200, rowIndex: 2 }),
    ]
    render(
      <CommitmentListGrouped
        commitments={commitments}
        onSelect={onSelect}
        showStatementInGroupHeaders
      />
    )
    expect(screen.getByRole('heading', { name: /Fixo/ })).toBeInTheDocument()
    expect(screen.getByText('R$ 300,00')).toBeInTheDocument()
  })

  it('renders multiple card installments in same card group', () => {
    const commitments = [
      createCommitment({
        type: 'Cartão',
        card: 'Bradesco',
        dueDate: '15/02/2026',
        installment: 1,
        totalInstallments: 3,
        description: 'Parcela 1',
        rowIndex: 1,
      }),
      createCommitment({
        type: 'Cartão',
        card: 'Bradesco',
        dueDate: '15/01/2026',
        installment: 2,
        totalInstallments: 3,
        description: 'Parcela 2',
        rowIndex: 2,
      }),
    ]
    render(<CommitmentListGrouped commitments={commitments} onSelect={onSelect} />)
    expect(screen.getByRole('heading', { name: 'Cartão • Bradesco' })).toBeInTheDocument()
    expect(screen.getAllByText('Parcela 1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Parcela 2').length).toBeGreaterThan(0)
  })

  it('calls onSelect with commitment when item is clicked', () => {
    const commitment = createCommitment({ description: 'Click me', rowIndex: 99 })
    render(<CommitmentListGrouped commitments={[commitment]} onSelect={onSelect} />)
    fireEvent.click(screen.getAllByText('Click me')[0])
    expect(onSelect).toHaveBeenCalledWith(commitment)
  })

  it('shows commitments with card "Outros" under section Cartão • Outros', () => {
    const commitments = [
      createCommitment({
        type: 'Cartão',
        card: 'Outros',
        description: 'Outro cartão',
        rowIndex: 1,
      }),
    ]
    render(<CommitmentListGrouped commitments={commitments} onSelect={onSelect} />)
    expect(screen.getByRole('heading', { name: 'Cartão • Outros' })).toBeInTheDocument()
    expect(screen.getAllByText('Outro cartão').length).toBeGreaterThan(0)
  })

  it('shows commitments with card not in CARDS under their own card name', () => {
    const commitments = [
      createCommitment({
        type: 'Cartão',
        card: 'Nubank',
        description: 'Fatura Nubank',
        rowIndex: 1,
      }),
    ]
    render(<CommitmentListGrouped commitments={commitments} onSelect={onSelect} />)
    expect(screen.getByRole('heading', { name: 'Cartão • Nubank' })).toBeInTheDocument()
    expect(screen.getAllByText('Fatura Nubank').length).toBeGreaterThan(0)
  })
})
