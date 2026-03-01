import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import Alerts from '@/components/home/Alerts'
import { useAlerts } from '@/hooks/useAlerts'
import type { Commitment } from '@/types/Commitment'
import type { AlertItem } from '@/types/AlertItem'

const mockPayCardStatement = vi.fn()
const mockToastSuccess = vi.fn()

vi.mock('@/hooks/useAlerts', () => ({
  useAlerts: vi.fn(() => ({
    overdue: [],
    today: [],
    week: [],
  })),
}))

vi.mock('@/hooks/useCommitment', () => ({
  useCommitment: () => ({
    payCardStatement: mockPayCardStatement,
  }),
}))

vi.mock('@/contexts/PeriodContext', () => ({
  usePeriod: () => ({ year: 2026 }),
}))

vi.mock('@/contexts/toast', () => ({
  useToast: () => ({
    success: mockToastSuccess,
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    clear: vi.fn(),
  }),
}))

vi.mock('@/components/home/CommitmentsModal', () => ({
  AlertsModal: (props: {
    title: string
    onClose: () => void
    items: AlertItem[]
    onSelect: (item: AlertItem) => void
  }) =>
    React.createElement('div', { 'data-testid': 'alerts-modal' }, [
      React.createElement('span', { key: 'title' }, props.title),
      React.createElement('button', { key: 'close', onClick: props.onClose }, 'Fechar modal'),
      ...(props.items || []).map((item: AlertItem, i: number) =>
        item.kind === 'commitment'
          ? React.createElement(
              'button',
              {
                key: i,
                onClick: () => props.onSelect(item),
                'data-testid': `select-commitment-${item.commitment.rowIndex}`,
              },
              `Commitment ${item.commitment.description}`
            )
          : React.createElement(
              'button',
              {
                key: i,
                onClick: () => props.onSelect(item),
                'data-testid': `select-card-${item.card}`,
              },
              `Cartão ${item.card}`
            )
      ),
    ]),
}))

vi.mock('@/components/commitments/EditCommitmentModal', () => ({
  default: (props: { commitment: { rowIndex: number }; onConfirm: (id: number) => void; onClose: () => void }) =>
    React.createElement('div', { 'data-testid': 'edit-commitment-modal' }, [
      React.createElement('button', {
        key: 'confirm',
        onClick: () => props.onConfirm(props.commitment.rowIndex),
        'data-testid': 'edit-commitment-confirm',
      }, 'Confirmar'),
      React.createElement('button', { key: 'close', onClick: props.onClose }, 'Fechar'),
    ]),
}))

