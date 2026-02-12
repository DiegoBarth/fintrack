import { memo, useCallback } from 'react'
import { ListLayout } from '@/components/layout/ListLayout'
import { ListItemLayout } from '@/components/layout/ListItemLayout'
import type { Commitment } from '@/types/Commitment'
import { numberToCurrency } from '@/utils/formatters'
import { ListItemHeaderMobile } from '@/components/layout/ListItemHeaderMobile'
import { ListItemFooterMobile } from '@/components/layout/ListItemFooterMobile'
import { ListItemRowDesktop } from '@/components/layout/ListItemRowDesktop'
import { ListColDescription } from '@/components/layout/ListColDescription'
import { ListColMuted } from '@/components/layout/ListColMuted'
import { ListColValue } from '@/components/layout/ListColValue'
import { ListColStatus } from '@/components/layout/ListColStatus'

interface Props {
   commitments: Commitment[];
   onSelect: (commitment: Commitment) => void;
}

/**
 * Checks if a date is in the past compared to today.
 */
function checkIfOverdue(dueDate: string) {
   const [d, m, y] = dueDate.split('/').map(Number);

   const expiration = new Date(y, m - 1, d);
   expiration.setHours(0, 0, 0, 0);

   const today = new Date();
   today.setHours(0, 0, 0, 0);

   return expiration < today;
}

/**
 * Commitment list with performance optimizations.
 * * Applied Optimizations:
 * - React.memo: Prevents re-renders when props remain unchanged.
 * - useCallback: Memoizes mobile/desktop render functions.
 * - External pure function: 'isOverdue' is defined outside the component to prevent recreation.
 */
export const CommitmentList = memo(function CommitmentList({ commitments, onSelect }: Props) {
   const renderMobileItem = useCallback((commitment: Commitment) => {
      const isPaid = !!commitment.paymentDate
      const isCard = commitment.type === 'Credit_card'
      const isOverdue = !isPaid && checkIfOverdue(commitment.dueDate)
      const variant = isPaid ? 'success' : isOverdue ? 'danger' : 'warning'

      return (
         <ListItemLayout
            onClick={() => onSelect(commitment)}
            variant={variant}
            className="p-3"
         >
            <ListItemHeaderMobile
               title={commitment.description}
               right={numberToCurrency(commitment.amount)}
            />

            {isCard && (
               <div className="mt-1 text-xs text-muted-foreground">
                  {commitment.card}
                  {(commitment.totalInstallments ?? 1) > 1 && (
                     <> • Parcela {commitment.installment}/{commitment.totalInstallments}</>
                  )}
               </div>
            )}

            <ListItemFooterMobile
               left={
                  <span className={isPaid ? 'text-green-700 dark:text-green-300' : isOverdue ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}>
                     {isPaid ? `Pago em ${commitment.paymentDate}` : `Vence em ${commitment.dueDate}`}
                  </span>
               }
               right={
                  <span
                     className={`font-medium
                        ${isPaid && 'text-green-600 dark:text-green-400'}
                        ${isOverdue && 'text-red-600 dark:text-red-400'}
                        ${!isPaid && !isOverdue && 'text-amber-600 dark:text-amber-400'}
                     `}
                  >
                     {isPaid ? 'Pago' : isOverdue ? 'Vencido' : 'Em aberto'}
                  </span>
               }
            />
         </ListItemLayout>
      )
   }, [onSelect])

   const renderDesktopItem = useCallback((commitment: Commitment) => {
      const isPaid = !!commitment.paymentDate
      const isOverdue = !isPaid && checkIfOverdue(commitment.dueDate)
      const variant = isPaid ? 'success' : isOverdue ? 'danger' : 'default'

      return (
         <ListItemRowDesktop
            onClick={() => onSelect(commitment)}
            variant={variant}
         >
            <ListColDescription>
               {commitment.description}
            </ListColDescription>

            <ListColMuted span={2}>
               {commitment.type}
            </ListColMuted>

            <ListColMuted span={2}>
               <span className={isPaid ? 'text-green-700 dark:text-green-300' : isOverdue ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}>
                  {isPaid ? `Pago em ${commitment.paymentDate}` : `Vence em ${commitment.dueDate}`}
               </span>
            </ListColMuted>

            <ListColValue>
               {numberToCurrency(commitment.amount)}
            </ListColValue>

            <ListColStatus>
               <span
                  className={`font-semibold
                     ${isPaid && 'text-green-600 dark:text-green-400'}
                     ${isOverdue && 'text-red-600 dark:text-red-400'}
                     ${!isPaid && !isOverdue && 'text-amber-600 dark:text-amber-400'}
                  `}
               >
                  {isPaid ? 'Pago' : isOverdue ? 'Vencido' : 'Aberto'}
               </span>
            </ListColStatus>
         </ListItemRowDesktop>
      )
   }, [onSelect])

   return (
      <ListLayout
         itens={commitments}
         emptyText="Nenhum compromisso cadastrado"
         keyExtractor={(commitment) => commitment.rowIndex}
         renderMobileItem={renderMobileItem}
         renderDesktopItem={renderDesktopItem}
      />
   )
})