import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listIncomes, createIncome, updateIncome, deleteIncome } from '@/api/endpoints/income'
import { useApiError } from '@/hooks/useApiError'
import {
   updateCacheAfterCreateIncome,
   updateCacheAfterEditIncome,
   updateCacheAfterDeleteIncome
} from '@/services/incomeCacheService'
import { dateBRToISO, parseLocalDate, getMonthAndYearFromReference } from '@/utils/formatters'
import type { Income } from '@/types/Income'

export function useIncome(month: string, year: string) {
   const queryClient = useQueryClient()
   const { handleError } = useApiError()

   const queryKey = ['incomes', year]

   const { data: allIncomes = [], isLoading, isError } = useQuery({
      queryKey,
      queryFn: () => listIncomes('all', String(year)),
      staleTime: Infinity,
      retry: 1
   })

   const incomes =
      month === 'all'
         ? allIncomes
         : allIncomes.filter(income => {
            const { month: refMonth } =
               getMonthAndYearFromReference(income.referenceMonth)

            return String(refMonth) === String(month)
         })

   const createMutation = useMutation({
      mutationFn: (newIncome: Omit<Income, 'rowIndex'>) =>
         createIncome(newIncome),
      onSuccess: (newIncomes: Income[]) => {
         newIncomes.forEach(income => {
            const { year: yearIncome } = getMonthAndYearFromReference(income.referenceMonth)

            updateCacheAfterCreateIncome(
               queryClient,
               income,
               yearIncome
            )
         })
      },
      onError: handleError
   })

   const updateMutation = useMutation({
      mutationFn: (data: {
         rowIndex: number
         amount: number
         receivedDate?: string | null
         scope?: 'single' | 'future'
      }) => updateIncome(data),
      onSuccess: (updatedIncomes: Income[]) => {
         updatedIncomes.forEach(updatedIncome => {
            const oldIncome = queryClient
               .getQueryData<Income[]>(['incomes', year])
               ?.find(r => r.rowIndex === updatedIncome.rowIndex)

            if (!oldIncome) return

            updateCacheAfterEditIncome(
               queryClient,
               oldIncome,
               updatedIncome,
               year
            )
         })
      },
      onError: handleError
   })

   const removeMutation = useMutation({
      mutationFn: (
         args: number | { rowIndex: number; scope?: 'single' | 'future' }
      ) => {
         if (typeof args === 'number') {
            return deleteIncome(args, month, String(year))
         }

         return deleteIncome(
            args.rowIndex,
            month,
            String(year),
            args.scope
         )
      },
      onSuccess: (_data, args) => {
         const rowIndex =
            typeof args === 'number' ? args : args.rowIndex

         const scope =
            typeof args === 'number' ? 'single' : args.scope

         const baseIncome = allIncomes.find(
            r => r.rowIndex === rowIndex
         )

         if (!baseIncome) return

         if (scope === 'future') {
            const baseDate = new Date(
               parseLocalDate(dateBRToISO(baseIncome.expectedDate))
            )

            const incomesToDelete = allIncomes.filter(r =>
               r.description === baseIncome.description &&
               new Date(
                  parseLocalDate(dateBRToISO(r.expectedDate))
               ) >= baseDate
            )

            updateCacheAfterDeleteIncome(
               queryClient,
               incomesToDelete,
               year
            )
         } else {
            updateCacheAfterDeleteIncome(
               queryClient,
               [baseIncome],
               year
            )
         }
      },

      onError: handleError
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