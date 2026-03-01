import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PayCardAlertModal } from '@/components/home/PayCardAlertModal'

describe('PayCardAlertModal', () => {
  const onClose = vi.fn()
  const onPay = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when isOpen is false', () => {
    const { container } = render(
      <PayCardAlertModal
        isOpen={false}
        cardName="Nubank"
        totalAmount={1500}
        isPaying={false}
        onClose={onClose}
        onPay={onPay}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders card name and total amount', () => {
    render(
      <PayCardAlertModal
        isOpen
        cardName="Bradesco"
        totalAmount={2500}
        isPaying={false}
        onClose={onClose}
        onPay={onPay}
      />
    )
    expect(screen.getByText('Fatura do cartão')).toBeInTheDocument()
    expect(screen.getByText('Bradesco')).toBeInTheDocument()
    expect(screen.getByText('R$ 2.500,00')).toBeInTheDocument()
  })

  it('shows confirmation message', () => {
    render(
      <PayCardAlertModal
        isOpen
        cardName="Itaú"
        totalAmount={1000}
        isPaying={false}
        onClose={onClose}
        onPay={onPay}
      />
    )
    expect(
      screen.getByText(/Ao confirmar, todos os compromissos deste cartão serão marcados como pagos/)
    ).toBeInTheDocument()
  })

  it('shows Pagar fatura button when not paying', () => {
    render(
      <PayCardAlertModal
        isOpen
        cardName="Nubank"
        totalAmount={500}
        isPaying={false}
        onClose={onClose}
        onPay={onPay}
      />
    )
    const payBtn = screen.getByRole('button', { name: 'Pagar fatura' })
    expect(payBtn).toBeInTheDocument()
    expect(payBtn).not.toBeDisabled()
  })

  it('shows Pagando… and disables button when isPaying', () => {
    render(
      <PayCardAlertModal
        isOpen
        cardName="Nubank"
        totalAmount={500}
        isPaying
        onClose={onClose}
        onPay={onPay}
      />
    )
    expect(screen.getByRole('button', { name: 'Pagando…' })).toBeDisabled()
  })

  it('calls onPay when Pagar fatura is clicked', () => {
    render(
      <PayCardAlertModal
        isOpen
        cardName="Nubank"
        totalAmount={500}
        isPaying={false}
        onClose={onClose}
        onPay={onPay}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Pagar fatura' }))
    expect(onPay).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Cancelar is clicked', () => {
    render(
      <PayCardAlertModal
        isOpen
        cardName="Nubank"
        totalAmount={500}
        isPaying={false}
        onClose={onClose}
        onPay={onPay}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
