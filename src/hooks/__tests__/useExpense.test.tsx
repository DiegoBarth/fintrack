import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useExpense } from '../useExpense'
import * as expenseApi from '@/api/endpoints/expense'
import type { Expense } from '@/types/Expense'

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
      it('should fetch expenses for the year and filter by month', async () => {
         const mockExpenses: Expense[] = [
            {
               rowIndex: 1,
               description: 'Uber Janeiro',
               category: 'Transporte',
               amount: 50,
               paymentDate: '2026-01-15'
            },
            {
               rowIndex: 2,
               description: 'Uber Fevereiro',
               category: 'Transporte',
               amount: 80,
               paymentDate: '2026-02-10'
            }
         ]

         vi.mocked(expenseApi.listExpenses)
            .mockResolvedValue(mockExpenses)

         const { result } = renderHook(
            () => useExpense('1', '2026'),
            { wrapper: createWrapper() }
         )

         await waitFor(() =>
            expect(result.current.isLoading).toBe(false)
         )

         expect(expenseApi.listExpenses)
            .toHaveBeenCalledWith('all', '2026')

         expect(result.current.expenses).toEqual([
            mockExpenses[0]
         ])
      })


      it('should return an empty array when no expenses are found', async () => {
         vi.mocked(expenseApi.listExpenses).mockResolvedValue([])

         const { result } = renderHook(() => useExpense('2', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         expect(result.current.expenses).toEqual([])
      })

      it('should return all expenses when month is all', async () => {
         const mockExpenses: Expense[] = [
            {
               rowIndex: 1,
               description: 'Uber Janeiro',
               category: 'Transporte',
               amount: 50,
               paymentDate: '2026-01-15'
            },
            {
               rowIndex: 2,
               description: 'Uber Fevereiro',
               category: 'Transporte',
               amount: 80,
               paymentDate: '2026-02-10'
            }
         ]

         vi.mocked(expenseApi.listExpenses).mockResolvedValue(mockExpenses)

         const { result } = renderHook(() => useExpense('all', '2026'), {
            wrapper: createWrapper()
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         expect(result.current.expenses).toEqual(mockExpenses)
      })
   })

   describe('Mutation: create expense', () => {
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
      it('should update expense in cache after update', async () => {
         const existingExpense: Expense = {
            rowIndex: 1,
            description: 'Mercado',
            category: 'Alimentação',
            amount: 350,
            paymentDate: '2026-01-15'
         }

         const updatedExpense: Expense = {
            ...existingExpense,
            amount: 400
         }

         vi.mocked(expenseApi.listExpenses).mockResolvedValue([existingExpense])
         vi.mocked(expenseApi.updateExpense).mockResolvedValue(updatedExpense)

         const queryClient = new QueryClient({
            defaultOptions: {
               queries: { retry: false },
               mutations: { retry: false }
            }
         })

         const wrapper = ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
         )

         const { result } = renderHook(() => useExpense('1', '2026'), {
            wrapper
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))

         await result.current.update({ rowIndex: 1, amount: 400 })

         const cached = queryClient.getQueryData<Expense[]>(['expenses', '2026'])
         expect(cached).toHaveLength(1)
         expect(cached?.[0].amount).toBe(400)
      })
   })

   describe('Mutation: remove expense', () => {
      it('should remove expense from cache after delete', async () => {
         const existingExpense: Expense = {
            rowIndex: 1,
            description: 'Mercado',
            category: 'Alimentação',
            amount: 350,
            paymentDate: '2026-01-15'
         }

         vi.mocked(expenseApi.listExpenses).mockResolvedValue([existingExpense])
         vi.mocked(expenseApi.deleteExpense).mockResolvedValue(undefined as any)

         const queryClient = new QueryClient({
            defaultOptions: {
               queries: { retry: false },
               mutations: { retry: false }
            }
         })

         const wrapper = ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
         )

         const { result } = renderHook(() => useExpense('1', '2026'), {
            wrapper
         })

         await waitFor(() => expect(result.current.isLoading).toBe(false))
         expect(result.current.expenses).toHaveLength(1)

         await result.current.remove(1)

         const cached = queryClient.getQueryData<Expense[]>(['expenses', '2026'])
         expect(cached).toHaveLength(0)
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