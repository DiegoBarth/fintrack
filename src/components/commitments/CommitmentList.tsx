import type { Commitment } from "@/types/Commitment";
import { formatCurrency, numberToCurrency } from "@/utils/formatters"; // Exemplo de nome traduzido

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
   if (commitments.length === 0) {
      return (
         <p className="text-sm text-muted-foreground">
            Nenhum compromisso cadastrado
         </p>
      );
   }

   return (
      <>
         {/* MOBILE VIEW */}
         <div className="space-y-2 sm:hidden">
            {commitments.map(item => {
               const isPaid = !!item.paymentDate;
               const isCreditCard = item.type === 'Credit_card';
               const isOverdue = !isPaid && checkIfOverdue(item.dueDate);

               return (
                  <div
                     key={item.rowIndex}
                     onClick={() => onSelect(item)}
                     className={`
                        rounded-lg border p-3 cursor-pointer transition
                        hover:bg-muted
                        ${isPaid && 'border-green-500/40 bg-green-50'}
                        ${isOverdue && 'border-red-500/40 bg-red-50'}
                     `}
                  >
                     <div className="flex justify-between items-start">
                        <div className="font-medium">{item.description}</div>

                        <div className="font-semibold">
                           {numberToCurrency(item.amount)}
                        </div>
                     </div>

                     {isCreditCard && (
                        <div className="mt-1 text-xs text-muted-foreground">
                           {item.card}
                           {(item.totalInstallments ?? 1) > 1 && (
                              <> • Parcela {item.installment}/{item.totalInstallments}</>
                           )}
                        </div>
                     )}

                     <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                           {isPaid
                              ? `Pago em ${item.paymentDate}`
                              : `Vence em ${item.dueDate}`}
                        </span>

                        <span
                           className={`
                              font-medium
                              ${isPaid && 'text-green-600'}
                              ${isOverdue && 'text-red-600'}
                              ${!isPaid && !isOverdue && 'text-amber-500'}
                           `}
                        >
                           {isPaid
                              ? 'Pago'
                              : isOverdue
                                 ? 'Vencido'
                                 : 'Em aberto'}
                        </span>
                     </div>
                  </div>
               );
            })}
         </div>

         {/* DESKTOP VIEW */}
         <div className="hidden sm:grid grid-cols-12 gap-3">
            {commitments.map(item => {
               const isPaid = !!item.paymentDate;
               const isOverdue = !isPaid && checkIfOverdue(item.dueDate);

               return (
                  <div
                     key={item.rowIndex}
                     onClick={() => onSelect(item)}
                     className={`
                        col-span-12 grid grid-cols-12 items-center p-4
                        rounded-lg border cursor-pointer transition
                        hover:shadow-md
                        ${isPaid && 'bg-green-50 border-green-200'}
                        ${isOverdue && 'bg-red-50 border-red-200'}
                     `}
                  >
                     <div className="col-span-4 font-medium">
                        {item.description}
                     </div>

                     <div className="col-span-2 text-sm text-muted-foreground capitalize">
                        {item.type}
                     </div>

                     <div className="col-span-3 text-sm text-muted-foreground">
                        {isPaid
                           ? `Pago em ${item.paymentDate}`
                           : `Vence em ${item.dueDate}`}
                     </div>

                     <div className="col-span-2 text-right font-semibold">
                        {numberToCurrency(item.amount)}
                     </div>

                     <div
                        className={`
                           col-span-1 text-sm font-medium text-right
                           ${isPaid && 'text-green-600'}
                           ${isOverdue && 'text-red-600'}
                           ${!isPaid && !isOverdue && 'text-orange-500'}
                        `}
                     >
                        {isPaid
                           ? 'Pago'
                           : isOverdue
                              ? 'Vencido'
                              : 'Aberto'}
                     </div>
                  </div>
               );
            })}
         </div>
      </>
   );
}