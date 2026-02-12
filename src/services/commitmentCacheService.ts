import { QueryClient } from '@tanstack/react-query'
import type { Commitment } from '@/types/Commitment'
import type { FullSummary } from '@/types/FullSummary'
import type { Dashboard } from '@/types/Dashboard'
import {
   updateDashboardAfterCreateCommitment,
   updateDashboardAfterEditCommitment,
   updateDashboardAfterDeleteCommitment
} from './dashboardService'

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
      old => old ? [...old, newCommitment] : [newCommitment]
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
 * Updates commitment cache after deletion
 */
export function updateCacheAfterDeleteCommitment(
   queryClient: QueryClient,
   deletedCommitment: Commitment,
   month: string,
   year: string
) {
   // Update commitments list
   queryClient.setQueryData<Commitment[]>(
      ['commitments', month, year],
      old => old?.filter(c => c.rowIndex !== deletedCommitment.rowIndex) ?? []
   )

   // Update summary
   updateSummaryAfterDeleteCommitment(queryClient, deletedCommitment, month, year)

   // Update dashboard
   updateDashboardCacheAfterDeleteCommitment(queryClient, deletedCommitment, month, year)
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
            totalPaidCommitmentsInMonth: summaryData.totalPaidCommitmentsInMonth + paid,
            totalPaidExpenses: (summaryData as any).totalPaid + paid, // Keeping logic for totalPaid/totalPaidMonth if they exist in your type
            totalPaidExpensesInMonth: (summaryData as any).totalPaidMonth + paid
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
         const newAmountNum = Number(newData.amount)
         const difference = newAmountNum - oldAmountNum

         newSummary.totalCommitments += difference

         if (oldCommitment.paymentDate) {
            newSummary.totalPaidCommitments += difference
            newSummary.totalPaidCommitmentsInMonth += difference
               ; (newSummary as any).totalPaid += difference
               ; (newSummary as any).totalPaidMonth += difference
         }
      }

      // Update paymentDate
      if ('paymentDate' in newData) {
         const numericValue = Number(newData.amount ?? oldCommitment.amount)
         const hadPayment = !!oldCommitment.paymentDate
         const hasPayment = !!newData.paymentDate

         if (!hadPayment && hasPayment) {
            // Add payment
            newSummary.totalPaidCommitments += numericValue
            newSummary.totalPaidCommitmentsInMonth += numericValue
               ; (newSummary as any).totalPaid += numericValue
               ; (newSummary as any).totalPaidMonth += numericValue
         } else if (hadPayment && !hasPayment) {
            // Remove payment
            newSummary.totalPaidCommitments -= numericValue
            newSummary.totalPaidCommitmentsInMonth -= numericValue
               ; (newSummary as any).totalPaid -= numericValue
               ; (newSummary as any).totalPaidMonth -= numericValue
         }
      }

      queryClient.setQueryData<FullSummary>(['summary', month, year], newSummary)
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
            totalPaidCommitmentsInMonth: summaryData.totalPaidCommitmentsInMonth - paid,
            totalPaidExpenses: (summaryData as any).totalPaid - paid,
            totalPaidExpensesInMonth: (summaryData as any).totalPaidMonth - paid
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