import { QueryClient } from '@tanstack/react-query'
import type { Income } from '@/types/Income'
import type { FullSummary } from '@/types/FullSummary'
import type { Dashboard } from '@/types/Dashboard'
import { getMonthAndYear } from '@/utils/formatters'
import {
   updateDashboardAfterCreateIncome,
   updateDashboardAfterEditIncome,
   updateDashboardAfterDeleteIncome
} from './dashboardService'

/**
 * Updates income cache after creation
 */
export function updateCacheAfterCreateIncome(
   queryClient: QueryClient,
   newIncome: Income
) {
   const { month, year } = getMonthAndYear(newIncome.expectedDate)

   // Update income list
   queryClient.setQueryData<Income[]>(
      ['incomes', month, year],
      old => old ? [...old, newIncome] : [newIncome]
   )

   // Update summary
   updateSummaryAfterCreateIncome(queryClient, newIncome, month, year)

   // Update dashboard
   updateDashboardCacheAfterCreateIncome(queryClient, newIncome, month, year)
}

/**
 * Updates income cache after editing
 */
export function updateCacheAfterEditIncome(
   queryClient: QueryClient,
   oldIncome: Income,
   newData: Partial<Income>,
   month: string,
   year: string
) {
   const { month: expectedMonth, year: expectedYear } = getMonthAndYear(oldIncome.expectedDate)

   // Update income list
   queryClient.setQueryData<Income[]>(
      ['incomes', month, year],
      old =>
         old?.map(r =>
            r.rowIndex === oldIncome.rowIndex
               ? { ...r, ...newData }
               : r
         ) ?? []
   )

   // Update summary
   updateSummaryAfterEditIncome(queryClient, oldIncome, newData, month, year)

   // Update dashboard
   updateDashboardCacheAfterEditIncome(
      queryClient,
      oldIncome,
      newData,
      expectedMonth,
      expectedYear
   )
}

/**
 * Updates income cache after deletion
 */
export function updateCacheAfterDeleteIncome(
   queryClient: QueryClient,
   deletedIncome: Income,
   month: string,
   year: string
) {
   const { month: expectedMonth, year: expectedYear } = getMonthAndYear(deletedIncome.expectedDate)

   // Update income list
   queryClient.setQueryData<Income[]>(
      ['incomes', month, year],
      old => old?.filter(r => r.rowIndex !== deletedIncome.rowIndex) ?? []
   )

   // Update summary
   updateSummaryAfterDeleteIncome(queryClient, deletedIncome, month, year)

   // Update dashboard
   updateDashboardCacheAfterDeleteIncome(
      queryClient,
      deletedIncome,
      expectedMonth,
      expectedYear
   )
}

// ==================== SUMMARY ====================

function updateSummaryAfterCreateIncome(
   queryClient: QueryClient,
   income: Income,
   month: string,
   year: string
) {
   const numericValue = Number(income.amount)
   const summaryData = queryClient.getQueryData<FullSummary>(['summary', month, year])

   if (summaryData) {
      const received = income.receivedDate ? numericValue : 0

      queryClient.setQueryData<FullSummary>(
         ['summary', month, year],
         {
            ...summaryData,
            totalIncomes: summaryData.totalIncomes + numericValue,
            totalReceivedAmount: summaryData.totalReceivedAmount + received,
            totalReceivedInMonth: summaryData.totalReceivedInMonth + received
         }
      )
   }
}

