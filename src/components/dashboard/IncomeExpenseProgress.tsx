import type { FullSummary } from '@/types/FullSummary'
import { numberToCurrency } from '@/utils/formatters'

interface Props {
  summary: FullSummary | null
}

export default function IncomeExpenseProgress({ summary }: Props) {
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
    <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Progresso do período
      </h2>

      <div className="space-y-6">
        {/* INCOMES */}
        <div>
          <div className="mb-2 flex justify-between items-baseline">
            <span className="font-medium text-gray-900 dark:text-gray-100">Receitas</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground dark:text-gray-300">
                {numberToCurrency(summary.totalReceivedInMonth)} /{' '}
                {numberToCurrency(summary.totalIncomes)}
              </span>
              <span className={`text-xs font-semibold ${incomePercentage > 100 ? 'text-red-600 dark:text-red-400' :
                incomePercentage > 80 ? 'text-emerald-700 dark:text-emerald-400' :
                  'text-amber-700 dark:text-amber-400'
                }`}>
                {incomePercentage.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700">
            <section
              className={`h-3 rounded-full ${IncomesColor} transition-all`}
              style={{ width: `${Math.min(incomePercentage, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground text-right">
            {incomePercentage.toFixed(1)}% do esperado
          </p>
        </div>

        {/* EXPENSES */}
        <div>
          <div className="mb-2 flex justify-between items-baseline">
            <span className="font-medium text-gray-900 dark:text-gray-100">Despesas</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground dark:text-gray-300">
                {numberToCurrency(
                  summary.totalPaidExpensesInMonth + summary.totalPaidCommitmentsInMonth
                )}{' '}
                /{' '}
                {numberToCurrency(
                  summary.totalExpenses + summary.totalCommitments
                )}
              </span>
              <span className={`text-xs font-semibold ${expensePercentage > 100 ? 'text-red-600 dark:text-red-400' :
                expensePercentage > 80 ? 'text-amber-700 dark:text-amber-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                {expensePercentage.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700">
            <section
              className={`h-3 rounded-full ${ExpensesColor} transition-all`}
              style={{ width: `${Math.min(expensePercentage, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground text-right">
            {expensePercentage.toFixed(1)}% do limite planejado
          </p>
        </div>
      </div>
    </section>
  )
}