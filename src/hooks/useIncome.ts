import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listIncomes, createIncome, updateIncome, deleteIncome } from '@/api/endpoints/income'
import { useApiError } from '@/hooks/useApiError'
import { updateCacheAfterCreateIncome, updateCacheAfterEditIncome, updateCacheAfterDeleteIncome } from '@/services/incomeCacheService'
import type { Income } from '@/types/Income'

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
      mutationFn: (newIncome: Omit<Income, 'rowIndex'>) => createIncome(newIncome),
      onSuccess: (newIncome: Income) => {
         updateCacheAfterCreateIncome(queryClient, newIncome)
      },
      onError: (error) => {
         handleError(error)
      }
   })

   const updateMutation = useMutation({
      mutationFn: (data: { rowIndex: number, amount: number, receivedDate?: string | null }) => updateIncome(data),
      onSuccess: (_data, variables) => {
         const oldIncome = incomes.find(r => r.rowIndex === variables.rowIndex)

         if (oldIncome) {
            updateCacheAfterEditIncome(queryClient, oldIncome, variables, month, year)
         }
      },
      onError: (error) => {
         handleError(error)
      }
   })

   const removeMutation = useMutation({
      mutationFn: (rowIndex: number) => deleteIncome(rowIndex, month, String(year)),
      onSuccess: (_data, rowIndex) => {
         const deletedIncome = incomes.find(r => r.rowIndex === rowIndex)

         if (deletedIncome) {
            updateCacheAfterDeleteIncome(queryClient, deletedIncome, month, year)
         }
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