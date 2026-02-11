import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCommitment } from '../useCommitment'
import * as commitmentApi from '@/api/endpoints/commitment'
import type { Commitment } from '@/types/Commitment'
import type { FullSummary } from '@/types/FullSummary'

// Mocks
vi.mock('@/api/endpoints/commitment')
vi.mock('@/services/dashboardService')
vi.mock('@/hooks/useApiError', () => ({
   useApiError: () => ({
      handleError: vi.fn()
   })
}))

describe('useCommitment - additional tests', () => {
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

   it('should load alert commitments for the year', async () => {
      const alertCommitments: Commitment[] = [
         {
            rowIndex: 1,
            description: 'Aluguel pendente',
            category: 'Casa',
            type: 'Fixed',
            amount: 2000,
            dueDate: '2026-01-10'
         },
         {
            rowIndex: 2,
            description: 'Internet pendente',
            category: 'Casa',
            type: 'Fixed',
            amount: 100,
            dueDate: '2026-02-10'
         }
      ]

      vi.mocked(commitmentApi.listCommitments).mockResolvedValue(alertCommitments)

      const { result } = renderHook(
         () => useCommitment('1', '2026', 'alerts'),
         { wrapper: createWrapper() }
      )

      await waitFor(() => {
         expect(result.current.alertCommitments).toEqual(alertCommitments)
      })

      expect(commitmentApi.listCommitments).toHaveBeenCalledWith('all', '2026')
   })

   it('should update commitment amount and recalculate summary', async () => {
      const existingCommitment: Commitment = {
         rowIndex: 1,
         description: 'Aluguel',
         category: 'Casa',
         type: 'Fixed',
         amount: 2000,
         dueDate: '10/01/2026'
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

      vi.mocked(commitmentApi.listCommitments).mockResolvedValue([existingCommitment])
      vi.mocked(commitmentApi.updateCommitment).mockResolvedValue({})

      const { result } = renderHook(() => useCommitment('1', '2026'), {
         wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      // Pre-populate summary in cache
      queryClient.setQueryData<FullSummary>(
         ['summary', '1', '2026'],
         mockSummary
      )

      // Update commitment value
      await result.current.update({
         rowIndex: 1,
         amount: 2500,
         paymentDate: '10/01/2026'
      })

      await waitFor(() => {
         const updatedSummary = queryClient.getQueryData<FullSummary>([
            'summary',
            '1',
            '2026'
         ])
         // Total paid increases by 2500 due to payment marking
         expect(updatedSummary?.totalPaidCommitments).toBe(2500)
      })
   })

   it('should create card commitment', async () => {
      const newCardExpense: Omit<Commitment, 'rowIndex'> = {
         type: 'Credit_card',
         description: 'Fatura Nubank',
         category: 'Alimentação',
         amount: 850,
         dueDate: '2026-01-15',
         card: 'Nubank',
         installment: 1,
         totalInstallments: 1
      }

      const cardCreated: Commitment = {
         rowIndex: 10,
         ...newCardExpense
      }

      vi.mocked(commitmentApi.listCommitments).mockResolvedValue([])
      vi.mocked(commitmentApi.createCard).mockResolvedValue([cardCreated])

      const { result } = renderHook(() => useCommitment('1', '2026'), {
         wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await result.current.createCard(newCardExpense)

      expect(commitmentApi.createCard).toHaveBeenCalledWith(newCardExpense)
   })

   it('should delete unpaid commitment and update totalCommitments in summary', async () => {
      const existingCommitment: Commitment = {
         rowIndex: 1,
         description: 'Aluguel',
         category: 'Casa',
         type: 'Fixed',
         amount: 2000,
         dueDate: '2026-01-10'
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

      vi.mocked(commitmentApi.listCommitments).mockResolvedValue([existingCommitment])
      vi.mocked(commitmentApi.deleteCommitment).mockResolvedValue({})

      const { result } = renderHook(() => useCommitment('1', '2026'), {
         wrapper: createWrapper()
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      // Pre-populate summary in cache
      queryClient.setQueryData<FullSummary>(
         ['summary', '1', '2026'],
         mockSummary
      )

      await result.current.remove(1)

      await waitFor(() => {
         const updatedSummary = queryClient.getQueryData<FullSummary>([
            'summary',
            '1',
            '2026'
         ])
         expect(updatedSummary?.totalCommitments).toBe(0) // 2000 - 2000
         expect(updatedSummary?.totalPaidCommitments).toBe(0) // Was not paid
      })
   })
})