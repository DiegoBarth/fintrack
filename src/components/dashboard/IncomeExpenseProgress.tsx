import type { FullSummary } from '../../types/FullSummary'
import { numberToCurrency } from '../../utils/formatters'

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

   return (
      <section className="rounded-xl border bg-card p-4">
         <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
            Progresso do mês
         </h2>

         <div className="space-y-4">
            {/* INCOMES */}
            <div>
               <div className="mb-1 flex justify-between text-sm">
                  <span>Receitas</span>
                  <span className="text-muted-foreground">
                     {numberToCurrency(summary.totalReceivedInMonth)} /{' '}
                     {numberToCurrency(summary.totalIncomes)}
                  </span>
               </div>
               <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                     className="h-2 rounded-full bg-emerald-500 transition-all duration-500 ease-in-out"
                     style={{ width: `${Math.min(incomePercentage, 100)}%` }}
                  />
               </div>
               <p className="mt-1 text-[10px] text-muted-foreground text-right">
                  {incomePercentage.toFixed(1)}% do esperado
               </p>
            </div>

            {/* EXPENSES */}
            <div>
               <div className="mb-1 flex justify-between text-sm">
                  <span>Despesas</span>
                  <span className="text-muted-foreground">
                     {numberToCurrency(totalPaidAmount)} /{' '}
                     {numberToCurrency(totalPlannedExpenses)}
                  </span>
               </div>
               <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                     className={`h-2 rounded-full transition-all duration-500 ease-in-out ${expensePercentage > 90 ? 'bg-red-500' : 'bg-amber-500'
                        }`}
                     style={{ width: `${Math.min(expensePercentage, 100)}%` }}
                  />
               </div>
               <p className="mt-1 text-[10px] text-muted-foreground text-right">
                  {expensePercentage.toFixed(1)}% do limite planejado
               </p>
            </div>
         </div>
      </section>
   )
}