import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useExpense } from '../useExpense'
import * as expenseApi from '@/api/endpoints/expense'
import * as dashboardService from '@/services/dashboardService'
import type { Expense } from '@/types/Expense'
import type { Dashboard } from '@/types/Dashboard'

// Mocks
vi.mock('@/api/endpoints/expense')
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

describe('useExpense', () => {
   beforeEach(() => {
      vi.clearAllMocks()
   })

   describe('Query: list expenses', () => {
      it('should fetch expenses for the given month and year', async () => {
         const mockExpenses: Expense[] = [
            {
               rowIndex: 1,
               description: 'Uber',
               category: 'Transporte',
               amount: 50,
               paymentDate: '2026-01-15'
            }
         ]

         vi.mocked(expenseApi.listExpenses).mockResolvedValue(mockExpenses)

         const { result } = renderHook(() => useExpense('1', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         expect(expenseApi.listExpenses).toHaveBeenCalledWith('1', '2026')
         expect(result.current.expenses).toEqual(mockExpenses)
      })

      it('should return an empty array when no expenses are found', async () => {
         vi.mocked(expenseApi.listExpenses).mockResolvedValue([])

         const { result } = renderHook(() => useExpense('2', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         expect(result.current.expenses).toEqual([])
      })
   })

   describe('Mutation: create expense', () => {
      it('should create an expense and call dashboardService', async () => {
         const newExpense = {
            description: 'Gasolina',
            category: 'Transporte',
            amount: 200,
            paymentDate: '2026-01-15'
         }

         const createdExpense: Expense = {
            rowIndex: 10,
            ...newExpense
         }

         vi.mocked(expenseApi.listExpenses).mockResolvedValue([])
         vi.mocked(expenseApi.createExpense).mockResolvedValue(createdExpense)

         const mockDashboard: Dashboard = {
            monthlyBalance: [{ date: '2026-01', balance: 9800 }],
            topCategories: [{ category: 'Transporte', total: 200 }],
            cardsSummary: []
         }

         vi.mocked(
            dashboardService.updateDashboardAfterCreateExpense
         ).mockReturnValue(mockDashboard)

         const { result } = renderHook(() => useExpense('1', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         await result.current.create(newExpense)

         expect(expenseApi.createExpense).toHaveBeenCalledWith(newExpense)
      })

      it('should add the expense to cache after creation', async () => {
         const newExpense = {
            description: 'Almoço',
            category: 'Alimentação',
            amount: 35,
            paymentDate: '2026-01-15'
         }

         const createdExpense: Expense = {
            rowIndex: 5,
            ...newExpense
         }

         vi.mocked(expenseApi.listExpenses).mockResolvedValue([])
         vi.mocked(expenseApi.createExpense).mockResolvedValue(createdExpense)

         const { result } = renderHook(() => useExpense('1', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         expect(result.current.expenses).toHaveLength(0)

         await result.current.create(newExpense)
      })
   })

   describe('Mutation: update expense', () => {
      it('should update an expense and call dashboardService', async () => {
         const existingExpense: Expense = {
            rowIndex: 1,
            description: 'Uber',
            category: 'Transporte',
            amount: 50,
            paymentDate: '2026-01-15'
         }

         vi.mocked(expenseApi.listExpenses).mockResolvedValue([existingExpense])
         vi.mocked(expenseApi.updateExpense).mockResolvedValue({
            ...existingExpense,
            amount: 80
         })

         const mockDashboard: Dashboard = {
            monthlyBalance: [{ date: '2026-01', balance: 9920 }],
            topCategories: [{ category: 'Transporte', total: 80 }],
            cardsSummary: []
         }

         vi.mocked(
            dashboardService.updateDashboardAfterEditExpense
         ).mockReturnValue(mockDashboard)

         const { result } = renderHook(() => useExpense('1', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         await result.current.update({
            rowIndex: 1,
            amount: 80
         })

         expect(expenseApi.updateExpense).toHaveBeenCalledWith({
            rowIndex: 1,
            amount: 80
         })
      })
   })

   describe('Mutation: delete expense', () => {
      it('should delete an expense and remove it from cache', async () => {
         const existingExpense: Expense = {
            rowIndex: 1,
            description: 'Uber',
            category: 'Transporte',
            amount: 50,
            paymentDate: '15/01/2026'
         }

         vi.mocked(expenseApi.listExpenses).mockResolvedValue([existingExpense])
         vi.mocked(expenseApi.deleteExpense).mockResolvedValue(existingExpense)

         const mockDashboard: Dashboard = {
            monthlyBalance: [{ date: '2026-01', balance: 10050 }],
            topCategories: [],
            cardsSummary: []
         }

         vi.mocked(
            dashboardService.updateDashboardAfterDeleteExpense
         ).mockReturnValue(mockDashboard)

         const { result } = renderHook(() => useExpense('1', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         expect(result.current.expenses).toHaveLength(1)

         await result.current.remove(1)

         expect(expenseApi.deleteExpense).toHaveBeenCalledWith(1)
      })
   })

   describe('Mutation: error handling for expenses', () => {
      it('should handle error when creating an expense', async () => {
         const newExpense = {
            description: 'Mercado',
            category: 'Alimentação',
            amount: 350,
            paymentDate: '15/01/2026'
         }

         vi.mocked(expenseApi.listExpenses).mockResolvedValue([])
         vi.mocked(expenseApi.createExpense).mockRejectedValue(
            new Error('Create error')
         )

         const { result } = renderHook(() => useExpense('1', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         await expect(result.current.create(newExpense)).rejects.toThrow()
      })

      it('should handle error when updating an expense', async () => {
         const existingExpense: Expense = {
            rowIndex: 1,
            description: 'Mercado',
            category: 'Alimentação',
            amount: 350,
            paymentDate: '15/01/2026'
         }

         vi.mocked(expenseApi.listExpenses).mockResolvedValue([existingExpense])
         vi.mocked(expenseApi.updateExpense).mockRejectedValue(
            new Error('Update error')
         )

         const { result } = renderHook(() => useExpense('1', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         await expect(
            result.current.update({
               rowIndex: 1,
               amount: 400
            })
         ).rejects.toThrow()
      })

      it('should handle error when deleting an expense', async () => {
         const existingExpense: Expense = {
            rowIndex: 1,
            description: 'Mercado',
            category: 'Alimentação',
            amount: 350,
            paymentDate: '2026-01-15'
         }

         vi.mocked(expenseApi.listExpenses).mockResolvedValue([existingExpense])
         vi.mocked(expenseApi.deleteExpense).mockRejectedValue(
            new Error('Delete error')
         )

         const { result } = renderHook(() => useExpense('1', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         await expect(result.current.remove(1)).rejects.toThrow()
      })
   })
})