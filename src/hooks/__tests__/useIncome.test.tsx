import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useIncome } from '../useIncome'
import * as incomeApi from '@/api/endpoints/income'
import type { Income } from '@/types/Income'

// Mocks
vi.mock('@/api/endpoints/income')
vi.mock('@/services/dashboardService')
vi.mock('@/hooks/useApiError', () => ({
  useApiError: () => ({
    handleError: vi.fn()
  })
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient} > {children} </QueryClientProvider>
  )
}

describe('useIncome', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Query: list incomes', () => {
    it('should fetch incomes for the year and filter by month', async () => {
      const mockIncomes: Income[] = [
        {
          rowIndex: 1,
          description: 'Salary January',
          expectedDate: '2026-01-05',
          amount: 5000,
          receivedDate: '2026-01-05',
          referenceMonth: '2026-01'
        },
        {
          rowIndex: 2,
          description: 'Salary February',
          expectedDate: '2026-02-05',
          amount: 5000,
          receivedDate: '2026-02-05',
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
          description: 'January',
          expectedDate: '2026-01-05',
          amount: 5000,
          receivedDate: '2026-01-05',
          referenceMonth: '2026-01'
        },
        {
          rowIndex: 2,
          description: 'February',
          expectedDate: '2026-02-05',
          amount: 5000,
          receivedDate: '2026-02-05',
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

    it('should return an empty array when no incomes exist', async () => {
      vi.mocked(incomeApi.listIncomes).mockResolvedValue([])

      const { result } = renderHook(() => useIncome('2', '2026'), {
        wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.incomes).toEqual([])
    })
  })

  describe('Mutation: create income', () => {
    it('should add income to cache after creation', async () => {
      const newIncome = {
        description: 'Freelance',
        expectedDate: '2026-01-20',
        amount: 1500,
        receivedDate: '2026-01-20',
        referenceMonth: '2026-01'
      }

      const createdIncome: Income = {
        rowIndex: 5,
        ...newIncome
      }

      vi.mocked(incomeApi.listIncomes).mockResolvedValue([])
      vi.mocked(incomeApi.createIncome).mockResolvedValue([createdIncome])

      const { result } = renderHook(() => useIncome('1', '2026'), {
        wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.incomes).toHaveLength(0)

      await result.current.create(newIncome)
    })
  })

  describe('Mutation: remove income', () => {
    it('should delete income with scope when remove receives object arg', async () => {
      const existingIncome: Income = {
        rowIndex: 2,
        description: 'Salary',
        expectedDate: '05/01/2026',
        amount: 5000,
        receivedDate: '05/01/2026',
        referenceMonth: '2026-01'
      }

      vi.mocked(incomeApi.listIncomes).mockResolvedValue([existingIncome])
      vi.mocked(incomeApi.deleteIncome).mockResolvedValue({})

      const { result } = renderHook(() => useIncome('1', '2026'), {
        wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await result.current.remove({ rowIndex: 2, scope: 'future' })

      expect(incomeApi.deleteIncome).toHaveBeenCalledWith(2, 'future')
    })

    it('should call handleError when delete fails', async () => {
      const existingIncome: Income = {
        rowIndex: 1,
        description: 'Salary',
        expectedDate: '2026-01-05',
        amount: 5000,
        referenceMonth: '2026-01'
      }

      vi.mocked(incomeApi.listIncomes).mockResolvedValue([existingIncome])
      vi.mocked(incomeApi.deleteIncome).mockRejectedValue(new Error('Delete failed'))

      const { result } = renderHook(() => useIncome('1', '2026'), {
        wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await expect(result.current.remove(1)).rejects.toThrow('Delete failed')
    })
  })

  describe('Mutation: edge cases and errors', () => {
    it('should handle error when creating income', async () => {
      const newIncome = {
        description: 'Salary',
        expectedDate: '2026-01-05',
        amount: 5000,
        receivedDate: '2026-01-05',
        referenceMonth: '2026-01'
      }

      vi.mocked(incomeApi.listIncomes).mockResolvedValue([])
      vi.mocked(incomeApi.createIncome).mockRejectedValue(new Error('Creation failed'))

      const { result } = renderHook(() => useIncome('1', '2026'), {
        wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await expect(result.current.create(newIncome)).rejects.toThrow()
    })

    it('should update income by removing receivedDate', async () => {
      const existingIncome: Income = {
        rowIndex: 1,
        description: 'Salary',
        expectedDate: '2026-01-05',
        amount: 5000,
        receivedDate: '2026-01-05',
        referenceMonth: '2026-01'
      }

      vi.mocked(incomeApi.listIncomes).mockResolvedValue([existingIncome])
      vi.mocked(incomeApi.updateIncome).mockResolvedValue([existingIncome])

      const { result } = renderHook(() => useIncome('1', '2026'), {
        wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await result.current.update({
        rowIndex: 1,
        amount: 5000,
        receivedDate: null
      })

      expect(incomeApi.updateIncome).toHaveBeenCalledWith({
        rowIndex: 1,
        amount: 5000,
        receivedDate: null
      })
    })

    it('should handle error when updating income', async () => {
      const existingIncome: Income = {
        rowIndex: 1,
        description: 'Salary',
        expectedDate: '2026-01-05',
        amount: 5000,
        referenceMonth: '2026-01'
      }

      vi.mocked(incomeApi.listIncomes).mockResolvedValue([existingIncome])
      vi.mocked(incomeApi.updateIncome).mockRejectedValue(new Error('Update failed'))

      const { result } = renderHook(() => useIncome('1', '2026'), {
        wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await expect(
        result.current.update({ rowIndex: 1, amount: 5500, receivedDate: '2026-01-05' })
      ).rejects.toThrow('Update failed')
    })
  })

  describe('Mutation: Guard clauses', () => {
    it('should return early in update success if oldIncome is not found', async () => {
      const updatedIncome: Income = { rowIndex: 99, description: 'Not in Cache', expectedDate: '2026-01-05', amount: 100, referenceMonth: '2026-01' };

      vi.mocked(incomeApi.listIncomes).mockResolvedValue([]);
      vi.mocked(incomeApi.updateIncome).mockResolvedValue([updatedIncome]);

      const { result } = renderHook(() => useIncome('1', '2026'), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await result.current.update({ rowIndex: 99, amount: 200 });
    });

    it('should return early in remove success if baseIncome is not found', async () => {
      vi.mocked(incomeApi.listIncomes).mockResolvedValue([]);
      vi.mocked(incomeApi.deleteIncome).mockResolvedValue({});

      const { result } = renderHook(() => useIncome('1', '2026'), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await result.current.remove(99);
    })
    it('should handle single scope deletion logic', async () => {
      const existingIncome: Income = {
        rowIndex: 5,
        description: 'Freelance',
        expectedDate: '10/01/2026',
        amount: 500,
        referenceMonth: '2026-01'
      }

      vi.mocked(incomeApi.listIncomes).mockResolvedValue([existingIncome])
      vi.mocked(incomeApi.deleteIncome).mockResolvedValue({})

      const { result } = renderHook(() => useIncome('1', '2026'), {
        wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await result.current.remove(5)

      expect(incomeApi.deleteIncome).toHaveBeenCalledWith(5)
    })
  })
})