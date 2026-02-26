import { QueryClient } from '@tanstack/react-query'
import { dateBRToISO } from '@/utils/formatters'
import { invalidateSummaryAndDashboardCache } from '@/services/queryInvalidationService'
import { incomesQueryKey } from '@/services/incomeQuery'
import type { Income } from '@/types/Income'

export function updateCacheAfterCreateIncome(queryClient: QueryClient, newIncome: Income, year: string) {
   queryClient.setQueryData<Income[]>(
      incomesQueryKey(year),
      old => {
         const updated = old ? [...old, newIncome] : [newIncome]

         return updated.sort((a, b) => {
            const dateA = new Date(dateBRToISO(a.expectedDate))
            const dateB = new Date(dateBRToISO(b.expectedDate))

            if (dateA.getTime() !== dateB.getTime()) {
               return dateA.getTime() - dateB.getTime()
            }

            return a.description.localeCompare(b.description)
         })
      }
   )

   invalidateSummaryAndDashboardCache(queryClient);
}

export function updateCacheAfterEditIncome(queryClient: QueryClient, oldIncome: Income, newData: Partial<Income>, year: string) {
   queryClient.setQueryData<Income[]>(
      incomesQueryKey(year),
      old =>
         old?.map(r =>
            r.rowIndex === oldIncome.rowIndex
               ? { ...r, ...newData }
               : r
         ) ?? []
   )

   invalidateSummaryAndDashboardCache(queryClient);
}

export function updateCacheAfterDeleteIncome(queryClient: QueryClient, deletedIncomes: Income[], year: string) {
   queryClient.setQueryData<Income[]>(
      incomesQueryKey(year),
      old => {
         if (!old) return []

         const deletedSet = new Set(
            deletedIncomes.map(i => i.rowIndex)
         )

         const remaining = old.filter(
            r => !deletedSet.has(r.rowIndex)
         )

         const adjusted = remaining.map(r => {
            const shift = deletedIncomes.filter(
               d => d.rowIndex < r.rowIndex
            ).length

            return {
               ...r,
               rowIndex: r.rowIndex - shift
            }
         })

         return adjusted.sort((a, b) => {
            const dateA = new Date(dateBRToISO(a.expectedDate))
            const dateB = new Date(dateBRToISO(b.expectedDate))

            if (dateA.getTime() !== dateB.getTime()) {
               return dateA.getTime() - dateB.getTime()
            }

            return a.description.localeCompare(b.description)
         })
      }
   )

   invalidateSummaryAndDashboardCache(queryClient);
}