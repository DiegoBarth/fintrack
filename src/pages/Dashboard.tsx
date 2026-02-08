import { useDashboard } from '../contexts/DashboardContext';
import { YearlyBalanceChart } from '../components/dashboard/YearlyBalanceChart';
import { TopCategories } from '../components/dashboard/TopCategories';
import { CreditCards } from '../components/dashboard/CreditCards';
import { IncomeExpenseProgress } from '../components/dashboard/IncomeExpenseProgress';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
   const { yearlyBalance, topCategories, cards, summary, loading } =
      useDashboard();

   const navigate = useNavigate();

   return (
      <div style={{ padding: 16 }}>
         <button
            style={{ marginBottom: 16 }}
            onClick={() => navigate('/')}
         >
            ← Voltar para Home
         </button>

         <h1>Dashboard</h1>

         <YearlyBalanceChart data={yearlyBalance} loading={loading} />
         <TopCategories categories={topCategories} loading={loading} />
         <CreditCards cards={cards} loading={loading} />
         <IncomeExpenseProgress summary={summary} loading={loading} />
      </div>
   );
}