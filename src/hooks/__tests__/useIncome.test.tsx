import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useIncome } from '../useIncome'
import * as incomeApi from '@/api/endpoints/income'
import * as dashboardService from '@/services/dashboardService'
import type { Income } from '@/types/Income'
import type { Dashboard } from '@/types/Dashboard'

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
      <QueryClientProvider client= { queryClient } > { children } </QueryClientProvider>
   )
}

describe('useIncome', () => {
   beforeEach(() => {
      vi.clearAllMocks()
   })

   describe('Query: list incomes', () => {
      it('should fetch incomes for a specific month/year', async () => {
         const mockIncomes: Income[] = [
            {
               rowIndex: 1,
               description: 'Salary',
               expectedDate: '2026-01-05',
               amount: 5000,
               receivedDate: '2026-01-05'
            }
         ]

         vi.mocked(incomeApi.listIncomes).mockResolvedValue(mockIncomes)

         const { result } = renderHook(() => useIncome('1', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         expect(incomeApi.listIncomes).toHaveBeenCalledWith('1', '2026')
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
      it('should create income and call dashboardService', async () => {
         const newIncome = {
            description: 'Salary',
            expectedDate: '2026-01-05',
            amount: 5000,
            receivedDate: '2026-01-05'
         }

         const createdIncome: Income = {
            rowIndex: 10,
            ...newIncome
         }

         vi.mocked(incomeApi.listIncomes).mockResolvedValue([])
         vi.mocked(incomeApi.createIncome).mockResolvedValue([createdIncome])

         const mockDashboard: Dashboard = {
            monthlyBalance: [{ date: '2026-01', balance: 15000 }],
            topCategories: [],
            cardsSummary: []
         }

         vi.mocked(
            dashboardService.updateDashboardAfterCreateIncome
         ).mockReturnValue(mockDashboard)

         const { result } = renderHook(() => useIncome('1', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         await result.current.create(newIncome)

         expect(incomeApi.createIncome).toHaveBeenCalledWith(newIncome)
      })

      it('should add income to cache after creation', async () => {
         const newIncome = {
            description: 'Freelance',
            expectedDate: '2026-01-20',
            amount: 1500,
            receivedDate: '2026-01-20'
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

   describe('Mutation: update income', () => {
      it('should update income and call dashboardService', async () => {
         const existingIncome: Income = {
            rowIndex: 1,
            description: 'Salary',
            expectedDate: '2026-01-05',
            amount: 5000,
            receivedDate: '2026-01-05'
         }

         vi.mocked(incomeApi.listIncomes).mockResolvedValue([existingIncome])
         vi.mocked(incomeApi.updateIncome).mockResolvedValue({})

         const mockDashboard: Dashboard = {
            monthlyBalance: [{ date: '2026-01', balance: 10500 }],
            topCategories: [],
            cardsSummary: []
         }

         vi.mocked(
            dashboardService.updateDashboardAfterEditIncome
         ).mockReturnValue(mockDashboard)

         const { result } = renderHook(() => useIncome('1', '2026'), {
            wrapper: createWrapper()
         })

         await result.current.update({
            rowIndex: 1,
            amount: 5500,
            receivedDate: '2026-01-05'
         })

         expect(incomeApi.updateIncome).toHaveBeenCalledWith({
            rowIndex: 1,
            amount: 5500,
            receivedDate: '2026-01-05'
         })
      })
   })

   describe('Mutation: remove income', () => {
      it('should delete income and remove it from cache', async () => {
         const existingIncome: Income = {
            rowIndex: 1,
            description: 'Salary',
            expectedDate: '2026-01-05',
            amount: 5000,
            receivedDate: '2026-01-05'
         }

         vi.mocked(incomeApi.listIncomes).mockResolvedValue([existingIncome])
         vi.mocked(incomeApi.deleteIncome).mockResolvedValue({})

         const mockDashboard: Dashboard = {
            monthlyBalance: [{ date: '2026-01', balance: 5000 }],
            topCategories: [],
            cardsSummary: []
         }

         vi.mocked(
            dashboardService.updateDashboardAfterDeleteIncome
         ).mockReturnValue(mockDashboard)

         const { result } = renderHook(() => useIncome('1', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         expect(result.current.incomes).toHaveLength(1)

         await result.current.remove(1)

         expect(incomeApi.deleteIncome).toHaveBeenCalledWith(1, '1', '2026')
      })
   })

   describe('Mutation: edge cases and errors', () => {
      it('should handle error when creating income', async () => {
         const newIncome = {
            description: 'Salary',
            expectedDate: '2026-01-05',
            amount: 5000,
            receivedDate: '2026-01-05'
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
            receivedDate: '2026-01-05'
         }

         vi.mocked(incomeApi.listIncomes).mockResolvedValue([existingIncome])
         vi.mocked(incomeApi.updateIncome).mockResolvedValue({})

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
   })
})