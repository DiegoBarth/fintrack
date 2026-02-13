import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCommitment } from '@/hooks/useCommitment'
import * as commitmentApi from '@/api/endpoints/commitment'
import * as dashboardService from '@/services/dashboardService'
import type { Commitment } from '@/types/Commitment'
import type { Dashboard } from '@/types/Dashboard'

// Mocks
vi.mock('@/api/endpoints/commitment')
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
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
   )
}

describe('useCommitment', () => {
   beforeEach(() => {
      vi.clearAllMocks()
   })

   describe('Query: list commitments', () => {
      it('should fetch commitments for the given month and year', async () => {
         const mockCommitments: Commitment[] = [
            {
               rowIndex: 1,
               description: 'Aluguel',
               category: 'Casa',
               type: 'Fixo',
               amount: 2000,
               dueDate: '2026-01-10'
            }
         ]

         vi.mocked(commitmentApi.listCommitments).mockResolvedValue(mockCommitments)

         const { result } = renderHook(() => useCommitment('1', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         expect(commitmentApi.listCommitments).toHaveBeenCalledWith('1', '2026')
         expect(result.current.commitments).toEqual(mockCommitments)
      })

      it('should return an empty array when no commitments are found', async () => {
         vi.mocked(commitmentApi.listCommitments).mockResolvedValue([])

         const { result } = renderHook(() => useCommitment('2', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         expect(result.current.commitments).toEqual([])
      })
   })

   describe('Mutation: create commitment', () => {
      it('should create a commitment and update the cache', async () => {
         const newCommitment = {
            type: 'Fixo' as const,
            description: 'Academia',
            category: 'Saúde',
            amount: 150,
            dueDate: '2026-01-15'
         }

         const createdCommitment: Commitment = {
            rowIndex: 10,
            ...newCommitment
         }

         vi.mocked(commitmentApi.listCommitments).mockResolvedValue([])
         vi.mocked(commitmentApi.createCommitment).mockResolvedValue([createdCommitment])

         const { result } = renderHook(() => useCommitment('1', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         await result.current.create(newCommitment)

         expect(commitmentApi.createCommitment).toHaveBeenCalledWith(newCommitment)
      })
   })

   describe('Mutation: create card expense', () => {
      it('should create a card commitment and call dashboardService', async () => {
         const newCardExpense: Omit<Commitment, 'rowIndex'> = {
            description: 'Notebook',
            category: 'Eletrônicos',
            type: 'Cartão',
            amount: 1500,
            dueDate: '2026-01-15',
            card: 'Bradesco',
            installment: 1,
            totalInstallments: 10
         }

         const cardCreated: Commitment = {
            rowIndex: 20,
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
   })

   describe('Mutation: update commitment', () => {
      it('should mark commitment as paid', async () => {
         const existingCommitment: Commitment = {
            rowIndex: 1,
            description: 'Aluguel',
            category: 'Casa',
            type: 'Fixo',
            amount: 2000,
            dueDate: '10/01/2026'
         }

         vi.mocked(commitmentApi.listCommitments).mockResolvedValue([existingCommitment])
         vi.mocked(commitmentApi.updateCommitment).mockResolvedValue({})

         const mockDashboard: Dashboard = {
            monthlyBalance: [{ date: '2026-01', balance: 10000 }],
            topCategories: [],
            cardsSummary: []
         }

         vi.mocked(
            dashboardService.updateDashboardAfterEditCommitment
         ).mockReturnValue(mockDashboard)

         const { result } = renderHook(() => useCommitment('1', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         await result.current.update({
            rowIndex: 1,
            amount: 2000,
            paymentDate: '10/01/2026'
         })

         expect(commitmentApi.updateCommitment).toHaveBeenCalledWith({
            rowIndex: 1,
            amount: 2000,
            paymentDate: '10/01/2026'
         })
      })
   })

   describe('Mutation: delete commitment', () => {
      it('should delete commitment and remove it from cache', async () => {
         const existingCommitment: Commitment = {
            rowIndex: 1,
            description: 'Aluguel',
            category: 'Casa',
            type: 'Fixo',
            amount: 2000,
            dueDate: '10/01/2026'
         }

         vi.mocked(commitmentApi.listCommitments).mockResolvedValue([existingCommitment])
         vi.mocked(commitmentApi.deleteCommitment).mockResolvedValue({})

         const mockDashboard: Dashboard = {
            monthlyBalance: [{ date: '2026-01', balance: 12000 }],
            topCategories: [],
            cardsSummary: []
         }

         vi.mocked(
            dashboardService.updateDashboardAfterDeleteCommitment
         ).mockReturnValue(mockDashboard)

         const { result } = renderHook(() => useCommitment('1', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         expect(result.current.commitments).toHaveLength(1)

         await result.current.remove(1)

         expect(commitmentApi.deleteCommitment).toHaveBeenCalledWith(1)
      })
   })

   describe('Mutation: additional commitment scenarios', () => {
      it('should fetch alert commitments when type is "alerts"', async () => {
         const mockCommitments: Commitment[] = [
            {
               rowIndex: 1,
               description: 'Aluguel',
               category: 'Casa',
               type: 'Fixo',
               amount: 2000,
               dueDate: '2026-01-10'
            }
         ]

         vi.mocked(commitmentApi.listCommitments).mockResolvedValue(mockCommitments)

         const { result } = renderHook(
            () => useCommitment('all', '2026', 'alerts'),
            { wrapper: createWrapper() }
         )

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         expect(result.current.alertCommitments).toBeDefined()
      })

      it('should handle paymentDate removal when updating', async () => {
         const existingCommitment: Commitment = {
            rowIndex: 1,
            description: 'Aluguel',
            category: 'Casa',
            type: 'Fixo',
            amount: 2000,
            dueDate: '2026-01-10',
            paymentDate: '2026-01-10'
         }

         vi.mocked(commitmentApi.listCommitments).mockResolvedValue([existingCommitment])
         vi.mocked(commitmentApi.updateCommitment).mockResolvedValue({})

         const { result } = renderHook(() => useCommitment('1', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         await result.current.update({
            rowIndex: 1,
            amount: 2000,
            paymentDate: null as any
         })

         expect(commitmentApi.updateCommitment).toHaveBeenCalledWith({
            rowIndex: 1,
            amount: 2000,
            paymentDate: null
         })
      })
   })
})