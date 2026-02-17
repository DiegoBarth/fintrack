import { QueryClient } from '@tanstack/react-query'
import type { Expense } from '@/types/Expense'
import { dateBRToISO } from '@/utils/formatters'
import { invalidateSummaryAndDashboardCache } from '@/services/queryInvalidationService'

export function updateCacheAfterCreateExpense(queryClient: QueryClient, newExpense: Expense, year: string) {
   queryClient.setQueryData<Expense[]>(
      ['expenses', year],
      old => {
         const updated = old ? [...old, newExpense] : [newExpense]

         return updated.sort((a, b) => {
            const dateA = new Date(dateBRToISO(a.paymentDate))
            const dateB = new Date(dateBRToISO(b.paymentDate))

            if (dateA.getTime() !== dateB.getTime()) {
               return dateA.getTime() - dateB.getTime()
            }

            return a.description.localeCompare(b.description)
         })
      }
   )

   invalidateSummaryAndDashboardCache(queryClient)
}

export function updateCacheAfterEditExpense(queryClient: QueryClient, oldExpense: Expense, updatedExpense: Expense, year: string) {
   queryClient.setQueryData<Expense[]>(
      ['expenses', year],
      old =>
         old?.map(e =>
            e.rowIndex === oldExpense.rowIndex
               ? { ...e, ...updatedExpense }
               : e
         ) ?? []
   )

   invalidateSummaryAndDashboardCache(queryClient)
}

export function updateCacheAfterDeleteExpense(queryClient: QueryClient, deletedExpense: Expense, year: string) {
   const deletedRowIndex = deletedExpense.rowIndex

   queryClient.setQueryData<Expense[]>(
      ['expenses', year],
      old => {
         if (!old) return []

         const adjusted = old
            .filter(e => e.rowIndex !== deletedRowIndex)
            .map(e => ({
               ...e,
               rowIndex:
                  e.rowIndex > deletedRowIndex
                     ? e.rowIndex - 1
                     : e.rowIndex
            }))

         return adjusted.sort((a, b) => {
            const dateA = new Date(dateBRToISO(a.paymentDate))
            const dateB = new Date(dateBRToISO(b.paymentDate))

            if (dateA.getTime() !== dateB.getTime()) {
               return dateA.getTime() - dateB.getTime()
            }

            return a.description.localeCompare(b.description)
         })
      }
   )

   invalidateSummaryAndDashboardCache(queryClient)
}