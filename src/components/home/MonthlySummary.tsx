import { useMemo } from 'react'
import { Plus, Minus, Calendar, Wallet, TrendingUp } from "lucide-react"
import { usePeriod } from '@/contexts/PeriodContext';
import { useSummary } from '@/hooks/useSummary';
import { useTheme } from '@/contexts/ThemeContext';
import { SummaryCard } from "@/components/home/SummaryCard"

/**
 * Monthly summary component with optimized calculations.
 * Now loaded lazily from Home.tsx to improve LCP.
 */
export default function MonthlySummary() {
  const { month, year } = usePeriod();
  const { summary, isLoading } = useSummary(month, String(year));
  const { theme } = useTheme();

  const totals = useMemo(() => ({
    totalIncomes: summary?.totalIncomes ?? 0,
    totalExpenses: summary?.totalExpenses ?? 0,
    totalCommitments: summary?.totalCommitments ?? 0,
    totalReceivedAmount: summary?.totalReceivedAmount ?? 0,
    totalPaidExpenses: summary?.totalPaidExpenses ?? 0,
    totalPaidCommitments: summary?.totalPaidCommitments ?? 0
  }), [summary])

  const balances = useMemo(() => ({
    monthFinalBalance: totals.totalIncomes - totals.totalExpenses - totals.totalCommitments,
    currentBalance: totals.totalReceivedAmount - totals.totalPaidExpenses - totals.totalPaidCommitments
  }), [totals]);

  return (
    <div className="space-y-3">
      <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">Resumo do Mês</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SummaryCard
          title="Entradas"
          amount={totals.totalIncomes}
          color="#3b82f6"
          isLoading={isLoading}
          icon={<Plus className="h-4 w-4 md:h-5 md:w-5" />}
        />
        <SummaryCard
          title="Gastos"
          amount={totals.totalExpenses}
          color="#ef4444"
          isLoading={isLoading}
          icon={<Minus className="h-4 w-4 md:h-5 md:w-5" />}
        />
        <SummaryCard
          title="Compromissos"
          amount={totals.totalCommitments}
          color={(theme == 'dark') ? "#f59e0b" : "#b45309"}
          isLoading={isLoading}
          icon={<Calendar className="h-4 w-4 md:h-5 md:w-5" />}
        />
        <SummaryCard
          title="Saldo Atual"
          amount={balances.currentBalance}
          color={(balances.currentBalance < 0) ? "#ef4444" : "#6366f1"}
          isLoading={isLoading}
          icon={<Wallet className="h-4 w-4 md:h-5 md:w-5" />}
        />
        <SummaryCard
          title="Saldo Final do Mês"
          amount={balances.monthFinalBalance}
          color={(balances.monthFinalBalance < 0) ? "#b91c1c" : (theme == 'dark' ? '#4ADE80' : "#15803d")}
          isLoading={isLoading}
          icon={<TrendingUp className="h-4 w-4 md:h-5 md:w-5" />}
        />
      </div>
    </div>
  )
}
