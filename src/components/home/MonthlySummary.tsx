import { Plus, Minus, Calendar, Wallet, TrendingUp } from "lucide-react"
import { usePeriod } from '@/contexts/PeriodContext';
import { SummaryCard } from "@/components/home/SummaryCard"

/**
 * Container component that calculates and displays the financial summary for the selected month.
 * It consumes data from PeriodContext and renders multiple SummaryCards.
 */
export function MonthlySummary() {
   const { summary, isLoading } = usePeriod();

   const totalIncomes = summary?.totalIncomes ?? 0;
   const totalExpenses = summary?.totalExpenses ?? 0;
   const totalCommitments = summary?.totalCommitments ?? 0;
   const totalReceivedAmount = summary?.totalReceivedAmount ?? 0;
   const totalPaidExpenses = summary?.totalPaidExpenses ?? 0;
   const totalPaidCommitments = summary?.totalPaidCommitments ?? 0;

   /**
    * Projection of the balance at the end of the month considering all commitments.
    */
   const monthFinalBalance = totalIncomes - totalExpenses - totalCommitments;

   /**
    * Real-time balance based on what has already been paid and received.
    */
   const currentBalance = totalReceivedAmount - totalPaidExpenses - totalPaidCommitments;

   return (
      <div className="flex flex-col gap-3">
         <SummaryCard
            title="Entradas"
            amount={totalIncomes}
            color="#3b82f6"
            isLoading={isLoading}
            icon={<Plus className="h-4 w-4" />}
         />

         <SummaryCard
            title="Gastos"
            amount={totalExpenses}
            color="#ef4444"
            isLoading={isLoading}
            icon={<Minus className="h-4 w-4" />}
         />

         <SummaryCard
            title="Compromissos"
            amount={totalCommitments}
            color="#f59e0b"
            isLoading={isLoading}
            icon={<Calendar className="h-4 w-4" />}
         />

         <SummaryCard
            title="Saldo Atual"
            amount={currentBalance}
            color="#6366f1"
            isLoading={isLoading}
            icon={<Wallet className="h-4 w-4" />}
         />

         <SummaryCard
            title="Saldo Final do Mês"
            amount={monthFinalBalance}
            color="#8b5cf6"
            isLoading={isLoading}
            icon={<TrendingUp className="h-4 w-4" />}
         />
      </div>
   )
}