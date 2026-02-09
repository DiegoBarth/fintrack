import type { Expense } from '@/types/Expense'
import { numberToCurrency } from '@/utils/formatters'

interface ExpenseListProps {
   expenses: Expense[]
   onSelect: (expense: Expense) => void
}

/**
 * Renders a responsive list of expenses.
 * Uses a card-based layout for mobile and a structured row layout for desktop.
 */
export function ExpenseList({ expenses, onSelect }: ExpenseListProps) {
   if (expenses.length === 0) {
      return (
         <p className="text-sm text-muted-foreground py-10 text-center border-2 border-dashed rounded-xl">
            Nenhum gasto registrado para este período.
         </p>
      )
   }

   return (
      <>
         {/* MOBILE VIEW */}
         <div className="space-y-3 sm:hidden">
            {expenses.map((expense) => (
               <div
                  key={expense.rowIndex}
                  className="rounded-xl border bg-white p-4 shadow-sm active:scale-[0.98] transition-transform"
                  onClick={() => onSelect(expense)}
               >
                  <div className="flex justify-between items-start mb-1">
                     <span className="font-semibold text-foreground leading-tight">
                        {expense.description}
                     </span>
                     <span className="text-sm font-bold text-red-600">
                        {numberToCurrency(expense.amount)}
                     </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                     <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                        {expense.category}
                     </span>
                     <span className="text-muted-foreground italic">
                        Pago em: {expense.paymentDate}
                     </span>
                  </div>
               </div>
            ))}
         </div>

         {/* DESKTOP VIEW */}
         <div className="hidden sm:flex flex-col gap-2">
            {expenses.map((expense) => (
               <div
                  key={expense.rowIndex}
                  className="
                     flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white
                     shadow-sm hover:shadow-md hover:border-red-100 transition-all cursor-pointer
                  "
                  onClick={() => onSelect(expense)}
               >
                  {/* Category Indicator Icon/Dot */}
                  <div className="h-2 w-2 rounded-full bg-red-400 shrink-0" />

                  <div className="flex-1 min-w-0">
                     <div className="font-semibold text-foreground truncate">
                        {expense.description}
                     </div>
                     <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        {expense.category}
                     </div>
                  </div>

                  <div className="flex shrink-0 gap-10 items-center text-sm">
                     <div className="w-32">
                        <span className="block text-[10px] uppercase font-bold text-muted-foreground opacity-60">
                           Data de Pagamento
                        </span>
                        <span className="text-foreground">{expense.paymentDate}</span>
                     </div>

                     <div className="w-28 text-right">
                        <span className="block text-[10px] uppercase font-bold text-muted-foreground opacity-60">
                           Valor
                        </span>
                        <span className="font-bold text-red-600 text-base">
                           {numberToCurrency(expense.amount)}
                        </span>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </>
   )
}