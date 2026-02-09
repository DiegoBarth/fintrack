import type { Commitment } from '@/types/Commitment'
import { numberToCurrency } from '@/utils/formatters'

interface CommitmentListProps {
   commitments: Commitment[]
   onSelect: (commitment: Commitment) => void
}

/**
 * Renders a list of recurring or installment commitments.
 * Highlights payment status and installment progress for credit cards.
 */
export function CommitmentList({ commitments, onSelect }: CommitmentListProps) {
   if (commitments.length === 0) {
      return (
         <p className="text-sm text-muted-foreground py-10 text-center border-2 border-dashed rounded-xl">
            Nenhum compromisso para este período.
         </p>
      )
   }

   return (
      <>
         {/* MOBILE VIEW */}
         <div className="space-y-3 sm:hidden">
            {commitments.map((item) => {
               const isPaid = !!item.paymentDate
               const isCreditCard = item.type === 'Credit_card'

               return (
                  <div
                     key={item.rowIndex}
                     onClick={() => onSelect(item)}
                     className={`
                        rounded-xl border p-4 cursor-pointer transition-all active:scale-[0.98]
                        ${isPaid ? 'border-green-500/30 bg-green-50/40' : 'bg-white shadow-sm'}
                     `}
                  >
                     <div className="flex justify-between items-start mb-1">
                        <div className="font-semibold text-foreground">{item.description}</div>
                        <div className="font-bold text-foreground">
                           {numberToCurrency(item.amount)}
                        </div>
                     </div>

                     {isCreditCard && (
                        <div className="mb-2 text-[10px] font-medium text-muted-foreground flex items-center gap-1.5">
                           <span className="bg-muted px-1.5 py-0.5 rounded uppercase">{item.card}</span>
                           <span>•</span>
                           {item.card}
                           {(item.totalInstallments ?? 1) > 1 && (
                              <> • Parcela {item.installment}/{item.totalInstallments}</>
                           )}
                        </div>
                     )}

                     <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-dashed">
                        <span className="text-muted-foreground italic">
                           {isPaid ? `Pago em ${item.paymentDate}` : `Vence em ${item.dueDate}`}
                        </span>

                        <span className={`font-bold uppercase tracking-wider ${isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                           {isPaid ? 'Pago' : 'Em aberto'}
                        </span>
                     </div>
                  </div>
               )
            })}
         </div>

         {/* DESKTOP VIEW */}
         <div className="hidden sm:flex flex-col gap-2">
            {commitments.map((item) => {
               const isPaid = !!item.paymentDate

               return (
                  <div
                     key={item.rowIndex}
                     onClick={() => onSelect(item)}
                     className={`
                        flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer
                        hover:shadow-md
                        ${isPaid ? 'bg-green-50/20 border-green-100' : 'bg-white border-gray-100'}
                     `}
                  >
                     <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate">{item.description}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                           {item.type} {item.card && `• ${item.card}`}
                        </div>
                     </div>

                     <div className="flex shrink-0 gap-10 items-center text-sm">
                        <div className="w-40">
                           <span className="block text-[10px] uppercase font-bold text-muted-foreground opacity-60">
                              Status do Pagamento
                           </span>
                           <span className={isPaid ? 'text-green-600 font-medium' : 'text-orange-500 font-medium'}>
                              {isPaid ? `Pago em ${item.paymentDate}` : `Vence em ${item.dueDate}`}
                           </span>
                        </div>

                        {item.totalInstallments && (
                           <div className="w-20">
                              <span className="block text-[10px] uppercase font-bold text-muted-foreground opacity-60">
                                 Parcela
                              </span>
                              <span className="text-foreground">{item.installment}/{item.totalInstallments}</span>
                           </div>
                        )}

                        <div className="w-28 text-right">
                           <span className="block text-[10px] uppercase font-bold text-muted-foreground opacity-60">
                              Valor
                           </span>
                           <span className="font-bold text-base">{numberToCurrency(item.amount)}</span>
                        </div>
                     </div>
                  </div>
               )
            })}
         </div>
      </>
   )
}