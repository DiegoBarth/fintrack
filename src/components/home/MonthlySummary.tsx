import { Plus, Minus, Calendar, Wallet, TrendingUp } from "lucide-react"
import { SummaryCard } from "./SummaryCard"
import { usePeriod } from '../../contexts/PeriodContext';

/**
 * Container component that calculates and displays the financial summary for the selected month.
 * It consumes data from PeriodContext and renders multiple SummaryCards.
 */
export function MonthlySummary() {
   const { summary, loadingSummary } = usePeriod();

   if (!summary) return null;

   /**
    * Projection of the balance at the end of the month considering all commitments.
    */
   const monthFinalBalance =
      summary.totalIncomes - summary.totalExpenses - summary.totalCommitments;

   /**
    * Real-time balance based on what has already been paid and received.
    */
   const currentBalance =
      summary.totalReceivedAmount - summary.totalPaidExpenses - summary.totalPaidCommitments;

   return (
      <div className="flex flex-col gap-3">
         <SummaryCard
            title="Entradas"
            amount={summary.totalIncomes}
            color="#3b82f6"
            isLoading={loadingSummary}
            icon={<Plus className="h-4 w-4" />}
         />

         <SummaryCard
            title="Gastos"
            amount={summary.totalExpenses}
            color="#ef4444"
            isLoading={loadingSummary}
            icon={<Minus className="h-4 w-4" />}
         />

         <SummaryCard
            title="Compromissos"
            amount={summary.totalCommitments}
            color="#f59e0b"
            isLoading={loadingSummary}
            icon={<Calendar className="h-4 w-4" />}
         />

         <SummaryCard
            title="Saldo Atual"
            amount={currentBalance}
            color="#6366f1"
            isLoading={loadingSummary}
            icon={<Wallet className="h-4 w-4" />}
         />

         <SummaryCard
            title="Saldo Final do Mês"
            amount={monthFinalBalance}
            color="#8b5cf6"
            isLoading={loadingSummary}
            icon={<TrendingUp className="h-4 w-4" />}
         />
      </div>
   )
}