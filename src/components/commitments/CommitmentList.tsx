import { ListLayout } from '@/components/layout/ListLayout'
import { ListItemLayout } from '@/components/layout/ListItemLayout'
import type { Commitment } from '@/types/Commitment'
import { formatDateBR, numberToCurrency } from '@/utils/formatters'
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

export function CommitmentList({ commitments, onSelect }: Props) {
   return (
      <ListLayout
         itens={commitments}
         emptyText="Nenhum compromisso cadastrado"
         keyExtractor={(commitment) => commitment.rowIndex}

         renderMobileItem={(commitment) => {
            const isPaid = !!commitment.paymentDate
            const isCard = commitment.type === 'Credit_card'
            const isOverdue = !isPaid && checkIfOverdue(commitment.dueDate)

            const variant =
               isPaid ? 'success' :
                  isOverdue ? 'danger' :
                     'warning'

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
                        isPaid ? `Pago em ${commitment.paymentDate}` : `Vence em ${commitment.dueDate}`
                     }
                     right={
                        <span
                           className={`
                              ${isPaid && 'text-green-600'}
                              ${isOverdue && 'text-red-600'}
                              ${!isPaid && !isOverdue && 'text-amber-500'}
                           `}
                        >
                           {isPaid ? 'Pago' : isOverdue ? 'Vencido' : 'Em aberto'}
                        </span>
                     }
                  />
               </ListItemLayout>
            )
         }}

         renderDesktopItem={(commitment) => {
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

                  <ListColMuted span={3}>
                     {isPaid
                        ? `Pago em ${commitment.paymentDate}`
                        : `Vence em ${commitment.dueDate}`}
                  </ListColMuted>

                  <ListColValue>
                     {numberToCurrency(commitment.amount)}
                  </ListColValue>

                  <ListColStatus>
                     <span
                        className={`
                           ${isPaid && 'text-green-600'}
                           ${isOverdue && 'text-red-600'}
                           ${!isPaid && !isOverdue && 'text-orange-500'}
                        `}
                     >
                        {isPaid ? 'Pago' : isOverdue ? 'Vencido' : 'Aberto'}
                     </span>
                  </ListColStatus>
               </ListItemRowDesktop>
            )
         }}
      />
   )
}