function updateSummaryAfterEditIncome(
   queryClient: QueryClient,
   oldIncome: Income,
   newData: Partial<Income>,
   month: string,
   year: string
) {
   const summaryData = queryClient.getQueryData<FullSummary>(['summary', month, year])

   if (summaryData) {
      let nextSummary = { ...summaryData }

      // Update amount
      if (newData.amount !== undefined) {
         const oldAmountNum = Number(oldIncome.amount)
         const newAmountNum = Number(newData.amount)
         const difference = newAmountNum - oldAmountNum

         nextSummary.totalIncomes += difference

         if (oldIncome.receivedDate) {
            nextSummary.totalReceivedAmount += difference
            nextSummary.totalReceivedInMonth += difference
         }
      }

      // Update receivedDate
      if ('receivedDate' in newData) {
         const numericValue = Number(newData.amount ?? oldIncome.amount)
         const hadReceipt = !!oldIncome.receivedDate
         const hasReceipt = !!newData.receivedDate

         if (!hadReceipt && hasReceipt) {
            // Add receipt
            nextSummary.totalReceivedAmount += numericValue
            nextSummary.totalReceivedInMonth += numericValue
         } else if (hadReceipt && !hasReceipt) {
            // Remove receipt
            nextSummary.totalReceivedAmount -= numericValue
            nextSummary.totalReceivedInMonth -= numericValue
         }
      }

      queryClient.setQueryData<FullSummary>(['summary', month, year], nextSummary)
   }
}

function updateSummaryAfterDeleteIncome(
   queryClient: QueryClient,
   income: Income,
   month: string,
   year: string
) {
   const numericValue = Number(income.amount)
   const summaryData = queryClient.getQueryData<FullSummary>(['summary', month, year])

   if (summaryData) {
      const received = income.receivedDate ? numericValue : 0

      queryClient.setQueryData<FullSummary>(
         ['summary', month, year],
         {
            ...summaryData,
            totalIncomes: summaryData.totalIncomes - numericValue,
            totalReceivedAmount: summaryData.totalReceivedAmount - received,
            totalReceivedInMonth: summaryData.totalReceivedInMonth - received
         }
      )
   }
}

// ==================== DASHBOARD ====================

function updateDashboardCacheAfterCreateIncome(
   queryClient: QueryClient,
   income: Income,
   month: string,
   year: string
) {
   if (!income.receivedDate) return // Only updates dashboard if received

   const dashboardData = queryClient.getQueryData<Dashboard>(['dashboard', month, year])

   if (dashboardData) {
      const monthIndex = Number(month) - 1
      const numericValue = Number(income.amount)
      const updatedDashboard = updateDashboardAfterCreateIncome(
         dashboardData,
         monthIndex,
         numericValue
      )

      queryClient.setQueryData<Dashboard>(
         ['dashboard', month, year],
         updatedDashboard
      )
   }
}

function updateDashboardCacheAfterEditIncome(
   queryClient: QueryClient,
   oldIncome: Income,
   newData: Partial<Income>,
   month: string,
   year: string
) {
   const hadReceipt = !!oldIncome.receivedDate
   const hasReceipt = !!newData.receivedDate
   const oldAmountNum = Number(oldIncome.amount)
   const newAmountNum = Number(newData.amount ?? oldIncome.amount)

   let adjustmentValue = 0

   if (!hadReceipt && hasReceipt) {
      // Add receipt
      adjustmentValue = newAmountNum
   } else if (hadReceipt && !hasReceipt) {
      // Remove receipt
      adjustmentValue = -oldAmountNum
   } else if (hadReceipt && hasReceipt) {
      // Already had receipt, adjust difference
      adjustmentValue = newAmountNum - oldAmountNum
   }

   if (adjustmentValue !== 0) {
      const dashboardData = queryClient.getQueryData<Dashboard>(['dashboard', month, year])

      if (dashboardData) {
         const monthIndex = Number(month) - 1
         const updatedDashboard = updateDashboardAfterEditIncome(
            dashboardData,
            monthIndex,
            adjustmentValue
         )

         queryClient.setQueryData<Dashboard>(
            ['dashboard', month, year],
            updatedDashboard
         )
      }
   }
}

function updateDashboardCacheAfterDeleteIncome(
   queryClient: QueryClient,
   income: Income,
   month: string,
   year: string
) {
   if (!income.receivedDate) return // Only updates dashboard if it was received

   const dashboardData = queryClient.getQueryData<Dashboard>(['dashboard', month, year])

   if (dashboardData) {
      const monthIndex = Number(month) - 1
      const numericValue = Number(income.amount)
      const updatedDashboard = updateDashboardAfterDeleteIncome(
         dashboardData,
         monthIndex,
         numericValue
      )

      queryClient.setQueryData<Dashboard>(
         ['dashboard', month, year],
         updatedDashboard
      )
   }
}