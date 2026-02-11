import type { Dashboard } from '@/types/Dashboard'

/**
 * Updates the monthly balance of the dashboard
 * * @param dashboard - Current dashboard
 * @param monthIndex - Month index (0-11)
 * @param adjustment - Value to be adjusted (positive or negative)
 * @returns Dashboard with updated balance
 */
export function updateMonthlyBalance(
   dashboard: Dashboard,
   monthIndex: number,
   adjustment: number
): Dashboard {
   const updatedBalance = dashboard.monthlyBalance.map((item, index) =>
      index === monthIndex
         ? { ...item, balance: item.balance + adjustment }
         : item
   )

   return {
      ...dashboard,
      monthlyBalance: updatedBalance
   }
}

/**
 * Adds or updates a category in topCategories
 * * @param dashboard - Current dashboard
 * @param category - Category name
 * @param value - Value to be added
 * @returns Dashboard with updated categories
 */
export function addCategory(
   dashboard: Dashboard,
   category: string,
   value: number
): Dashboard {
   const updatedTopCategories = [...dashboard.topCategories]
   const categoryIndex = updatedTopCategories.findIndex(c => c.category === category)

   if (categoryIndex >= 0) {
      // Category already exists, add the value
      updatedTopCategories[categoryIndex] = {
         ...updatedTopCategories[categoryIndex],
         total: updatedTopCategories[categoryIndex].total + value
      }
   } else {
      // Category does not exist, create new entry
      updatedTopCategories.push({
         category,
         total: value
      })
   }

   return {
      ...dashboard,
      topCategories: updatedTopCategories
   }
}

/**
 * Updates the value of an existing category
 * * @param dashboard - Current dashboard
 * @param category - Category name
 * @param difference - Value difference (positive or negative)
 * @returns Dashboard with updated categories
 */
export function updateCategory(
   dashboard: Dashboard,
   category: string,
   difference: number
): Dashboard {
   const updatedTopCategories = dashboard.topCategories.map(cat => {
      if (cat.category === category) {
         return {
            ...cat,
            total: cat.total + difference
         }
      }
      return cat
   })

   return {
      ...dashboard,
      topCategories: updatedTopCategories
   }
}

/**
 * Removes value from a category and deletes it if total <= 0
 * * @param dashboard - Current dashboard
 * @param category - Category name
 * @param value - Value to be removed
 * @returns Dashboard with updated categories
 */
export function removeCategory(
   dashboard: Dashboard,
   category: string,
   value: number
): Dashboard {
   const updatedTopCategories = dashboard.topCategories
      .map(cat => {
         if (cat.category === category) {
            return {
               ...cat,
               total: cat.total - value
            }
         }
         return cat
      })
      .filter(cat => cat.total > 0) // Remove category if total reached zero or less

   return {
      ...dashboard,
      topCategories: updatedTopCategories
   }
}

/**
 * Updates credit card in the dashboard
 * * @param dashboard - Current dashboard
 * @param cardName - Name of the card
 * @param statementAdjustment - Value to adjust in the statement (positive or negative)
 * @param limitAdjustment - Value to adjust in the available limit (positive or negative)
 * @returns Dashboard with updated card
 */
export function updateCard(
   dashboard: Dashboard,
   cardName: string,
   statementAdjustment: number,
   limitAdjustment: number = 0
): Dashboard {
   const updatedCards = dashboard.cardsSummary.map(card => {
      if (card.cardName === cardName) {
         const newStatementTotal = card.statementTotal + statementAdjustment
         const newAvailableLimit = card.availableLimit + limitAdjustment
         const newPercentage = Math.round(
            ((card.totalLimit - newAvailableLimit) / card.totalLimit) * 100
         )

         return {
            ...card,
            statementTotal: newStatementTotal,
            availableLimit: newAvailableLimit,
            usedPercentage: newPercentage
         }
      }
      return card
   })

   return {
      ...dashboard,
      cardsSummary: updatedCards
   }
}

/**
 * Updates card when an installment purchase is created
 * Adjusts the statement by the installment and the limit by the total value
 * * @param dashboard - Current dashboard
 * @param cardName - Name of the card
 * @param installmentValue - Monthly installment value
 * @param totalValue - Total purchase value (installment * quantity)
 * @returns Dashboard with updated card
 */
export function addCardPurchase(
   dashboard: Dashboard,
   cardName: string,
   installmentValue: number,
   totalValue: number
): Dashboard {
   const updatedCards = dashboard.cardsSummary.map(card => {
      if (card.cardName === cardName) {
         const newStatementTotal = card.statementTotal + installmentValue
         const newAvailableLimit = card.availableLimit - totalValue
         const newPercentage = Math.round(
            ((card.totalLimit - newAvailableLimit) / card.totalLimit) * 100
         )

         return {
            ...card,
            statementTotal: newStatementTotal,
            availableLimit: newAvailableLimit,
            usedPercentage: newPercentage
         }
      }
      return card
   })

   return {
      ...dashboard,
      cardsSummary: updatedCards
   }
}

/**
 * Removes card purchase from the dashboard
 * * @param dashboard - Current dashboard
 * @param cardName - Name of the card
 * @param installmentValue - Installment value
 * @param alreadyPaid - Whether the installment was already paid
 * @returns Dashboard with updated card
 */
export function removeCardPurchase(
   dashboard: Dashboard,
   cardName: string,
   installmentValue: number,
   alreadyPaid: boolean
): Dashboard {
   const updatedCards = dashboard.cardsSummary.map(card => {
      if (card.cardName === cardName) {
         const newStatementTotal = card.statementTotal - installmentValue
         let newAvailableLimit = card.availableLimit

         // Limit is only affected if it wasn't paid
         if (!alreadyPaid) {
            newAvailableLimit += installmentValue
         }

         const newPercentage = Math.round(
            ((card.totalLimit - newAvailableLimit) / card.totalLimit) * 100
         )

         return {
            ...card,
            statementTotal: newStatementTotal,
            availableLimit: newAvailableLimit,
            usedPercentage: newPercentage
         }
      }
      return card
   })

   return {
      ...dashboard,
      cardsSummary: updatedCards
   }
}