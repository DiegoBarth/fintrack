import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import Alerts from '@/components/home/Alerts'
import { useAlerts } from '@/hooks/useAlerts'
import type { Commitment } from '@/types/Commitment'

const mockPayCardStatement = vi.fn()

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
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    clear: vi.fn(),
  }),
}))

vi.mock('@/components/home/CommitmentsModal', () => ({
  AlertsModal: (props: { title: string; onClose: () => void }) =>
    React.createElement('div', { 'data-testid': 'alerts-modal' }, [
      React.createElement('span', { key: 'title' }, props.title),
      React.createElement('button', { key: 'close', onClick: props.onClose }, 'Fechar modal'),
    ]),
}))

vi.mock('@/components/commitments/EditCommitmentModal', () => ({
  default: () => React.createElement('div', { 'data-testid': 'edit-commitment-modal' }, null),
}))

vi.mock('@/components/home/PayCardAlertModal', () => ({
  PayCardAlertModal: () => React.createElement('div', { 'data-testid': 'pay-card-modal' }, null),
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
})
