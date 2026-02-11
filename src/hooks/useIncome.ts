import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
   listIncomes,
   createIncome,
   updateIncome,
   deleteIncome
} from '@/api/endpoints/income'
import type { Income } from '@/types/Income'
import { useApiError } from '@/hooks/useApiError'
import { getMonthAndYear } from '@/utils/formatters'

export function useIncome(month: string, year: string) {
   const queryClient = useQueryClient()
   const { handleError } = useApiError()
   const queryKey = ['incomes', month, year]

   const { data: incomes = [], isLoading, isError } = useQuery({
      queryKey,
      queryFn: () => listIncomes(month, String(year)),
      staleTime: Infinity,
      retry: 1
   })

   const createMutation = useMutation({
      mutationFn: (newIncome: Omit<Income, 'rowIndex'>) =>
         createIncome(newIncome),
      onSuccess: (newIncome: Income) => {
         const { month: regisMonth, year: regisYear } = getMonthAndYear(newIncome.expectedDate)

         queryClient.setQueryData<Income[]>(
            ['incomes', regisMonth, regisYear],
            old => old ? [...old, newIncome] : [newIncome]
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
         receivedDate?: string | null
      }) =>
         updateIncome(data),
      onSuccess: (_data, variables) => {
         queryClient.setQueryData<Income[]>(
            queryKey,
            old =>
               old?.map(r =>
                  r.rowIndex === variables.rowIndex
                     ? {
                        ...r,
                        amount: variables.amount,
                        receivedDate: variables.receivedDate
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
         deleteIncome(rowIndex, month, String(year)),
      onSuccess: (_data, rowIndex) => {
         queryClient.setQueryData<Income[]>(
            queryKey,
            old => old?.filter(r => r.rowIndex !== rowIndex) ?? []
         )
      },
      onError: (error) => {
         handleError(error)
      }
   })

   return {
      incomes,
      isLoading,
      isError,
      create: createMutation.mutateAsync,
      update: updateMutation.mutateAsync,
      remove: removeMutation.mutateAsync,
      isSaving: createMutation.isPending || updateMutation.isPending,
      isDeleting: removeMutation.isPending
   }
}