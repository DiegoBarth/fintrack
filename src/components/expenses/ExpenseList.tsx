import { Receipt, Calendar, Tag } from 'lucide-react'
import type { Expense } from '@/types/Expense'
import { numberToCurrency } from '@/utils/formatters'

interface ExpenseListProps {
   expenses: Expense[]
   onSelect: (expense: Expense) => void
}

/**
 * List of variable expenses (outcomes already paid).
 * Features a modern grid for desktop and clean cards for mobile.
 */
export function ExpenseList({ expenses, onSelect }: ExpenseListProps) {
   if (expenses.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed rounded-2xl text-muted-foreground">
            <Receipt size={32} className="mb-2 opacity-20" />
            <p className="text-sm">Nenhum gasto registrado neste período.</p>
         </div>
      )
   }

   return (
      <>
         {/* MOBILE VIEW */}
         <div className="space-y-3 sm:hidden">
            {expenses.map((expense) => (
               <div
                  key={expense.rowIndex}
                  onClick={() => onSelect(expense)}
                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm active:scale-[0.98] transition-all"
               >
                  <div className="flex justify-between items-start mb-2">
                     <span className="font-bold text-foreground leading-tight">{expense.description}</span>
                     <span className="font-bold text-red-600">
                        {numberToCurrency(expense.amount)}
                     </span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                     <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                           <Calendar size={12} /> {expense.paymentDate}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                           <Tag size={12} /> {expense.category || 'Geral'}
                        </span>
                     </div>
                     <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded">
                        Pago
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
                  onClick={() => onSelect(expense)}
                  className="
                     grid grid-cols-12 items-center p-4 
                     bg-white rounded-xl border border-gray-100 
                     hover:border-primary/20 hover:shadow-md 
                     cursor-pointer transition-all group
                  "
               >
                  {/* Descrição e Ícone */}
                  <div className="col-span-4 flex items-center gap-3">
                     <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-red-50 transition-colors">
                        <Receipt size={18} className="text-muted-foreground group-hover:text-red-500" />
                     </div>
                     <span className="font-bold text-sm text-foreground truncate">
                        {expense.description}
                     </span>
                  </div>

                  {/* Categoria */}
                  <div className="col-span-2 text-xs text-muted-foreground font-medium flex items-center gap-1">
                     <Tag size={14} className="opacity-40" />
                     {expense.category || '-'}
                  </div>

                  {/* Data de Pagamento */}
                  <div className="col-span-3 text-xs text-muted-foreground flex items-center gap-1">
                     <Calendar size={14} className="opacity-40" />
                     Pago em {expense.paymentDate}
                  </div>

                  {/* Valor */}
                  <div className="col-span-2 text-right font-bold text-red-600">
                     {numberToCurrency(expense.amount)}
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex justify-end">
                     <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                  </div>
               </div>
            ))}
         </div>
      </>
   )
}