vi.mock('@/components/home/PayCardAlertModal', () => ({
  PayCardAlertModal: (props: { onPay: () => void; onClose: () => void }) =>
    React.createElement('div', { 'data-testid': 'pay-card-modal' }, [
      React.createElement('button', { key: 'pay', onClick: props.onPay, 'data-testid': 'pay-card-pay' }, 'Pagar fatura'),
      React.createElement('button', { key: 'close', onClick: props.onClose }, 'Fechar'),
    ]),
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

describe('Alerts', () => {
  beforeEach(() => {
    vi.mocked(useAlerts).mockReturnValue({
      overdue: [],
      today: [],
      week: [],
    })
  })

  it('returns null when there are no alerts', () => {
    const { container } = render(<Alerts />)
    expect(container.firstChild).toBeNull()
  })

  it('renders alert card when overdue has items', () => {
    vi.mocked(useAlerts).mockReturnValue({
      overdue: [createCommitment({ rowIndex: 1, description: 'Conta vencida' })],
      today: [],
      week: [],
    })
    render(<Alerts />)
    expect(screen.getByText(/1 conta vencida/)).toBeInTheDocument()
    expect(screen.getByText('Ver detalhes')).toBeInTheDocument()
  })

  it('renders today and week cards when they have items', () => {
    vi.mocked(useAlerts).mockReturnValue({
      overdue: [],
      today: [createCommitment({ rowIndex: 2 })],
      week: [createCommitment({ rowIndex: 3 })],
    })
    render(<Alerts />)
    expect(screen.getByText(/1 conta vencendo hoje/)).toBeInTheDocument()
    expect(screen.getByText(/1 conta vencendo essa semana/)).toBeInTheDocument()
  })

  it('opens AlertsModal when overdue card is clicked', async () => {
    vi.mocked(useAlerts).mockReturnValue({
      overdue: [createCommitment({ rowIndex: 1 })],
      today: [],
      week: [],
    })
    render(<Alerts />)
    fireEvent.click(screen.getByText(/1 conta vencida/))
    const modal = await screen.findByTestId('alerts-modal', undefined, { timeout: 2000 })
    expect(modal).toBeInTheDocument()
    expect(screen.getByText('Vencidos')).toBeInTheDocument()
  })

  it('renders plural text for multiple overdue items', () => {
    vi.mocked(useAlerts).mockReturnValue({
      overdue: [
        createCommitment({ rowIndex: 1 }),
        createCommitment({ rowIndex: 2 }),
      ],
      today: [],
      week: [],
    })
    render(<Alerts />)
    expect(screen.getByText(/2 contas vencidas/)).toBeInTheDocument()
  })

  it('opens AlertsModal with title Vencem hoje when today card is clicked', async () => {
    vi.mocked(useAlerts).mockReturnValue({
      overdue: [],
      today: [createCommitment({ rowIndex: 2 })],
      week: [],
    })
    render(<Alerts />)
    fireEvent.click(screen.getByText(/1 conta vencendo hoje/))
    const modal = await screen.findByTestId('alerts-modal', undefined, { timeout: 2000 })
    expect(modal).toBeInTheDocument()
    expect(screen.getByText('Vencem hoje')).toBeInTheDocument()
  })

  it('opens AlertsModal with title Vencem essa semana when week card is clicked', async () => {
    vi.mocked(useAlerts).mockReturnValue({
      overdue: [],
      today: [],
      week: [createCommitment({ rowIndex: 3 })],
    })
    render(<Alerts />)
    fireEvent.click(screen.getByText(/1 conta vencendo essa semana/))
    const modal = await screen.findByTestId('alerts-modal', undefined, { timeout: 2000 })
    expect(modal).toBeInTheDocument()
    expect(screen.getByText('Vencem essa semana')).toBeInTheDocument()
  })

  it('closes AlertsModal when Fechar modal is clicked', async () => {
    vi.mocked(useAlerts).mockReturnValue({
      overdue: [createCommitment({ rowIndex: 1 })],
      today: [],
      week: [],
    })
    render(<Alerts />)
    fireEvent.click(screen.getByText(/1 conta vencida/))
    await screen.findByTestId('alerts-modal', undefined, { timeout: 2000 })
    fireEvent.click(screen.getByText('Fechar modal'))
    await waitFor(() => {
      expect(screen.queryByTestId('alerts-modal')).not.toBeInTheDocument()
    })
  })

  it('opens EditCommitmentModal when selecting a commitment from AlertsModal', async () => {
    vi.mocked(useAlerts).mockReturnValue({
      overdue: [createCommitment({ rowIndex: 10, description: 'Conta de luz' })],
      today: [],
      week: [],
    })
    render(<Alerts />)
    fireEvent.click(screen.getByText(/1 conta vencida/))
    await screen.findByTestId('alerts-modal', undefined, { timeout: 2000 })
    fireEvent.click(screen.getByTestId('select-commitment-10'))
    await waitFor(() => {
      expect(screen.getByTestId('edit-commitment-modal')).toBeInTheDocument()
    })
    expect(screen.getByTestId('edit-commitment-confirm')).toBeInTheDocument()
  })

  it('calls onConfirm and closes EditCommitmentModal when Confirmar is clicked', async () => {
    vi.mocked(useAlerts).mockReturnValue({
      overdue: [createCommitment({ rowIndex: 20, description: 'Aluguel' })],
      today: [],
      week: [],
    })
    render(<Alerts />)
    fireEvent.click(screen.getByText(/1 conta vencida/))
    await screen.findByTestId('alerts-modal', undefined, { timeout: 2000 })
    fireEvent.click(screen.getByTestId('select-commitment-20'))
    await screen.findByTestId('edit-commitment-modal', undefined, { timeout: 2000 })
    fireEvent.click(screen.getByTestId('edit-commitment-confirm'))
    await waitFor(() => {
      expect(screen.queryByTestId('edit-commitment-modal')).not.toBeInTheDocument()
    })
  })

  it('opens PayCardAlertModal when selecting card group from AlertsModal', async () => {
    vi.mocked(useAlerts).mockReturnValue({
      overdue: [
        createCommitment({ rowIndex: 1, type: 'Cartão', card: 'Nubank', amount: 500 }),
        createCommitment({ rowIndex: 2, type: 'Cartão', card: 'Nubank', amount: 300 }),
      ],
      today: [],
      week: [],
    })
    render(<Alerts />)
    fireEvent.click(screen.getByText(/1 conta vencida/))
    await screen.findByTestId('alerts-modal', undefined, { timeout: 2000 })
    fireEvent.click(screen.getByTestId('select-card-Nubank'))
    await waitFor(() => {
      expect(screen.getByTestId('pay-card-modal')).toBeInTheDocument()
    })
    expect(screen.getByText('Pagar fatura')).toBeInTheDocument()
  })

  it('calls payCardStatement and toast.success when Pagar fatura is clicked', async () => {
    mockPayCardStatement.mockResolvedValue(undefined)
    vi.mocked(useAlerts).mockReturnValue({
      overdue: [
        createCommitment({ rowIndex: 1, type: 'Cartão', card: 'Itau', amount: 200 }),
        createCommitment({ rowIndex: 2, type: 'Cartão', card: 'Itau', amount: 100 }),
      ],
      today: [],
      week: [],
    })
    render(<Alerts />)
    fireEvent.click(screen.getByText(/1 conta vencida/))
    await screen.findByTestId('alerts-modal', undefined, { timeout: 2000 })
    fireEvent.click(screen.getByTestId('select-card-Itau'))
    await screen.findByTestId('pay-card-modal', undefined, { timeout: 2000 })
    fireEvent.click(screen.getByTestId('pay-card-pay'))
    await waitFor(() => {
      expect(mockPayCardStatement).toHaveBeenCalledWith(
        expect.objectContaining({
          rowIndexes: [1, 2],
          paymentDate: expect.any(String),
        })
      )
      expect(mockToastSuccess).toHaveBeenCalledWith('Fatura do cartão paga com sucesso!')
    })
  })

  it('closes PayCardAlertModal and does not throw when payCardStatement rejects', async () => {
    mockPayCardStatement.mockRejectedValue(new Error('API error'))
    vi.mocked(useAlerts).mockReturnValue({
      overdue: [
        createCommitment({ rowIndex: 5, type: 'Cartão', card: 'Bradesco', amount: 100 }),
      ],
      today: [],
      week: [],
    })
    render(<Alerts />)
    fireEvent.click(screen.getByText(/1 conta vencida/))
    await screen.findByTestId('alerts-modal', undefined, { timeout: 2000 })
    fireEvent.click(screen.getByTestId('select-card-Bradesco'))
    await screen.findByTestId('pay-card-modal', undefined, { timeout: 2000 })
    fireEvent.click(screen.getByTestId('pay-card-pay'))
    await waitFor(() => {
      expect(mockPayCardStatement).toHaveBeenCalled()
    })
    expect(screen.getByTestId('pay-card-modal')).toBeInTheDocument()
  })
})
