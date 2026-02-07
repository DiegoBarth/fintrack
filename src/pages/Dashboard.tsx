import { useEffect, useState } from 'react';
import { fetchFullSummary } from '../api/home';
import {
   fetchMonthlyBalance,
   fetchTopCategories,
   fetchCreditCardsSummary
} from '../api/dashboard';
import { usePeriod } from '../contexts/PeriodContext';
import { YearlyBalanceChart } from '../components/dashboard/YearlyBalanceChart';
import { TopCategories } from '../components/dashboard/TopCategories';
import { CreditCards } from '../components/dashboard/CreditCards';
import { IncomeExpenseProgress } from '../components/dashboard/IncomeExpenseProgress';
import type {
   MonthlyBalanceHistory,
   CategorySummary,
   CreditCardSummary
} from '../types/Dashboard';
import type { FullSummary } from '../types/FullSummary';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
   const navigate = useNavigate();
   const { month, year } = usePeriod();

   const [yearlyBalance, setYearlyBalance] = useState<MonthlyBalanceHistory[]>([]);
   const [topCategories, setTopCategories] = useState<CategorySummary[]>([]);
   const [creditCards, setCreditCards] = useState<CreditCardSummary[]>([]);
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

   const [loading, setLoading] = useState(true);

   async function fetchDashboardData() {
      setLoading(true);
      try {
         const [balance, categories, cards, fullSummary] = await Promise.all([
            fetchMonthlyBalance(String(year)),
            fetchTopCategories(month, String(year)),
            fetchCreditCardsSummary(month, String(year)),
            fetchFullSummary(month, String(year))
         ]);

         setYearlyBalance(balance);
         setTopCategories(categories);
         setCreditCards(cards);
         setSummary(fullSummary);
      } catch (err) {
         console.error("Error loading dashboard data:", err);
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      fetchDashboardData();
   }, [month, year]);

   return (
      <div style={{ padding: 16 }}>
         <button
            style={{ marginBottom: 16 }}
            onClick={() => navigate('/')}
         >
            ← Voltar para Home
         </button>

         <h1>Dashboard</h1>

         <section style={{ marginBottom: 32 }}>
            <YearlyBalanceChart data={yearlyBalance} loading={loading} />
         </section>

         <section style={{ marginBottom: 32 }}>
            <TopCategories categories={topCategories} loading={loading} />
         </section>

         <section style={{ marginBottom: 32 }}>
            <CreditCards cards={creditCards} loading={loading} />
         </section>

         <section style={{ marginBottom: 32 }}>
            <IncomeExpenseProgress summary={summary} loading={loading} />
         </section>
      </div>
   );
}