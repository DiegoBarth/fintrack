import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useIncome } from '@/hooks/useIncome'
import * as incomeApi from '@/api/endpoints/income'
import type { Income } from '@/types/Income'

// ===============================
// Mocks
// ===============================
vi.mock('@/api/endpoints/income')
vi.mock('@/services/dashboardService')
vi.mock('@/hooks/useApiError', () => ({
  useApiError: () => ({
    handleError: vi.fn()
  })
}))

describe('useIncome - updated architecture', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
  })

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  // =====================================
  // QUERY
  // =====================================
  it('should fetch incomes for the year and filter by month', async () => {
    const mockIncomes: Income[] = [
      {
        rowIndex: 1,
        description: 'January Salary',
        expectedDate: '05/01/2026',
        amount: 5000,
        receivedDate: '05/01/2026',
        referenceMonth: '2026-01'
      },
      {
        rowIndex: 2,
        description: 'February Salary',
        expectedDate: '05/02/2026',
        amount: 5000,
        receivedDate: '05/02/2026',
        referenceMonth: '2026-02'
      }
    ]

    vi.mocked(incomeApi.listIncomes).mockResolvedValue(mockIncomes)

    const { result } = renderHook(
      () => useIncome('1', '2026'),
      { wrapper: createWrapper() }
    )

    await waitFor(() =>
      expect(result.current.isLoading).toBe(false)
    )

    expect(incomeApi.listIncomes).toHaveBeenCalledWith('2026')

    expect(result.current.incomes).toEqual([
      mockIncomes[0]
    ])
  })

  it('should return all incomes when month is all', async () => {
    const mockIncomes: Income[] = [
      {
        rowIndex: 1,
        description: 'January Salary',
        expectedDate: '05/01/2026',
        amount: 5000,
        receivedDate: '05/01/2026',
        referenceMonth: '2026-01'
      },
      {
        rowIndex: 2,
        description: 'February Salary',
        expectedDate: '05/02/2026',
        amount: 5000,
        receivedDate: '05/02/2026',
        referenceMonth: '2026-02'
      }
    ]

    vi.mocked(incomeApi.listIncomes).mockResolvedValue(mockIncomes)

    const { result } = renderHook(
      () => useIncome('all', '2026'),
      { wrapper: createWrapper() }
    )

    await waitFor(() =>
      expect(result.current.isLoading).toBe(false)
    )

    expect(result.current.incomes).toEqual(mockIncomes)
  })

  // =====================================
  // CREATE
  // =====================================
  it('should create income and call API correctly', async () => {
    const newIncome: Omit<Income, 'rowIndex'> = {
      description: 'Salary',
      amount: 5000,
      expectedDate: '05/01/2026',
      receivedDate: '05/01/2026',
      referenceMonth: '2026-01'
    }

    const createdIncome: Income = {
      rowIndex: 10,
      ...newIncome
    }

    vi.mocked(incomeApi.listIncomes).mockResolvedValue([])
    vi.mocked(incomeApi.createIncome).mockResolvedValue([createdIncome])

    const { result } = renderHook(
      () => useIncome('1', '2026'),
      { wrapper: createWrapper() }
    )

    await waitFor(() =>
      expect(result.current.isLoading).toBe(false)
    )

    await result.current.create(newIncome)

    expect(incomeApi.createIncome).toHaveBeenCalled()
    expect(vi.mocked(incomeApi.createIncome).mock.calls[0][0]).toEqual(newIncome)
  })

  // =====================================
  // UPDATE
  // =====================================
  it('should update income amount', async () => {
    const existingIncome: Income = {
      rowIndex: 1,
      description: 'Salary',
      amount: 5000,
      expectedDate: '05/01/2026',
      receivedDate: '05/01/2026',
      referenceMonth: '2026-01'
    }

    const updatedIncome: Income = {
      ...existingIncome,
      amount: 6000
    }

    vi.mocked(incomeApi.listIncomes).mockResolvedValue([existingIncome])
    vi.mocked(incomeApi.updateIncome).mockResolvedValue([updatedIncome])

    const { result } = renderHook(
      () => useIncome('1', '2026'),
      { wrapper: createWrapper() }
    )

    await waitFor(() =>
      expect(result.current.isLoading).toBe(false)
    )

    await result.current.update({
      rowIndex: 1,
      amount: 6000,
      receivedDate: '05/01/2026'
    })

    expect(incomeApi.updateIncome).toHaveBeenCalled()

    expect(vi.mocked(incomeApi.updateIncome).mock.calls[0][0]).toEqual({
      rowIndex: 1,
      amount: 6000,
      receivedDate: '05/01/2026'
    })
  })

  it('should remove receivedDate when updating', async () => {
    const existingIncome: Income = {
      rowIndex: 1,
      description: 'Salary',
      amount: 5000,
      expectedDate: '05/01/2026',
      receivedDate: '05/01/2026',
      referenceMonth: '2026-01'
    }

    const updatedIncome: Income = {
      ...existingIncome,
      receivedDate: null
    }

    vi.mocked(incomeApi.listIncomes).mockResolvedValue([existingIncome])
    vi.mocked(incomeApi.updateIncome).mockResolvedValue([updatedIncome])

    const { result } = renderHook(
      () => useIncome('1', '2026'),
      { wrapper: createWrapper() }
    )

    await waitFor(() =>
      expect(result.current.isLoading).toBe(false)
    )

    await result.current.update({
      rowIndex: 1,
      amount: 5000,
      receivedDate: null as any
    })

    expect(incomeApi.updateIncome).toHaveBeenCalled()

    expect(vi.mocked(incomeApi.updateIncome).mock.calls[0][0]).toEqual({
      rowIndex: 1,
      amount: 5000,
      receivedDate: null
    })
  })
})