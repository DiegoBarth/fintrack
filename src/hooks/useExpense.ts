import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
   listExpenses,
   createExpense,
   updateExpense,
   deleteExpense
} from '@/api/endpoints/expenses'
import type { Expense } from '@/types/Expense'
import { useLocation } from 'react-router-dom'

export function useExpenses(month: string, year: string) {
   const queryClient = useQueryClient()
   const queryKey = ['expenses', month, year]

   const location = useLocation();
   const enabled = ['/expenses', '/'].includes(location.pathname)

   const { data: expenses = [], isLoading, isError } = useQuery({
      queryKey,
      queryFn: () => listExpenses(month, String(year)),
      staleTime: Infinity,
      enabled
   })

   const createMutation = useMutation({
      mutationFn: (newExpense: Omit<Expense, 'rowIndex'>) =>
         createExpense(newExpense),
      onSuccess: (newExpense: Expense) => {
         queryClient.setQueryData<Expense[]>(
            queryKey,
            old => old ? [...old, newExpense] : [newExpense]
         )
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

         queryClient.invalidateQueries({
            queryKey: ['summary', month, year],
         })
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