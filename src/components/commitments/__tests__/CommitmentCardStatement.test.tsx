import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CommitmentCardStatement } from '@/components/commitments/CommitmentCardStatement'

describe('CommitmentCardStatement', () => {
  const onPayStatement = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders card name and total statement', () => {
    render(
      <CommitmentCardStatement
        cardName="Bradesco"
        totalStatement={1500}
        onPayStatement={onPayStatement}
        isPaying={false}
      />
    )
    expect(screen.getByText('Fatura Bradesco')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument()
  })

  it('has region aria-label with card name', () => {
    render(
      <CommitmentCardStatement
        cardName="Itaú"
        totalStatement={0}
        onPayStatement={onPayStatement}
        isPaying={false}
      />
    )
    expect(screen.getByRole('region', { name: 'Fatura do cartão Itaú' })).toBeInTheDocument()
  })

  it('shows "Pagar fatura" button when not paid and not loading', () => {
    render(
      <CommitmentCardStatement
        cardName="Bradesco"
        totalStatement={100}
        onPayStatement={onPayStatement}
        isPaying={false}
        allPaid={false}
      />
    )
    const btn = screen.getByRole('button', { name: 'Pagar fatura' })
    expect(btn).toBeInTheDocument()
    expect(btn).not.toBeDisabled()
  })

  it('calls onPayStatement when button is clicked', () => {
    render(
      <CommitmentCardStatement
        cardName="Bradesco"
        totalStatement={100}
        onPayStatement={onPayStatement}
        isPaying={false}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Pagar fatura' }))
    expect(onPayStatement).toHaveBeenCalledTimes(1)
  })

  it('disables button and shows "Pagando…" when isPaying is true', () => {
    render(
      <CommitmentCardStatement
        cardName="Bradesco"
        totalStatement={100}
        onPayStatement={onPayStatement}
        isPaying
      />
    )
    const btn = screen.getByRole('button', { name: 'Pagando…' })
    expect(btn).toBeDisabled()
  })

  it('shows "Pago" and disables button when allPaid is true', () => {
    render(
      <CommitmentCardStatement
        cardName="Bradesco"
        totalStatement={100}
        onPayStatement={onPayStatement}
        isPaying={false}
        allPaid
      />
    )
    const btn = screen.getByRole('button', { name: 'Pago' })
    expect(btn).toBeDisabled()
  })

  it('formats zero as R$ 0,00', () => {
    render(
      <CommitmentCardStatement
        cardName="Bradesco"
        totalStatement={0}
        onPayStatement={onPayStatement}
        isPaying={false}
      />
    )
    expect(screen.getByText('R$ 0,00')).toBeInTheDocument()
  })
})
