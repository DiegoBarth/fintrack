import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Income from '@/pages/Income'
import { useIncome } from '@/hooks/useIncome'
import type { Income as IncomeType } from '@/types/Income'

vi.mock('@/contexts/PeriodContext', () => ({
  usePeriod: () => ({ month: '1', year: '2026' }),
}))

vi.mock('@/hooks/useIncome', () => ({
  useIncome: vi.fn(),
}))

vi.mock('@/components/layout/Layout', () => ({
  Layout: ({ children, title, onBack, subtitle, headerVariant }: any) => (
    <div data-testid="layout">
      <h1>{title}</h1>
      <button onClick={onBack} data-testid="back-button">Voltar</button>
      {subtitle && <span data-testid="subtitle">{subtitle}</span>}
      {children}
    </div>
  ),
}))

vi.mock('@/components/incomes/IncomeList', () => ({
  IncomeList: ({ incomes, onSelect }: { incomes: IncomeType[]; onSelect: (i: IncomeType) => void }) => (
    <div data-testid="income-list">
      {incomes.map((i) => (
        <button key={i.rowIndex} onClick={() => onSelect(i)} type="button">
          {i.description}
        </button>
      ))}
    </div>
  ),
}))

vi.mock('@/components/incomes/IncomeSkeleton', () => ({
  IncomeSkeleton: () => <div data-testid="income-skeleton">Loading</div>,
}))

vi.mock('@/components/incomes/AddIncomeModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="add-income-modal">
        <button onClick={onClose} type="button">Fechar</button>
      </div>
    ) : null,
}))

vi.mock('@/components/incomes/EditIncomeModal', () => ({
  __esModule: true,
  default: ({ isOpen, income, onClose }: { isOpen: boolean; income: IncomeType | null; onClose: () => void }) =>
    isOpen && income ? (
      <div data-testid="edit-income-modal">
        <span>{income.description}</span>
        <button onClick={onClose} type="button">Fechar</button>
      </div>
    ) : null,
}))

const mockUseIncome = vi.mocked(useIncome)

function createIncome(overrides: Partial<IncomeType> = {}): IncomeType {
  return {
    rowIndex: 1,
    description: 'Salário',
    expectedDate: '05/01/2026',
    referenceMonth: '2026-01',
    amount: 3500,
    ...overrides,
  }
}

describe('Income', () => {
  const defaultUseIncomeReturn = {
    incomes: [createIncome({ description: 'Freela', amount: 1000 })],
    isLoading: false,
    isError: false,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    isSaving: false,
    isDeleting: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseIncome.mockReturnValue({ ...defaultUseIncomeReturn })
  })

  it('renders Layout with title Receitas', () => {
    render(
      <MemoryRouter>
        <Income />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: 'Receitas' })).toBeInTheDocument()
  })

  it('renders IncomeSkeleton when isLoading', () => {
    mockUseIncome.mockReturnValue({
      ...defaultUseIncomeReturn,
      incomes: [],
      isLoading: true,
    })
    render(
      <MemoryRouter>
        <Income />
      </MemoryRouter>
    )
    expect(screen.getByTestId('income-skeleton')).toBeInTheDocument()
  })

  it('renders IncomeList with incomes when not loading', () => {
    const incomes = [createIncome({ description: 'Item A' })]
    mockUseIncome.mockReturnValue({
      ...defaultUseIncomeReturn,
      incomes,
    })
    render(
      <MemoryRouter>
        <Income />
      </MemoryRouter>
    )
    expect(screen.getByTestId('income-list')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Item A' })).toBeInTheDocument()
  })

  it('shows subtitle with month and total', () => {
    render(
      <MemoryRouter>
        <Income />
      </MemoryRouter>
    )
    expect(screen.getByTestId('subtitle')).toBeInTheDocument()
    expect(screen.getByTestId('subtitle').textContent).toMatch(/Total:/)
  })

  it('opens AddIncomeModal when Nova receita button is clicked', async () => {
    render(
      <MemoryRouter>
        <Income />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Nova receita' }))
    expect(await screen.findByTestId('add-income-modal', {}, { timeout: 2000 })).toBeInTheDocument()
  })

  it('opens EditIncomeModal when an income is selected', async () => {
    const incomes = [createIncome({ rowIndex: 5, description: 'Aluguel recebido' })]
    mockUseIncome.mockReturnValue({
      ...defaultUseIncomeReturn,
      incomes,
    })
    render(
      <MemoryRouter>
        <Income />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Aluguel recebido' }))
    const modal = await screen.findByTestId('edit-income-modal', {}, { timeout: 2000 })
    expect(modal).toBeInTheDocument()
    expect(modal).toHaveTextContent('Aluguel recebido')
  })
})
