import { useEffect, useState } from 'react';
import { fetchFullSummary } from '../../api/home';
import type { FullSummary } from '../../types/FullSummary';
import { usePeriod } from '../../contexts/PeriodContext';
import { SummaryCard } from './SummaryCard';

export function MonthlySummary() {
   const { month, year } = usePeriod();
   const [summary, setSummary] = useState<FullSummary>({
      totalIncomes: 0,
      totalExpenses: 0,
      totalCommitments: 0,
      totalReceivedAmount: 0,
      totalPaidExpenses: 0,
      totalPaidCommitments: 0,
      totalReceivedInMonth: 0,
      totalPaidExpensesInMonth: 0,
      totalPaidCommitmentsInMonth: 0
   });

   const [loading, setLoading] = useState(false);

   async function loadSummary() {
      setLoading(true);
      try {
         const res = await fetchFullSummary(month, String(year));
         setSummary(res);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      loadSummary();
   }, [month, year]);

   const balance = summary.totalIncomes - summary.totalExpenses - summary.totalCommitments;

   const projectedBalance = summary.totalIncomes - summary.totalExpenses - summary.totalCommitments;
   const currentBalance = summary.totalReceivedAmount - summary.totalPaidExpenses - summary.totalPaidCommitments;

   return (
      <div style={{ display: 'grid', gap: 12 }}>
         <SummaryCard
            title="Entradas"
            amount={summary.totalIncomes}
            color="#3498db"
            loading={loading}
         />
         <SummaryCard
            title="Gastos"
            amount={summary.totalExpenses}
            color="#e74c3c"
            loading={loading}
         />
         <SummaryCard
            title="Compromissos"
            amount={summary.totalCommitments}
            color="#f39c12"
            loading={loading}
         />
         <SummaryCard
            title="Saldo"
            amount={balance}
            color={balance >= 0 ? '#2ecc71' : '#e74c3c'}
            loading={loading}
         />

         <SummaryCard
            title="Saldo Atual"
            amount={currentBalance}
            color={currentBalance >= 0 ? '#2ecc71' : '#e74c3c'}
            loading={loading}
         />
         <SummaryCard
            title="Saldo Final do Mês"
            amount={projectedBalance}
            color={projectedBalance >= 0 ? '#3498db' : '#e67e22'}
            loading={loading}
         />
      </div>
   );
}