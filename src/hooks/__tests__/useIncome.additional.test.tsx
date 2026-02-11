import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useIncome } from '@/hooks/useIncome'
import * as incomeApi from '@/api/endpoints/income'
import type { Income } from '@/types/Income'
import type { FullSummary } from '@/types/FullSummary'

// Mocks
vi.mock('@/api/endpoints/income')
vi.mock('@/services/dashboardService')
vi.mock('@/hooks/useApiError', () => ({
   useApiError: () => ({
      handleError: vi.fn()
   })
}))

describe('useIncome - additional tests', () => {
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
         <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )
   }

   it('should create income and add it to cache', async () => {
      const newIncome: Omit<Income, 'rowIndex'> = {
         description: 'Salary',
         amount: 5000,
         expectedDate: '05/01/2026',
         receivedDate: '05/01/2026'
      }

      const createdIncome: Income = {
         rowIndex: 10,
         ...newIncome
      }

      vi.mocked(incomeApi.listIncomes).mockResolvedValue([])
      vi.mocked(incomeApi.createIncome).mockResolvedValue(createdIncome)

      const { result } = renderHook(() => useIncome('1', '2026'), {
         wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await result.current.create(newIncome)

      expect(incomeApi.createIncome).toHaveBeenCalledWith(newIncome)
   })

   it('should update income amount and recalculate summary', async () => {
      const existingIncome: Income = {
         rowIndex: 1,
         description: 'Salary',
         amount: 5000,
         expectedDate: '05/01/2026',
         receivedDate: '05/01/2026'
      }

      const mockSummary: FullSummary = {
         totalIncomes: 5000,
         totalCommitments: 2000,
         totalExpenses: 500,
         totalReceivedAmount: 5000,
         totalPaidCommitments: 0,
         totalReceivedInMonth: 5000,
         totalPaidCommitmentsInMonth: 0,
         totalPaidExpenses: 0,
         totalPaidExpensesInMonth: 0,
         availableYears: [2026]
      }

      vi.mocked(incomeApi.listIncomes).mockResolvedValue([existingIncome])
      vi.mocked(incomeApi.updateIncome).mockResolvedValue({})

      const { result } = renderHook(() => useIncome('1', '2026'), {
         wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      // Pre-populate summary cache
      queryClient.setQueryData<FullSummary>(
         ['summary', '1', '2026'],
         mockSummary
      )

      // Increase amount from 5000 to 6000
      await result.current.update({
         rowIndex: 1,
         amount: 6000,
         receivedDate: '05/01/2026'
      })

      await waitFor(() => {
         const updatedSummary = queryClient.getQueryData<FullSummary>([
            'summary',
            '1',
            '2026'
         ])
         // totalIncomes: remove old 5000, add new 6000 = 6000
         expect(updatedSummary?.totalIncomes).toBe(6000)
         // totalReceivedAmount: remove old 5000, add new 6000 = 6000
         expect(updatedSummary?.totalReceivedAmount).toBe(6000)
      })
   })

   it('should remove receivedDate and update summary', async () => {
      const existingIncome: Income = {
         rowIndex: 1,
         description: 'Salary',
         amount: 5000,
         expectedDate: '05/01/2026',
         receivedDate: '05/01/2026'
      }

      const mockSummary: FullSummary = {
         totalIncomes: 5000,
         totalCommitments: 2000,
         totalExpenses: 500,
         totalReceivedAmount: 5000,
         totalPaidCommitments: 2000,
         totalReceivedInMonth: 5000,
         totalPaidCommitmentsInMonth: 2000,
         totalPaidExpenses: 2000,
         totalPaidExpensesInMonth: 2000,
         availableYears: [2026]
      }

      vi.mocked(incomeApi.listIncomes).mockResolvedValue([existingIncome])
      vi.mocked(incomeApi.updateIncome).mockResolvedValue({})

      const { result } = renderHook(() => useIncome('1', '2026'), {
         wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      queryClient.setQueryData<FullSummary>(
         ['summary', '1', '2026'],
         mockSummary
      )

      // Remove receivedDate
      await result.current.update({
         rowIndex: 1,
         amount: 5000,
         receivedDate: undefined
      })

      await waitFor(() => {
         const updatedSummary = queryClient.getQueryData<FullSummary>([
            'summary',
            '1',
            '2026'
         ])
         expect(updatedSummary?.totalIncomes).toBe(5000)
         expect(updatedSummary?.totalReceivedAmount).toBe(0) // 5000 - 5000
      })
   })

   it('should add receivedDate to existing income and update summary', async () => {
      const existingIncome: Income = {
         rowIndex: 1,
         description: 'Salary',
         amount: 5000,
         expectedDate: '05/01/2026'
      }

      const mockSummary: FullSummary = {
         totalIncomes: 5000,
         totalCommitments: 2000,
         totalExpenses: 500,
         totalReceivedAmount: 0,
         totalPaidCommitments: 2000,
         totalReceivedInMonth: 0,
         totalPaidCommitmentsInMonth: 2000,
         totalPaidExpenses: 2000,
         totalPaidExpensesInMonth: 2000,
         availableYears: [2026]
      }

      vi.mocked(incomeApi.listIncomes).mockResolvedValue([existingIncome])
      vi.mocked(incomeApi.updateIncome).mockResolvedValue({})

      const { result } = renderHook(() => useIncome('1', '2026'), {
         wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      queryClient.setQueryData<FullSummary>(
         ['summary', '1', '2026'],
         mockSummary
      )

      // Add receivedDate
      await result.current.update({
         rowIndex: 1,
         amount: 5000,
         receivedDate: '05/01/2026'
      })

      await waitFor(() => {
         const updatedSummary = queryClient.getQueryData<FullSummary>([
            'summary',
            '1',
            '2026'
         ])
         expect(updatedSummary?.totalIncomes).toBe(5000)
         expect(updatedSummary?.totalReceivedAmount).toBe(5000) // 0 + 5000
      })
   })
})