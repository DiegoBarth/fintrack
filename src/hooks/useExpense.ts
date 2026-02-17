import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listExpenses, createExpense, updateExpense, deleteExpense } from '@/api/endpoints/expense'
import { useApiError } from '@/hooks/useApiError'
import { getMonthAndYearFromReference } from '@/utils/formatters'
import {
   updateCacheAfterCreateExpense,
   updateCacheAfterEditExpense,
   updateCacheAfterDeleteExpense
} from '@/services/expenseCacheService'
import type { Expense } from '@/types/Expense'

export function useExpense(month: string, year: string) {
   const queryClient = useQueryClient()
   const { handleError } = useApiError()

   const queryKey = ['expenses', year]

   const { data: allExpenses = [], isLoading, isError } = useQuery({
      queryKey,
      queryFn: () => listExpenses('all', String(year)),
      staleTime: Infinity,
      retry: 1
   })

   const expenses =
      month === 'all'
         ? allExpenses
         : allExpenses.filter(expense => {
            const { month: refMonth } =
               getMonthAndYearFromReference(expense.paymentDate)

            return String(refMonth) === String(month)
         })

   const createMutation = useMutation({
      mutationFn: (newExpense: Omit<Expense, 'rowIndex'>) =>
         createExpense(newExpense),
      onSuccess: (newExpense: Expense) => {
         updateCacheAfterCreateExpense(
            queryClient,
            newExpense,
            year
         )
      },
      onError: handleError
   })

   const updateMutation = useMutation({
      mutationFn: (data: { rowIndex: number; amount: number }) =>
         updateExpense(data),
      onSuccess: (updatedExpense: Expense) => {
         const oldExpense = queryClient
            .getQueryData<Expense[]>(['expenses', year])
            ?.find(e => e.rowIndex === updatedExpense.rowIndex)

         if (oldExpense) {
            updateCacheAfterEditExpense(
               queryClient,
               oldExpense,
               updatedExpense,
               year
            )
         }
      },
      onError: handleError
   })

   const removeMutation = useMutation({
      mutationFn: (rowIndex: number) => deleteExpense(rowIndex),
      onSuccess: (_data, rowIndex) => {
         const deletedExpense = allExpenses.find(
            e => e.rowIndex === rowIndex
         )

         if (deletedExpense) {
            updateCacheAfterDeleteExpense(
               queryClient,
               deletedExpense,
               year
            )
         }
      },
      onError: handleError
   })

   return {
      expenses,
      isLoading,
      isError,
      create: createMutation.mutateAsync,
      update: updateMutation.mutateAsync,
      remove: removeMutation.mutateAsync,
      isSaving:
         createMutation.isPending || updateMutation.isPending,
      isDeleting: removeMutation.isPending
   }
}