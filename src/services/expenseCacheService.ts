import { QueryClient } from '@tanstack/react-query'
import type { Expense } from '@/types/Expense'
import type { FullSummary } from '@/types/FullSummary'
import type { Dashboard } from '@/types/Dashboard'
import { getMonthAndYear, dateBRToISO } from '@/utils/formatters'
import {
   updateDashboardAfterCreateExpense,
   updateDashboardAfterEditExpense,
   updateDashboardAfterDeleteExpense
} from './dashboardService'

/**
 * Updates expense cache after creation
 */
export function updateCacheAfterCreateExpense(
   queryClient: QueryClient,
   newExpense: Expense,
   month: string,
   year: string
) {
   queryClient.setQueryData<Expense[]>(
      ['expenses', month, year],
      old => {
         const updated = old
            ? [...old, newExpense]
            : [newExpense]

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

   updateSummaryAfterCreateExpense(
      queryClient,
      newExpense,
      month,
      year
   )

   updateDashboardCacheAfterCreateExpense(
      queryClient,
      newExpense,
      month,
      year
   )
}

/**
 * Updates expense cache after editing
 */
export function updateCacheAfterEditExpense(
   queryClient: QueryClient,
   oldExpense: Expense,
   newAmount: number,
   month: string,
   year: string
) {
   const { month: paymentMonth, year: paymentYear } = getMonthAndYear(oldExpense.paymentDate)

   // Update expenses list
   queryClient.setQueryData<Expense[]>(
      ['expenses', month, year],
      old =>
         old?.map(g =>
            g.rowIndex === oldExpense.rowIndex
               ? { ...g, amount: newAmount }
               : g
         ) ?? []
   )

   // Update summary
   updateSummaryAfterEditExpense(queryClient, oldExpense, newAmount, month, year)

   // Update dashboard
   updateDashboardCacheAfterEditExpense(
      queryClient,
      oldExpense,
      newAmount,
      paymentMonth,
      paymentYear
   )
}

/**
 * Updates expense cache after deletion.
 * Reorders rowIndex in cache to match the spreadsheet: when a row is deleted in Sheets,
 * rows below shift up, so we remove the item and decrement rowIndex for items that were below it.
 */
export function updateCacheAfterDeleteExpense(
   queryClient: QueryClient,
   deletedExpense: Expense,
   month: string,
   year: string
) {
   const { month: paymentMonth, year: paymentYear } = getMonthAndYear(deletedExpense.paymentDate)

   const deletedRowIndex = deletedExpense.rowIndex

   queryClient.setQueryData<Expense[]>(
      ['expenses', month, year],
      old => {
         if (!old) return []

         const adjusted = old
            .filter(g => g.rowIndex !== deletedRowIndex)
            .map(g => ({
               ...g,
               rowIndex:
                  g.rowIndex > deletedRowIndex
                     ? g.rowIndex - 1
                     : g.rowIndex
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

   updateSummaryAfterDeleteExpense(
      queryClient,
      deletedExpense,
      month,
      year
   )

   updateDashboardCacheAfterDeleteExpense(
      queryClient,
      deletedExpense,
      paymentMonth,
      paymentYear
   )
}

// ==================== SUMMARY ====================

function updateSummaryAfterCreateExpense(
   queryClient: QueryClient,
   expense: Expense,
   month: string,
   year: string
) {
   const numericValue = Number(expense.amount)
   const summaryData = queryClient.getQueryData<FullSummary>(['summary', month, year])

   if (summaryData) {
      queryClient.setQueryData<FullSummary>(
         ['summary', month, year],
         {
            ...summaryData,
            totalExpenses: summaryData.totalExpenses + numericValue,
            totalPaidExpensesInMonth: summaryData.totalPaidExpensesInMonth + numericValue,
            totalPaidExpenses: summaryData.totalPaidExpenses + numericValue
         }
      )
   }
}

function updateSummaryAfterEditExpense(
   queryClient: QueryClient,
   oldExpense: Expense,
   newAmount: number,
   month: string,
   year: string
) {
   const oldAmountNum = Number(oldExpense.amount)
   const newAmountNum = Number(newAmount)
   const difference = newAmountNum - oldAmountNum

   const summaryData = queryClient.getQueryData<FullSummary>(['summary', month, year])

   if (summaryData) {
      queryClient.setQueryData<FullSummary>(
         ['summary', month, year],
         {
            ...summaryData,
            totalExpenses: summaryData.totalExpenses + difference,
            totalPaidExpensesInMonth: summaryData.totalPaidExpensesInMonth + difference,
            totalPaidExpenses: summaryData.totalPaidExpenses + difference
         }
      )
   }
}

function updateSummaryAfterDeleteExpense(
   queryClient: QueryClient,
   expense: Expense,
   month: string,
   year: string
) {
   const numericValue = Number(expense.amount)
   const summaryData = queryClient.getQueryData<FullSummary>(['summary', month, year])

   if (summaryData) {
      queryClient.setQueryData<FullSummary>(
         ['summary', month, year],
         {
            ...summaryData,
            totalExpenses: summaryData.totalExpenses - numericValue,
            totalPaidExpensesInMonth: summaryData.totalPaidExpensesInMonth - numericValue,
            totalPaidExpenses: summaryData.totalPaidExpenses - numericValue
         }
      )
   }
}

// ==================== DASHBOARD ====================

function updateDashboardCacheAfterCreateExpense(
   queryClient: QueryClient,
   expense: Expense,
   month: string,
   year: string
) {
   const dashboardData = queryClient.getQueryData<Dashboard>(['dashboard', month, year])

   if (dashboardData) {
      const monthIndex = Number(month) - 1
      const updatedDashboard = updateDashboardAfterCreateExpense(
         dashboardData,
         expense,
         monthIndex
      )

      queryClient.setQueryData<Dashboard>(
         ['dashboard', month, year],
         updatedDashboard
      )
   }
}

function updateDashboardCacheAfterEditExpense(
   queryClient: QueryClient,
   oldExpense: Expense,
   newAmount: number,
   month: string,
   year: string
) {
   const dashboardData = queryClient.getQueryData<Dashboard>(['dashboard', month, year])

   if (dashboardData) {
      const monthIndex = Number(month) - 1
      const updatedDashboard = updateDashboardAfterEditExpense(
         dashboardData,
         oldExpense,
         newAmount,
         monthIndex
      )

      queryClient.setQueryData<Dashboard>(
         ['dashboard', month, year],
         updatedDashboard
      )
   }
}

function updateDashboardCacheAfterDeleteExpense(
   queryClient: QueryClient,
   expense: Expense,
   month: string,
   year: string
) {
   const dashboardData = queryClient.getQueryData<Dashboard>(['dashboard', month, year])

   if (dashboardData) {
      const monthIndex = Number(month) - 1
      const updatedDashboard = updateDashboardAfterDeleteExpense(
         dashboardData,
         expense,
         monthIndex
      )

      queryClient.setQueryData<Dashboard>(
         ['dashboard', month, year],
         updatedDashboard
      )
   }
}