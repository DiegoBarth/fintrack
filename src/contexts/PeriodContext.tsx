import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useSummary } from '@/hooks/useSummary';
import type { FullSummary } from '@/types/FullSummary';

interface PeriodContextType {
   month: string;
   setMonth: (month: string) => void;
   year: number;
   setYear: (year: number) => void;
   summary: FullSummary | null;
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
   month: '',
   setMonth: () => { },
   year: 0,
   setYear: () => { },
   summary: null,
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