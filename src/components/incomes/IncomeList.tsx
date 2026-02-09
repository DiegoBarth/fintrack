import type { Income } from '@/types/Income'
import { numberToCurrency } from '@/utils/formatters'

interface IncomeListProps {
   incomes: Income[]
   onSelect: (income: Income) => void
}

/**
 * Renders a responsive list of income records.
 * Shows a simplified card view on mobile and a structured row view on desktop.
 */
export function IncomeList({ incomes, onSelect }: IncomeListProps) {
   if (incomes.length === 0) {
      return (
         <p className="text-sm text-muted-foreground py-4">
            Nenhuma receita cadastrada.
         </p>
      )
   }

   return (
      <>
         {/* MOBILE VIEW: Stacked Cards */}
         <div className="space-y-2 sm:hidden">
            {incomes.map(income => {
               const isReceived = !!income.receivedDate

               return (
                  <div
                     key={income.rowIndex}
                     className={`
                        rounded-lg border p-3 cursor-pointer transition-colors
                        hover:bg-muted active:scale-[0.99]
                        ${isReceived ? 'border-green-500/40 bg-green-50/50' : 'bg-white'}
                     `}
                     onClick={() => onSelect(income)}
                  >
                     <div className="flex items-center justify-between">
                        <div className="font-medium flex items-center gap-2">
                           <span className="text-base">{isReceived ? '✔️' : '⏳'}</span>
                           {income.description}
                        </div>
                        <span className="text-sm font-bold text-foreground">
                           {numberToCurrency(income.amount)}
                        </span>
                     </div>

                     <div className="mt-2 flex flex-col gap-0.5 text-[11px] text-muted-foreground">
                        <span>Previsto: {income.expectedDate}</span>
                        {isReceived && (
                           <span className="text-green-600 font-medium">
                              Recebido em: {income.receivedDate}
                           </span>
                        )}
                     </div>
                  </div>
               )
            })}
         </div>

         {/* DESKTOP VIEW: Structured Rows */}
         <div className="hidden sm:flex flex-col gap-2">
            {incomes.map(income => {
               const isReceived = !!income.receivedDate

               return (
                  <div
                     key={income.rowIndex}
                     className={`
                        flex items-center gap-4 p-4 rounded-xl border shadow-sm 
                        cursor-pointer transition-all hover:shadow-md
                        ${isReceived ? 'bg-green-50/30 border-green-200' : 'bg-white border-gray-100'}
                     `}
                     onClick={() => onSelect(income)}
                  >
                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border text-lg">
                        {isReceived ? '✔️' : '⏳'}
                     </div>

                     <div className="flex-1 font-semibold text-foreground">
                        {income.description}
                     </div>

                     <div className="flex shrink-0 gap-8 text-sm">
                        <div className="w-32 text-muted-foreground">
                           <span className="block text-[10px] uppercase font-bold opacity-60">Previsto</span>
                           {income.expectedDate}
                        </div>

                        <div className="w-36">
                           <span className="block text-[10px] uppercase font-bold opacity-60 text-muted-foreground">Status</span>
                           <span className={isReceived ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                              {isReceived ? `Pago em ${income.receivedDate}` : 'Pendente'}
                           </span>
                        </div>

                        <div className="w-28 text-right">
                           <span className="block text-[10px] uppercase font-bold opacity-60 text-muted-foreground">Valor</span>
                           <span className="font-bold text-base">{numberToCurrency(income.amount)}</span>
                        </div>
                     </div>
                  </div>
               )
            })}
         </div>
      </>
   )
}