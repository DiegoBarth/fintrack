import { QueryClient } from '@tanstack/react-query'
import type { Commitment } from '@/types/Commitment'
import { commitmentsQueryKey } from './commitmentQuery'
import { dateBRToISO } from '@/utils/formatters'
import { invalidateSummaryAndDashboardCache } from '@/services/queryInvalidationService'

export function updateCacheAfterCreateCommitment(queryClient: QueryClient, newCommitment: Commitment, year: string) {
   queryClient.setQueryData<Commitment[]>(
      commitmentsQueryKey(year),
      old => {
         const updated = old ? [...old, newCommitment] : [newCommitment]

         return updated.sort((a, b) => {
            const dateA = new Date(dateBRToISO(a.dueDate))
            const dateB = new Date(dateBRToISO(b.dueDate))

            if (dateA.getTime() !== dateB.getTime()) {
               return dateA.getTime() - dateB.getTime()
            }

            return a.description.localeCompare(b.description)
         })
      }
   )

   invalidateSummaryAndDashboardCache(queryClient)
}

export function updateCacheAfterEditCommitment(queryClient: QueryClient, oldCommitment: Commitment, newData: Partial<Commitment>, year: string) {
   queryClient.setQueryData<Commitment[]>(
      commitmentsQueryKey(year),
      old =>
         old?.map(c =>
            c.rowIndex === oldCommitment.rowIndex
               ? { ...c, ...newData }
               : c
         ) ?? []
   )

   invalidateSummaryAndDashboardCache(queryClient)
}

export function updateCacheAfterDeleteCommitment(queryClient: QueryClient, deletedCommitments: Commitment[], year: string) {
   queryClient.setQueryData<Commitment[]>(
      commitmentsQueryKey(year),
      old => {
         if (!old) return []

         const deletedSet = new Set(
            deletedCommitments.map(c => c.rowIndex)
         )

         const remaining = old.filter(
            c => !deletedSet.has(c.rowIndex)
         )

         const adjusted = remaining.map(c => {
            const shift = deletedCommitments.filter(
               d => d.rowIndex < c.rowIndex
            ).length

            return {
               ...c,
               rowIndex: c.rowIndex - shift
            }
         })

         return adjusted.sort((a, b) => {
            const dateA = new Date(dateBRToISO(a.dueDate))
            const dateB = new Date(dateBRToISO(b.dueDate))

            if (dateA.getTime() !== dateB.getTime()) {
               return dateA.getTime() - dateB.getTime()
            }

            return a.description.localeCompare(b.description)
         })
      }
   )

   invalidateSummaryAndDashboardCache(queryClient)
}