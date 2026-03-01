import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CommitmentList } from '@/components/commitments/CommitmentList'
import type { Commitment } from '@/types/Commitment'

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

describe('CommitmentList', () => {
  const onSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows empty state when commitments array is empty', () => {
    render(<CommitmentList commitments={[]} onSelect={onSelect} />)
    expect(screen.getByText('Nenhum compromisso cadastrado')).toBeInTheDocument()
  })

  it('renders commitment description and amount', () => {
    const commitments = [createCommitment({ description: 'Netflix', amount: 55 })]
    render(<CommitmentList commitments={commitments} onSelect={onSelect} />)
    expect(screen.getAllByText('Netflix').length).toBeGreaterThan(0)
    expect(screen.getAllByText('R$ 55,00').length).toBeGreaterThan(0)
  })

  it('calls onSelect with commitment when item is clicked', () => {
    const commitment = createCommitment({ rowIndex: 42, description: 'Test' })
    render(<CommitmentList commitments={[commitment]} onSelect={onSelect} />)
    fireEvent.click(screen.getAllByText('Test')[0])
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(commitment)
  })

  it('shows "Pago" and payment date when commitment is paid', () => {
    const commitments = [
      createCommitment({ paymentDate: '05/01/2026', description: 'Pago Item' }),
    ]
    render(<CommitmentList commitments={commitments} onSelect={onSelect} />)
    expect(screen.getAllByText('Pago').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Pago em 05\/01\/2026/).length).toBeGreaterThan(0)
  })

  it('shows "Vencido" for overdue unpaid commitment', () => {
    const pastDate = new Date()
    pastDate.setMonth(pastDate.getMonth() - 1)
    const dueDate = `${String(pastDate.getDate()).padStart(2, '0')}/${String(pastDate.getMonth() + 1).padStart(2, '0')}/${pastDate.getFullYear()}`
    const commitments = [
      createCommitment({ dueDate, paymentDate: undefined, description: 'Vencido Item' }),
    ]
    render(<CommitmentList commitments={commitments} onSelect={onSelect} />)
    expect(screen.getAllByText('Vencido').length).toBeGreaterThan(0)
  })

  it('shows card name and installment for card type', () => {
    const commitments = [
      createCommitment({
        type: 'Cartão',
        card: 'Bradesco',
        installment: 2,
        totalInstallments: 12,
        description: 'Parcela Celular',
      }),
    ]
    render(<CommitmentList commitments={[commitments[0]]} onSelect={onSelect} />)
    expect(screen.getByText(/Bradesco.*Parcela 2\/12/)).toBeInTheDocument()
  })

  it('shows type for non-card commitment', () => {
    render(
      <CommitmentList
        commitments={[createCommitment({ type: 'Variável', description: 'Var' })]}
        onSelect={onSelect}
      />
    )
    expect(screen.getAllByText('Variável').length).toBeGreaterThan(0)
  })
})
