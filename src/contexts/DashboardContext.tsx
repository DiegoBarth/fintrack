import { createContext, useContext, useEffect, useState } from 'react';
import { listMonthlyBalance, listTopCategories, listCardsSummary } from '@/api/endpoints/dashboard';
import type { MonthlyBalanceHistory, CategorySummary, CreditCardSummary } from '@/types/Dashboard';
import type { FullSummary } from '@/types/FullSummary';
import { usePeriod } from '@/contexts/PeriodContext';

interface DashboardContextType {
   yearlyBalance: MonthlyBalanceHistory[];
   topCategories: CategorySummary[];
   cards: CreditCardSummary[];
   summary: FullSummary | null;
   loading: boolean;
}

const DashboardContext = createContext<DashboardContextType>(
   {} as DashboardContextType
);

/**
 * Provider that aggregates dashboard data from multiple API sources.
 * It synchronizes data based on the global period (month/year).
 */
export function DashboardProvider({ children }: { children: React.ReactNode }) {
   const { month, year, summary } = usePeriod();
   const [yearlyBalance, setYearlyBalance] = useState<MonthlyBalanceHistory[]>([]);
   const [topCategories, setTopCategories] = useState<CategorySummary[]>([]);
   const [cards, setCards] = useState<CreditCardSummary[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      let isCancelled = false;

      /**
       * Fetches all dashboard metrics in parallel to optimize load time.
       */
      async function loadDashboardData() {
         setLoading(true);
         try {
            const [balance, categories, cardsSummary] = await Promise.all([
               listMonthlyBalance(String(year)),
               listTopCategories(month, String(year)),
               listCardsSummary(month, String(year)),
            ]);

            if (isCancelled) return;

            setYearlyBalance(balance);
            setTopCategories(categories);
            setCards(cardsSummary);
         } catch (error) {
            console.error("Error loading dashboard data:", error);
         } finally {
            if (!isCancelled) setLoading(false);
         }
      }

      loadDashboardData();

      return () => {
         isCancelled = true;
      };
   }, [month, year]);

   return (
      <DashboardContext.Provider
         value={{
            yearlyBalance,
            topCategories,
            cards,
            summary,
            loading
         }}
      >
         {children}
      </DashboardContext.Provider>
   );
}

/**
 * Hook to access dashboard metrics and loading states.
 */
export function useDashboard() {
   return useContext(DashboardContext);
}