import type { FullSummary } from '../../types/FullSummary';
import { numberToCurrency } from '../../utils/formatters';

interface ProgressProps {
   summary: FullSummary | null;
   loading: boolean;
}

export function IncomeExpenseProgress({ summary, loading }: ProgressProps) {
   if(!summary) return;
   
   if (loading) return <p>Carregando progresso...</p>;

   const incomePercentage = summary.totalIncomes
      ? (summary.totalReceivedAmount / summary.totalIncomes) * 100
      : 0;

   const totalPlannedExpenses = summary.totalExpenses + summary.totalCommitments;
   const totalPaidAmount = summary.totalPaidExpenses + summary.totalPaidCommitments;

   const expensePercentage = totalPlannedExpenses
      ? (totalPaidAmount / totalPlannedExpenses) * 100
      : 0;

   return (
      <div style={{ padding: '16px 0' }}>
         <h2>Progresso Financeiro</h2>

         <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
               <strong>Receitas Recebidas</strong>
               <span>{numberToCurrency(summary.totalReceivedAmount)} / {numberToCurrency(summary.totalIncomes)}</span>
            </div>
            <div style={{ background: '#eee', height: 16, borderRadius: 8, overflow: 'hidden' }}>
               <div style={{
                  width: `${Math.min(incomePercentage, 100)}%`,
                  height: '100%',
                  background: '#2ecc71',
                  transition: 'width 0.5s ease-in-out'
               }} />
            </div>
            <small style={{ color: '#666' }}>{incomePercentage.toFixed(1)}% do esperado</small>
         </div>

         <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
               <strong>Despesas Pagas (Gastos + Compromissos)</strong>
               <span>{numberToCurrency(totalPaidAmount)} / {numberToCurrency(totalPlannedExpenses)}</span>
            </div>
            <div style={{ background: '#eee', height: 16, borderRadius: 8, overflow: 'hidden' }}>
               <div style={{
                  width: `${Math.min(expensePercentage, 100)}%`,
                  height: '100%',
                  background: expensePercentage > 90 ? '#e74c3c' : '#f1c40f',
                  transition: 'width 0.5s ease-in-out'
               }} />
            </div>
            <small style={{ color: '#666' }}>{expensePercentage.toFixed(1)}% do limite planejado</small>
         </div>
      </div>
   );
}