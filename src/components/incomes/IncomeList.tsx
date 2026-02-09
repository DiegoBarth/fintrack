import type { Income } from '@/types/Income'
import { numberToCurrency } from '@/utils/formatters'
import { CheckCircle2, Clock } from 'lucide-react'

interface IncomeListProps {
   incomes: Income[]
   onSelect: (income: Income) => void
}

/**
 * Renders a list of incomes with status highlights.
 * Uses green for received amounts and amber/blue for pending ones.
 */
export function IncomeList({ incomes, onSelect }: IncomeListProps) {
   if (incomes.length === 0) {
      return (
         <p className="text-sm text-muted-foreground py-10 text-center border-2 border-dashed rounded-xl">
            Nenhuma receita encontrada para este período.
         </p>
      )
   }

   return (
      <>
         {/* MOBILE VIEW */}
         <div className="space-y-3 sm:hidden">
            {incomes.map((income) => {
               const isReceived = !!income.receivedDate
               const dateText = isReceived
                  ? `Recebido em ${income.receivedDate}`
                  : `Previsto para ${income.expectedDate}`

               return (
                  <div
                     key={income.rowIndex}
                     onClick={() => onSelect(income)}
                     className={`
                        rounded-xl border p-4 cursor-pointer transition-all active:scale-[0.98]
                        ${isReceived ? 'border-green-500/30 bg-green-50/40' : 'bg-white shadow-sm'}
                     `}
                  >
                     <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-foreground">{income.description}</span>
                        <span className="font-bold text-green-700">
                           {numberToCurrency(income.amount)}
                        </span>
                     </div>

                     <div className="flex items-center justify-between text-[11px] mt-2">
                        <span className="text-muted-foreground">{dateText}</span>
                        <div className={`flex items-center gap-1 font-bold uppercase tracking-wider ${isReceived ? 'text-green-600' : 'text-blue-500'
                           }`}>
                           {isReceived ? (
                              <><CheckCircle2 size={12} /> Recebido</>
                           ) : (
                              <><Clock size={12} /> Em aberto</>
                           )}
                        </div>
                     </div>
                  </div>
               )
            })}
         </div>

         {/* DESKTOP VIEW */}
         <div className="hidden sm:flex flex-col gap-2">
            {incomes.map((income) => {
               const isReceived = !!income.receivedDate

               return (
                  <div
                     key={income.rowIndex}
                     onClick={() => onSelect(income)}
                     className={`
                        flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer
                        hover:shadow-md
                        ${isReceived ? 'border-green-500/40 bg-green-50' : ''}
                     `}
                  >
                     <div className={`h-2 w-2 rounded-full shrink-0 ${isReceived ? 'bg-green-500' : 'bg-blue-400'}`} />

                     <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate">{income.description}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                           Receita Mensal
                        </div>
                     </div>

                     <div className="flex shrink-0 gap-10 items-center text-sm">
                        <div className="w-48">
                           <span className="block text-[10px] uppercase font-bold text-muted-foreground opacity-60">
                              Status / Data
                           </span>
                           <span className={isReceived ? 'text-green-600 font-medium' : 'text-blue-500 font-medium'}>
                              {isReceived
                                 ? `Recebido em ${income.receivedDate}`
                                 : `Previsto: ${income.expectedDate}`
                              }
                           </span>
                        </div>

                        <div className="w-28 text-right">
                           <span className="block text-[10px] uppercase font-bold text-muted-foreground opacity-60">
                              Valor
                           </span>
                           <span className="font-bold text-green-700 text-base">
                              {numberToCurrency(income.amount)}
                           </span>
                        </div>

                        <div className="w-20 text-right">
                           {isReceived ? (
                              <span className="inline-flex items-center justify-center bg-green-100 text-green-700 p-1.5 rounded-full">
                                 <CheckCircle2 size={16} />
                              </span>
                           ) : (
                              <span className="inline-flex items-center justify-center bg-blue-50 text-blue-500 p-1.5 rounded-full">
                                 <Clock size={16} />
                              </span>
                           )}
                        </div>
                     </div>
                  </div>
               )
            })}
         </div>
      </>
   )
}