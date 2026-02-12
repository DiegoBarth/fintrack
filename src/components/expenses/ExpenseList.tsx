import { memo, useCallback } from 'react'
import { ListLayout } from '@/components/layout/ListLayout'
import { ListItemLayout } from '@/components/layout/ListItemLayout'
import type { Expense } from '@/types/Expense'
import { numberToCurrency } from '@/utils/formatters'
import { ListItemHeaderMobile } from '@/components/layout/ListItemHeaderMobile'
import { ListItemFooterMobile } from '@/components/layout/ListItemFooterMobile'
import { ListItemRowDesktop } from '@/components/layout/ListItemRowDesktop'
import { ListColDescription } from '@/components/layout/ListColDescription'
import { ListColMuted } from '@/components/layout/ListColMuted'
import { ListColStatus } from '@/components/layout/ListColStatus'
import { ListColValue } from '@/components/layout/ListColValue'

interface Props {
   expenses: Expense[]
   onSelect: (expense: Expense) => void
}

/**
 * Expense list with performance optimizations.
 * * Applied Optimizations:
 * - React.memo: Prevents unnecessary re-renders when props remain unchanged.
 * - useCallback: Memoizes render functions to avoid recreation.
 * - keyExtractor: Uses stable rowIndex to optimize reconciliation.
 */
export const ExpenseList = memo(function ExpenseList({ expenses, onSelect }: Props) {
   // Memoizes mobile render function to prevent recreation on every render
   const renderMobileItem = useCallback((expense: Expense) => (
      <ListItemLayout
         onClick={() => onSelect(expense)}
         className="p-3"
      >
         <ListItemHeaderMobile
            title={expense.description}
            right={
               <span className="text-red-600 dark:text-red-400">
                  {numberToCurrency(expense.amount)}
               </span>
            }
         />

         <ListItemFooterMobile
            left={<span className="text-green-700 dark:text-green-300">Pago em {expense.paymentDate} • {expense.category}</span>}
            right={
               <span className="text-green-600 font-medium">
                  Pago
               </span>
            }
         />
      </ListItemLayout>
   ), [onSelect])

   // Memoizes desktop render function to prevent recreation on every render
   const renderDesktopItem = useCallback((expense: Expense) => (
      <ListItemRowDesktop
         onClick={() => onSelect(expense)}
         cols={10}
      >
         <ListColDescription>
            {expense.description}
         </ListColDescription>
         <ListColMuted span={2}>
            {expense.category ?? '-'}
         </ListColMuted>

         <ListColMuted span={3}>
            <span className="text-green-700 dark:text-green-300">Pago em {expense.paymentDate}</span>
         </ListColMuted>

         <ListColValue>
            <span className="text-red-600 dark:text-red-400 font-semibold">
               {numberToCurrency(expense.amount)}
            </span>
         </ListColValue>

         <ListColStatus>
            <span className="text-green-600 dark:text-green-400 font-semibold">
               Pago
            </span>
         </ListColStatus>
      </ListItemRowDesktop>
   ), [onSelect])

   return (
      <ListLayout
         itens={expenses}
         emptyText="Nenhum gasto cadastrado"
         keyExtractor={(expense) => expense.rowIndex}
         renderMobileItem={renderMobileItem}
         renderDesktopItem={renderDesktopItem}
      />
   )
})