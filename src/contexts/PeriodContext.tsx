import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fetchFullSummary } from '@/api/home';
import type { FullSummary } from '@/types/FullSummary';

interface PeriodContextType {
   month: string;
   setMonth: (month: string) => void;
   year: number;
   setYear: (year: number) => void;
   summary: FullSummary | null;
   loadingSummary: boolean;
}

/**
 * Retrieves the initial period from sessionStorage or defaults to the current date.
 * @returns An object containing the initial month and year.
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
 * Initial state for the financial summary to prevent undefined errors during first render.
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
 * Provides period-related state and financial summary data to the application.
 * Synchronizes the selected period with sessionStorage for persistence.
 */
export function PeriodProvider({ children }: { children: ReactNode }) {
   const initialPeriod = getInitialPeriod();

   const [month, setMonth] = useState<string>(initialPeriod.month);
   const [year, setYear] = useState<number>(initialPeriod.year);

   const [summary, setSummary] = useState<FullSummary>(initialSummary);
   const [loadingSummary, setLoadingSummary] = useState(false);

   /**
    * Fetches the full financial summary from the API based on the selected period.
    * @param selectedMonth - The month to fetch.
    * @param selectedYear - The year to fetch.
    */
   async function loadSummary(selectedMonth: string, selectedYear: number) {
      setLoadingSummary(true);
      try {
         const res = await fetchFullSummary(selectedMonth, String(selectedYear));
         setSummary(res);
      } catch (err) {
         console.error('Failed to load summary data:', err);
      } finally {
         setLoadingSummary(false);
      }
   }

   useEffect(() => {
      loadSummary(month, year);

      // Persist the selected period to sessionStorage
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
 * Custom hook to access the PeriodContext.
 * @returns The period state and the financial summary.
 */
export const usePeriod = () => useContext(PeriodContext);