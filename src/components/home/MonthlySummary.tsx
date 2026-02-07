import { usePeriod } from '../../contexts/PeriodContext';
import { SummaryCard } from './SummaryCard';

export function MonthlySummary() {
   const { summary, loadingSummary } = usePeriod();

   if (!summary) return null;

   const balance = summary.totalIncomes - summary.totalExpenses - summary.totalCommitments;

   const projectedBalance = summary.totalIncomes        - summary.totalExpenses     - summary.totalCommitments;
   const currentBalance   = summary.totalReceivedAmount - summary.totalPaidExpenses - summary.totalPaidCommitments;

   return (
      <div style={{ display: 'grid', gap: 12 }}>
         <SummaryCard
            title="Entradas"
            amount={summary.totalIncomes}
            color="#3498db"
            loading={loadingSummary}
         />
         <SummaryCard
            title="Gastos"
            amount={summary.totalExpenses}
            color="#e74c3c"
            loading={loadingSummary}
         />
         <SummaryCard
            title="Compromissos"
            amount={summary.totalCommitments}
            color="#f39c12"
            loading={loadingSummary}
         />
         <SummaryCard
            title="Saldo"
            amount={balance}
            color={balance >= 0 ? '#2ecc71' : '#e74c3c'}
            loading={loadingSummary}
         />

         <SummaryCard
            title="Saldo Atual"
            amount={currentBalance}
            color={currentBalance >= 0 ? '#2ecc71' : '#e74c3c'}
            loading={loadingSummary}
         />
         <SummaryCard
            title="Saldo Final do Mês"
            amount={projectedBalance}
            color={projectedBalance >= 0 ? '#3498db' : '#e67e22'}
            loading={loadingSummary}
         />
      </div>
   );
}