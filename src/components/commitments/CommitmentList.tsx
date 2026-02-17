import { memo, useCallback } from 'react'
import { ListLayout } from '@/components/layout/ListLayout'
import { ListItemLayout } from '@/components/layout/ListItemLayout'
import type { Commitment } from '@/types/Commitment'
import { numberToCurrency, dateBRToISO } from '@/utils/formatters'
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

function isPaidOutOfReference(commitment: Commitment) {
   if (!commitment.paymentDate || !commitment.referenceMonth) return false

   const received = new Date(dateBRToISO(commitment.paymentDate))
   const [refYear, refMonth] = commitment.referenceMonth.split('-')

   return (
      received.getFullYear() !== Number(refYear) ||
      received.getMonth() + 1 !== Number(refMonth)
   )
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
      const isCard = commitment.type === 'Cartão'
      const isOverdue = !isPaid && checkIfOverdue(commitment.dueDate)
      const variant = isPaid ? 'success' : isOverdue ? 'danger' : 'warning'
      const outOfReference = isPaidOutOfReference(commitment)

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

            <div className={`mt-1 text-xs text-muted-foreground ${isCard ? 'min-h-[1rem]' : ''}`}>
               {isCard ? (
                  <span>
                     {commitment.card}
                     {(commitment.totalInstallments ?? 1) > 1 && (
                        <> • Parcela {commitment.installment}/{commitment.totalInstallments}</>
                     )}
                  </span>
               ) : (
                  <span>{commitment.type}</span>
               )}
            </div>

            <ListItemFooterMobile
               left={
                  <div className="flex flex-col text-xs mt-1">
                     <span className={isOverdue ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}>
                        Vence em {commitment.dueDate}
                     </span>

                     <span className={`text-green-700 dark:text-green-300 ${!isPaid ? 'invisible select-none' : ''}`}>
                        {isPaid ? `Pago em ${commitment.paymentDate}` : 'Aguardando'}
                     </span>

                     {outOfReference && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                           Pago fora do mês de referência
                        </span>
                     )}
                  </div>
               }
               right={
                  <div className="flex flex-col items-end gap-1">
                     <span
                        className={`font-medium text-sm
                           ${isPaid && 'text-green-600 dark:text-green-400'}
                           ${isOverdue && 'text-red-600 dark:text-red-400'}
                           ${!isPaid && !isOverdue && 'text-amber-600 dark:text-amber-400'}
                        `}
                     >
                        {isPaid ? 'Pago' : isOverdue ? 'Vencido' : 'Em aberto'}
                     </span>
                     {outOfReference && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-medium">
                           Fora do mês
                        </span>
                     )}
                  </div>
               }
            />
         </ListItemLayout>
      )
   }, [onSelect])

   const renderDesktopItem = useCallback((commitment: Commitment) => {
      const isPaid = !!commitment.paymentDate
      const isOverdue = !isPaid && checkIfOverdue(commitment.dueDate)
      const variant = isPaid ? 'success' : isOverdue ? 'danger' : 'default'
      const outOfReference = isPaidOutOfReference(commitment)

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

               {outOfReference && (
                  <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                     Pago fora do mês de referência
                  </div>
               )}
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