import { QueryClient } from '@tanstack/react-query'
import type { Commitment } from '@/types/Commitment'
import type { FullSummary } from '@/types/FullSummary'
import type { Dashboard } from '@/types/Dashboard'
import { dateBRToISO, getMonthAndYear } from '@/utils/formatters'
import { updateDashboardAfterCreateCommitment, updateDashboardAfterEditCommitment, updateDashboardAfterDeleteCommitment } from './dashboardService'

/**
 * Updates commitment cache after creation
 */
export function updateCacheAfterCreateCommitment(
   queryClient: QueryClient,
   newCommitment: Commitment,
   month: string,
   year: string
) {
   // Update commitments list
   queryClient.setQueryData<Commitment[]>(
      ['commitments', month, year],
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

   // Update summary
   updateSummaryAfterCreateCommitment(queryClient, newCommitment, month, year)

   // Update dashboard
   updateDashboardCacheAfterCreateCommitment(queryClient, newCommitment, month, year)
}

/**
 * Updates commitment cache after editing
 */
export function updateCacheAfterEditCommitment(
   queryClient: QueryClient,
   oldCommitment: Commitment,
   newData: Partial<Commitment>,
   month: string,
   year: string
) {
   // Update commitments list
   queryClient.setQueryData<Commitment[]>(
      ['commitments', month, year],
      old =>
         old?.map(c =>
            c.rowIndex === oldCommitment.rowIndex
               ? { ...c, ...newData }
               : c
         ) ?? []
   )

   // Update summary
   updateSummaryAfterEditCommitment(queryClient, oldCommitment, newData, month, year)

   // Update dashboard
   updateDashboardCacheAfterEditCommitment(
      queryClient,
      oldCommitment,
      newData,
      month,
      year
   )
}

/**
 * Updates commitment cache after deletion.
 * Reorders rowIndex in cache to match the spreadsheet: when a row is deleted in Sheets,
 * rows below shift up, so we remove the item and decrement rowIndex for items that were below it.
 */
export function updateCacheAfterDeleteCommitment(
   queryClient: QueryClient,
   deletedCommitments: Commitment[],
   month: string,
   year: string
) {
   queryClient.setQueryData<Commitment[]>(
      ['commitments', month, year],
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

   deletedCommitments.forEach(commitment => {
      let { month: expectedMonth, year: expectedYear } = getMonthAndYear(commitment.dueDate)

      if (month == 'all') {
         expectedMonth = month;
      }

      updateSummaryAfterDeleteCommitment(
         queryClient,
         commitment,
         expectedMonth,
         expectedYear
      )

      updateDashboardCacheAfterDeleteCommitment(
         queryClient,
         commitment,
         expectedMonth,
         expectedYear
      )
   })
}

// ==================== SUMMARY ====================

function updateSummaryAfterCreateCommitment(
   queryClient: QueryClient,
   commitment: Commitment,
   month: string,
   year: string
) {
   const numericValue = Number(commitment.amount)
   const summaryData = queryClient.getQueryData<FullSummary>(['summary', month, year])

   if (summaryData) {
      const paid = commitment.paymentDate ? numericValue : 0

      queryClient.setQueryData<FullSummary>(
         ['summary', month, year],
         {
            ...summaryData,
            totalCommitments: summaryData.totalCommitments + numericValue,
            totalPaidCommitments: summaryData.totalPaidCommitments + paid,
            totalPaidCommitmentsInMonth: summaryData.totalPaidCommitmentsInMonth + paid
         }
      )
   }
}

function updateSummaryAfterEditCommitment(
   queryClient: QueryClient,
   oldCommitment: Commitment,
   newData: Partial<Commitment>,
   month: string,
   year: string
) {
   const summaryData = queryClient.getQueryData<FullSummary>(['summary', month, year])

   if (summaryData) {
      let newSummary = { ...summaryData }

      // Update value
      if (newData.amount !== undefined) {
         const oldAmountNum = Number(oldCommitment.amount)
         const newAmountNum = Number(newData.amount ?? oldCommitment.amount)
         const valueChanged = newData.amount !== undefined && newAmountNum !== oldAmountNum

         // Update total amount (regardless of payment)
         if (valueChanged) {
            const difference = newAmountNum - oldAmountNum

            newSummary.totalCommitments += difference
         }

         // Update paymentDate
         if ('paymentDate' in newData) {
            const hadPayment = !!oldCommitment.paymentDate
            const hasPayment = !!newData.paymentDate

            if (!hadPayment && hasPayment) {
               // Marking as paid now - uses current value (may have changed)
               const amountToPay = valueChanged ? newAmountNum : oldAmountNum
               newSummary.totalPaidCommitments += amountToPay
               newSummary.totalPaidCommitmentsInMonth += amountToPay
            }
            else if (hadPayment && !hasPayment) {
               // Unmarking payment - uses CURRENT value (may have changed)
               const amountToUnmark = valueChanged ? newAmountNum : oldAmountNum
               newSummary.totalPaidCommitments -= amountToUnmark
               newSummary.totalPaidCommitmentsInMonth -= amountToUnmark
            }
            else if (hadPayment && hasPayment && valueChanged) {
               // Amount changed and was paid (remains paid) - adjust by the difference
               const difference = newAmountNum - oldAmountNum
               newSummary.totalPaidCommitments += difference
               newSummary.totalPaidCommitmentsInMonth += difference
            }
         }
         else if (valueChanged && oldCommitment.paymentDate) {
            // Only the amount changed on a commitment that was already paid
            const difference = newAmountNum - oldAmountNum
            newSummary.totalPaidCommitments += difference
            newSummary.totalPaidCommitmentsInMonth += difference
         }

         queryClient.setQueryData<FullSummary>(['summary', month, year], newSummary)
      }
   }
}
function updateSummaryAfterDeleteCommitment(
   queryClient: QueryClient,
   commitment: Commitment,
   month: string,
   year: string
) {
   const numericValue = Number(commitment.amount)
   const summaryData = queryClient.getQueryData<FullSummary>(['summary', month, year])

   if (summaryData) {
      const paid = commitment.paymentDate ? numericValue : 0

      queryClient.setQueryData<FullSummary>(
         ['summary', month, year],
         {
            ...summaryData,
            totalCommitments: summaryData.totalCommitments - numericValue,
            totalPaidCommitments: summaryData.totalPaidCommitments - paid,
            totalPaidCommitmentsInMonth: summaryData.totalPaidCommitmentsInMonth - paid
         }
      )
   }
}

// ==================== DASHBOARD ====================

function updateDashboardCacheAfterCreateCommitment(
   queryClient: QueryClient,
   commitment: Commitment,
   month: string,
   year: string
) {
   const dashboardData = queryClient.getQueryData<Dashboard>(['dashboard', month, year])

   if (dashboardData) {
      const monthIndex = Number(month) - 1
      const updatedDashboard = updateDashboardAfterCreateCommitment(
         dashboardData,
         commitment,
         monthIndex
      )

      queryClient.setQueryData<Dashboard>(
         ['dashboard', month, year],
         updatedDashboard
      )
   }
}

function updateDashboardCacheAfterEditCommitment(
   queryClient: QueryClient,
   oldCommitment: Commitment,
   newData: Partial<Commitment>,
   month: string,
   year: string
) {
   const dashboardData = queryClient.getQueryData<Dashboard>(['dashboard', month, year])

   if (dashboardData) {
      const monthIndex = Number(month) - 1
      const newAmount = Number(newData.amount ?? oldCommitment.amount)
      const newPaymentDate = 'paymentDate' in newData ? newData.paymentDate : oldCommitment.paymentDate

      const updatedDashboard = updateDashboardAfterEditCommitment(
         dashboardData,
         oldCommitment,
         newAmount,
         newPaymentDate as string,
         monthIndex
      )

      queryClient.setQueryData<Dashboard>(
         ['dashboard', month, year],
         updatedDashboard
      )
   }
}

function updateDashboardCacheAfterDeleteCommitment(
   queryClient: QueryClient,
   commitment: Commitment,
   month: string,
   year: string
) {
   const dashboardData = queryClient.getQueryData<Dashboard>(['dashboard', month, year])

   if (dashboardData) {
      const monthIndex = Number(month) - 1
      const updatedDashboard = updateDashboardAfterDeleteCommitment(
         dashboardData,
         commitment,
         monthIndex
      )

      queryClient.setQueryData<Dashboard>(
         ['dashboard', month, year],
         updatedDashboard
      )
   }
}