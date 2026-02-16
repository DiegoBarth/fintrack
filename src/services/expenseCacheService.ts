import { QueryClient } from '@tanstack/react-query'
import type { Expense } from '@/types/Expense'
import type { FullSummary } from '@/types/FullSummary'
import type { Dashboard } from '@/types/Dashboard'
import { getMonthAndYear } from '@/utils/formatters'
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
   newExpense: Expense
) {
   const { month, year } = getMonthAndYear(newExpense.paymentDate)

   // Update expenses list
   queryClient.setQueryData<Expense[]>(
      ['expenses', month, year],
      old => old ? [...old, newExpense] : [newExpense]
   )

   // Update summary
   updateSummaryAfterCreateExpense(queryClient, newExpense, month, year)

   // Update dashboard
   updateDashboardCacheAfterCreateExpense(queryClient, newExpense, month, year)
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

   // Update expenses list: remove deleted and reorder rowIndex to match spreadsheet
   queryClient.setQueryData<Expense[]>(
      ['expenses', month, year],
      old => {
         if (!old) return []
         return old
            .filter(g => g.rowIndex !== deletedRowIndex)
            .map(g => ({
               ...g,
               rowIndex: g.rowIndex > deletedRowIndex ? g.rowIndex - 1 : g.rowIndex
            }))
            .sort((a, b) => a.rowIndex - b.rowIndex)
      }
   )

   // Update summary
   updateSummaryAfterDeleteExpense(queryClient, deletedExpense, month, year)

   // Update dashboard
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