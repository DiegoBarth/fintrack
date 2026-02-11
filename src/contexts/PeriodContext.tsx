import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useSummary } from '@/hooks/useSummary';
import { useIncome } from '@/hooks/useIncome';
import { useExpense } from '@/hooks/useExpense';
import { useCommitment } from '@/hooks/useCommitment';
import { useDashboard } from '@/hooks/useDashboard';
import type { FullSummary } from '@/types/FullSummary';
import type { Income } from '@/types/Income';
import type { Expense } from '@/types/Expense';
import type { Commitment } from '@/types/Commitment';
import type { Dashboard } from '@/types/Dashboard';

interface PeriodContextType {
   month: string;
   setMonth: (month: string) => void;
   year: number;
   setYear: (year: number) => void;
   summary: FullSummary | null;
   incomes: Income[] | null;
   expenses: Expense[] | null;
   commitments: Commitment[] | null;
   alertCommitments: Commitment[] | null;
   dashboard: Dashboard | null
   isLoading: boolean;
}

/**
 * Retrieves the initial period from sessionStorage or defaults to the current date.
 */
function getInitialPeriod() {
   const saved = sessionStorage.getItem('period');
   if (saved) return JSON.parse(saved);

   const today = new Date();
   return {
      month: String(today.getMonth() + 1),
      year: today.getFullYear()
   };
}

export const PeriodContext = createContext<PeriodContextType>({
   month: String(new Date().getMonth() + 1),
   setMonth: () => { },
   year: new Date().getFullYear(),
   setYear: () => { },
   summary: null,
   incomes: null,
   expenses: null,
   commitments: null,
   alertCommitments: null,
   dashboard: { monthlyBalance: [], topCategories: [], cardsSummary: [] },
   isLoading: false
});

/**
 * PeriodProvider manages the selected time frame and fetches the global financial summary.
 * Uses TanStack Query to cache summary data across the application.
 */
export function PeriodProvider({ children }: { children: ReactNode }) {
   const initialPeriod = getInitialPeriod();

   const [month, setMonth] = useState<string>(initialPeriod.month);
   const [year, setYear] = useState<number>(initialPeriod.year);

   const { summary, isLoading } = useSummary(month, String(year))
   const { incomes } = useIncome(month, String(year))
   const { expenses } = useExpense(month, String(year))
   const { commitments } = useCommitment(month, String(year))
   const { alertCommitments } = useCommitment('all', String(year), 'alerts')
   const { dashboard } = useDashboard(month, String(year))

   /**
    * Persist period changes to sessionStorage.
    */
   useEffect(() => {
      sessionStorage.setItem(
         'app_period',
         JSON.stringify({ month, year })
      );
   }, [month, year]);

   return (
      <PeriodContext.Provider
         value={{
            month,
            setMonth,
            year,
            setYear,
            summary,
            incomes,
            expenses,
            commitments,
            alertCommitments,
            dashboard,
            isLoading
         }}
      >
         {children}
      </PeriodContext.Provider>
   );
}

/**
 * Hook to access the current selected period and the financial summary.
 */
export const usePeriod = () => useContext(PeriodContext);