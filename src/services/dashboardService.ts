import type { Dashboard } from '@/types/Dashboard'
import type { Commitment } from '@/types/Commitment'
import type { Expense } from '@/types/Expense'
import type { Income } from '@/types/Income'
import {
   updateMonthlyBalance,
   addCategory,
   updateCategory,
   removeCategory,
   updateCard,
   addCardPurchase,
   removeCardPurchase
} from '@/utils/dashboardUpdater'

/**
 * Centralized service to update the Dashboard
 * * Responsibilities:
 * - Orchestrate dashboard updates after CRUD operations
 * - Keep business logic separate from hooks
 * - Ensure consistency between different transaction types
 */

// ============================================
// COMMITMENTS
// ============================================

/**
 * Updates dashboard after creating a commitment
 */
export function updateDashboardAfterCreateCommitment(
   dashboard: Dashboard,
   commitment: Commitment,
   monthIndex: number
): Dashboard {
   const numericValue = Number(commitment.amount)
   let updatedDashboard = dashboard

   // Update categories
   updatedDashboard = addCategory(updatedDashboard, commitment.category, numericValue)

   // Update card if it's a card purchase
   if (commitment.type === 'Cartão' && commitment.card) {
      const valorTotal = numericValue * (commitment.totalInstallments || 1)
      updatedDashboard = addCardPurchase(
         updatedDashboard,
         commitment.card,
         numericValue,
         valorTotal
      )
   }

   return updatedDashboard
}

/**
 * Updates dashboard after editing a commitment
 */
export function updateDashboardAfterEditCommitment(
   dashboard: Dashboard,
   oldCommitment: Commitment,
   newValue: number,
   newPaymentDate: string | undefined,
   monthIndex: number
): Dashboard {
   const oldValueNum = Number(oldCommitment.amount)
   const newValueNum = Number(newValue)
   const difference = newValueNum - oldValueNum

   const hadPaymentDate = !!oldCommitment.paymentDate
   const hasPaymentDate = !!newPaymentDate

   let updatedDashboard = dashboard
   let balanceAdjustment = 0

   // Calculate balance adjustment
   if (hadPaymentDate && !hasPaymentDate) {
      balanceAdjustment = oldValueNum // Removed payment - return to balance
   } else if (!hadPaymentDate && hasPaymentDate) {
      balanceAdjustment = -newValueNum // Added payment - subtract from balance
   } else if (hadPaymentDate && hasPaymentDate) {
      balanceAdjustment = -difference // Already had payment - adjust difference
   }

   // Update balance and categories
   updatedDashboard = updateMonthlyBalance(updatedDashboard, monthIndex, balanceAdjustment)
   updatedDashboard = updateCategory(updatedDashboard, oldCommitment.category, difference)

   // Update card if it's a card purchase
   if (oldCommitment.type === 'Cartão' && oldCommitment.card) {
      let limitAdjustment = 0

      // Adjust limit based on payment status
      if (hadPaymentDate && !hasPaymentDate) {
         limitAdjustment = -oldValueNum
      } else if (!hadPaymentDate && hasPaymentDate) {
         limitAdjustment = oldValueNum
      } else if (hadPaymentDate && hasPaymentDate) {
         limitAdjustment = difference
      } else if (!hadPaymentDate && !hasPaymentDate) {
         const totalDifference = newValueNum - oldValueNum
         limitAdjustment = -totalDifference
      }

      updatedDashboard = updateCard(
         updatedDashboard,
         oldCommitment.card,
         difference, // statement adjustment
         limitAdjustment // limit adjustment
      )
   }

   return updatedDashboard
}

/**
 * Updates dashboard after deleting a commitment
 */
export function updateDashboardAfterDeleteCommitment(
   dashboard: Dashboard,
   commitment: Commitment,
   monthIndex: number
): Dashboard {
   const numericValue = Number(commitment.amount)
   let updatedDashboard = dashboard

   // Only update balance if it was paid
   if (commitment.paymentDate) {
      updatedDashboard = updateMonthlyBalance(updatedDashboard, monthIndex, numericValue)
   }

   // Update topCategories - always subtract the value
   updatedDashboard = removeCategory(updatedDashboard, commitment.category, numericValue)

   // Update card if it's a card purchase
   if (commitment.type === 'Cartão' && commitment.card) {
      updatedDashboard = removeCardPurchase(
         updatedDashboard,
         commitment.card,
         numericValue,
         !!commitment.paymentDate
      )
   }

   return updatedDashboard
}

// ============================================
// EXPENSES
// ============================================

/**
 * Updates dashboard after creating an expense
 */
export function updateDashboardAfterCreateExpense(
   dashboard: Dashboard,
   expense: Expense,
   monthIndex: number
): Dashboard {
   const numericValue = Number(expense.amount)
   let updatedDashboard = dashboard

   // Update balance (expenses decrease balance, hence negative value)
   updatedDashboard = updateMonthlyBalance(updatedDashboard, monthIndex, -numericValue)

   // Update topCategories
   updatedDashboard = addCategory(updatedDashboard, expense.category, numericValue)

   return updatedDashboard
}

/**
 * Updates dashboard after editing an expense
 */
export function updateDashboardAfterEditExpense(
   dashboard: Dashboard,
   oldExpense: Expense,
   newValue: number,
   monthIndex: number
): Dashboard {
   const oldValueNum = Number(oldExpense.amount)
   const newValueNum = Number(newValue)
   const difference = newValueNum - oldValueNum

   let updatedDashboard = dashboard

   // Update balance (expenses decrease balance, hence negative difference)
   updatedDashboard = updateMonthlyBalance(updatedDashboard, monthIndex, -difference)

   // Update topCategories with value difference
   updatedDashboard = updateCategory(updatedDashboard, oldExpense.category, difference)

   return updatedDashboard
}

/**
 * Updates dashboard after deleting an expense
 */
export function updateDashboardAfterDeleteExpense(
   dashboard: Dashboard,
   expense: Expense,
   monthIndex: number
): Dashboard {
   const numericValue = Number(expense.amount)
   let updatedDashboard = dashboard

   // Update balance (deleting an expense increases balance)
   updatedDashboard = updateMonthlyBalance(updatedDashboard, monthIndex, numericValue)

   // Update topCategories - subtract the value
   updatedDashboard = removeCategory(updatedDashboard, expense.category, numericValue)

   return updatedDashboard
}

// ============================================
// INCOMES
// ============================================

/**
 * Updates dashboard after creating an income (if received)
 */
export function updateDashboardAfterCreateIncome(
   dashboard: Dashboard,
   monthIndex: number,
   value: number
): Dashboard {
   return updateMonthlyBalance(dashboard, monthIndex, value)
}

/**
 * Updates dashboard after editing an income
 */
export function updateDashboardAfterEditIncome(
   dashboard: Dashboard,
   monthIndex: number,
   adjustment: number
): Dashboard {
   return updateMonthlyBalance(dashboard, monthIndex, adjustment)
}

/**
 * Updates dashboard after deleting an income (if it was received)
 */
export function updateDashboardAfterDeleteIncome(
   dashboard: Dashboard,
   monthIndex: number,
   value: number
): Dashboard {
   return updateMonthlyBalance(dashboard, monthIndex, -value)
}