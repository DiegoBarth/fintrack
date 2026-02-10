import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFullSummary } from '@/api/home';
import type { FullSummary } from '@/types/FullSummary';

interface PeriodContextType {
   month: string;
   setMonth: (month: string) => void;
   year: number;
   setYear: (year: number) => void;
   summary: FullSummary;
   loadingSummary: boolean;
}

/**
 * Retrieves the initial period from sessionStorage or defaults to the current date.
 */
function getInitialPeriod() {
   const saved = sessionStorage.getItem('app_period');
   if (saved) return JSON.parse(saved);

   const today = new Date();
   return {
      month: String(today.getMonth() + 1),
      year: today.getFullYear()
   };
}

/**
 * Initial state for the financial summary.
 */
const initialSummary: FullSummary = {
   totalIncomes: 0,
   totalExpenses: 0,
   totalCommitments: 0,
   totalReceivedAmount: 0,
   totalPaidExpenses: 0,
   totalPaidCommitments: 0,
   totalReceivedInMonth: 0,
   totalPaidExpensesInMonth: 0,
   totalPaidCommitmentsInMonth: 0,
   availableYears: []
};

export const PeriodContext = createContext<PeriodContextType>({
   month: '',
   setMonth: () => { },
   year: 0,
   setYear: () => { },
   summary: initialSummary,
   loadingSummary: false
});

/**
 * PeriodProvider manages the selected time frame and fetches the global financial summary.
 * Uses TanStack Query to cache summary data across the application.
 */
export function PeriodProvider({ children }: { children: ReactNode }) {
   const initialPeriod = getInitialPeriod();

   const [month, setMonth] = useState<string>(initialPeriod.month);
   const [year, setYear] = useState<number>(initialPeriod.year);

   /* =========================
      REACT QUERY INTEGRATION
      ========================= */
   const { data: summary = initialSummary, isLoading: loadingSummary } = useQuery({
      queryKey: ['summary', month, year],
      queryFn: () => fetchFullSummary(month, String(year)),
      // Keeps the old data on screen while fetching the new period's data
      placeholderData: (previous) => previous ?? initialSummary
   });

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
            loadingSummary
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