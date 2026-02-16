import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listExpenses, createExpense, updateExpense, deleteExpense } from '@/api/endpoints/expense'
import { useApiError } from '@/hooks/useApiError'
import { getMonthAndYear } from '@/utils/formatters'
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
         let { month: regisMonth, year: regisYear } = getMonthAndYear(newExpense.paymentDate)

         if (month == 'all') {
            regisMonth = month;
         }

         updateCacheAfterCreateExpense(queryClient, newExpense, regisMonth, regisYear)
      },
      onError: (error) => {
         handleError(error)
      }
   })

   const updateMutation = useMutation({
      mutationFn: (data: { rowIndex: number, amount: number }) => updateExpense(data),
      onSuccess: (updatedExpense: Expense) => {
         let { month: regisMonth, year: regisYear } = getMonthAndYear(updatedExpense.paymentDate)

         if (month == 'all') {
            regisMonth = month;
         }

         const oldExpense = queryClient
            .getQueryData<Expense[]>(['expenses', regisMonth, regisYear])
            ?.find(r => r.rowIndex === updatedExpense.rowIndex)

         if (oldExpense) {
            updateCacheAfterEditExpense(queryClient, oldExpense, Number(updatedExpense.amount), month, year)
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