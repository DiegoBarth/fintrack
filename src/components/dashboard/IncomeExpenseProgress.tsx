import { motion } from 'framer-motion'
import type { FullSummary } from '@/types/FullSummary'
import { numberToCurrency } from '@/utils/formatters'

interface Props {
   summary: FullSummary | null
}

export function IncomeExpenseProgress({ summary }: Props) {
   if (!summary) return null

   // Percentage of received incomes
   const incomePercentage = summary.totalIncomes
      ? (summary.totalReceivedInMonth / summary.totalIncomes) * 100
      : 0

   // Total planned expenses (Fixed costs + Commitments)
   const totalPlannedExpenses = summary.totalExpenses + summary.totalCommitments

   // Total effectively paid (Fixed costs paid + Commitments paid)
   const totalPaidAmount = summary.totalPaidExpensesInMonth + summary.totalPaidCommitmentsInMonth

   // Percentage of paid expenses
   const expensePercentage = totalPlannedExpenses
      ? (totalPaidAmount / totalPlannedExpenses) * 100
      : 0

   const IncomesColor = incomePercentage > 100 ? 'bg-emerald-500' : incomePercentage > 80 ? 'bg-emerald-500' : 'bg-amber-500'
   const ExpensesColor = expensePercentage > 100 ? 'bg-red-600' : expensePercentage > 80 ? 'bg-amber-500' : 'bg-red-500'

   return (
      <motion.section
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="rounded-xl border bg-card p-6 shadow-sm"
      >
         <h2 className="mb-6 text-lg font-semibold text-gray-900">
            Progresso do período
         </h2>

         <div className="space-y-6">
            {/* INCOMES */}
            <div>
               <div className="mb-2 flex justify-between items-baseline">
                  <span className="font-medium text-gray-900">Receitas</span>
                  <div className="flex items-center gap-2">
                     <span className="text-sm text-muted-foreground">
                        {numberToCurrency(summary.totalReceivedInMonth)} /{' '}
                        {numberToCurrency(summary.totalIncomes)}
                     </span>
                     <span className={`text-xs font-semibold ${incomePercentage > 100 ? 'text-red-600' :
                        incomePercentage > 80 ? 'text-emerald-600' :
                           'text-amber-600'
                        }`}>
                        {incomePercentage.toFixed(1)}%
                     </span>
                  </div>
               </div>
               <div className="h-3 rounded-full bg-gray-200">
                  <motion.div
                     initial={{ width: 0 }}
                     animate={{ width: `${Math.min(incomePercentage, 100)}%` }}
                     transition={{ duration: 1, ease: 'easeOut' }}
                     className={`h-3 rounded-full ${IncomesColor} transition-colors`}
                  />
               </div>
               <p className="mt-1 text-[10px] text-muted-foreground text-right">
                  {incomePercentage.toFixed(1)}% do esperado
               </p>
            </div>

            {/* EXPENSES */}
            <div>
               <div className="mb-2 flex justify-between items-baseline">
                  <span className="font-medium text-gray-900">Despesas</span>
                  <div className="flex items-center gap-2">
                     <span className="text-sm text-muted-foreground">
                        {numberToCurrency(
                           summary.totalPaidExpensesInMonth + summary.totalPaidCommitmentsInMonth
                        )}{' '}
                        /{' '}
                        {numberToCurrency(
                           summary.totalExpenses + summary.totalCommitments
                        )}
                     </span>
                     <span className={`text-xs font-semibold ${expensePercentage > 100 ? 'text-red-600' :
                        expensePercentage > 80 ? 'text-amber-600' :
                           'text-red-600'
                        }`}>
                        {expensePercentage.toFixed(1)}%
                     </span>
                  </div>
               </div>
               <div className="h-3 rounded-full bg-gray-200">
                  <motion.div
                     initial={{ width: 0 }}
                     animate={{ width: `${Math.min(expensePercentage, 100)}%` }}
                     transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                     className={`h-3 rounded-full ${ExpensesColor} transition-colors`}
                  />
               </div>
               <p className="mt-1 text-[10px] text-muted-foreground text-right">
                  {expensePercentage.toFixed(1)}% do limite planejado
               </p>
            </div>
         </div>
      </motion.section>
   )
}