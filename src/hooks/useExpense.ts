import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
   listExpenses,
   createExpense,
   updateExpense,
   deleteExpense
} from '@/api/endpoints/expense'
import type { Expense } from '@/types/Expense'
import { useApiError } from '@/hooks/useApiError'
import { getMonthAndYear } from '@/utils/formatters'

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
      mutationFn: (newExpense: Omit<Expense, 'rowIndex'>) =>
         createExpense(newExpense),
      onSuccess: (newExpense: Expense) => {
         const { month: regisMonth, year: regisYear } = getMonthAndYear(newExpense.paymentDate)

         queryClient.setQueryData<Expense[]>(
            ['expenses', regisMonth, regisYear],
            old => old ? [...old, newExpense] : [newExpense]
         )
      },
      onError: (error) => {
         handleError(error)
      }
   })

   const updateMutation = useMutation({
      mutationFn: (data: {
         rowIndex: number
         amount: number
      }) =>
         updateExpense(data),
      onSuccess: (_data, variables) => {
         queryClient.setQueryData<Expense[]>(
            queryKey,
            old =>
               old?.map(r =>
                  r.rowIndex === variables.rowIndex
                     ? {
                        ...r,
                        amount: variables.amount
                     }
                     : r
               ) ?? []
         )
      },
      onError: (error) => {
         handleError(error)
      }
   })

   const removeMutation = useMutation({
      mutationFn: (rowIndex: number) =>
         deleteExpense(rowIndex),
      onSuccess: (_data, rowIndex) => {
         queryClient.setQueryData<Expense[]>(
            queryKey,
            old => old?.filter(r => r.rowIndex !== rowIndex) ?? []
         )
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