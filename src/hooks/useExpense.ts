import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listExpenses, createExpense, updateExpense, deleteExpense } from '@/api/endpoints/expense'
import { useApiError } from '@/hooks/useApiError'
import { updateCacheAfterCreateExpense, updateCacheAfterEditExpense, updateCacheAfterDeleteExpense } from '@/services/expenseCacheService'
import type { Expense } from '@/types/Expense'

export function useExpense(month: string, year: string) {
   const queryClient = useQueryClient()
   const { handleError } = useApiError()
   const queryKey = ['expenses', month, year]

   const { data: expenses = [], isLoading, isError } = useQuery({
      queryKey,
      queryFn: () => listExpenses(month, String(year)),
      staleTime: Infinity,
      retry: 1
   })

   const createMutation = useMutation({
      mutationFn: (newExpense: Omit<Expense, 'rowIndex'>) => createExpense(newExpense),
      onSuccess: (newExpense: Expense) => {
         updateCacheAfterCreateExpense(queryClient, newExpense)
      },
      onError: (error) => {
         handleError(error)
      }
   })

   const updateMutation = useMutation({
      mutationFn: (data: { rowIndex: number, amount: number }) => updateExpense(data),
      onSuccess: (_data, variables) => {
         const oldExpense = expenses.find(g => g.rowIndex === variables.rowIndex)

         if (oldExpense) {
            updateCacheAfterEditExpense(queryClient, oldExpense, variables.amount, month, year)
         }
      },
      onError: (error) => {
         handleError(error)
      }
   })

   const removeMutation = useMutation({
      mutationFn: (rowIndex: number) => deleteExpense(rowIndex),
      onSuccess: (_data, rowIndex) => {
         const deletedExpense = expenses.find(g => g.rowIndex === rowIndex)

         if (deletedExpense) {
            updateCacheAfterDeleteExpense(queryClient, deletedExpense, month, year)
         }
      },
      onError: (error) => {
         handleError(error)
      }
   })

   return {
      expenses,
      isLoading,
      isError,
      create: createMutation.mutateAsync,
      update: updateMutation.mutateAsync,
      remove: removeMutation.mutateAsync,
      isSaving: createMutation.isPending || updateMutation.isPending,
      isDeleting: removeMutation.isPending
   }
}