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
      totalCommitments: 0
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
      </div>
   );
}