import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fetchFullSummary } from '../api/home';
import type { FullSummary } from '../types/FullSummary';

interface PeriodContextType {
   month: string;
   setMonth: (month: string) => void;
   year: number;
   setYear: (year: number) => void;
   summary: FullSummary;
   loadingSummary: boolean;
   refreshSummary: () => Promise<void>;
}

const today = new Date();
const currentMonth = String(today.getMonth() + 1);
const currentYear = today.getFullYear();

const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

export function PeriodProvider({ children }: { children: ReactNode }) {
   const savedPeriod = localStorage.getItem('app_period');
   const initialPeriod = savedPeriod
      ? JSON.parse(savedPeriod)
      : { month: currentMonth, year: currentYear };

   const [month, setMonth] = useState<string>(initialPeriod.month);
   const [year, setYear] = useState<number>(initialPeriod.year);

   const initialSummary: FullSummary = {
      totalIncomes: 0,
      totalExpenses: 0,
      totalCommitments: 0,
      totalReceivedAmount: 0,
      totalPaidExpenses: 0,
      totalPaidCommitments: 0,
      totalReceivedInMonth: 0,
      totalPaidExpensesInMonth: 0,
      totalPaidCommitmentsInMonth: 0
   };

   const [summary, setSummary] = useState<FullSummary>(initialSummary);
   const [loadingSummary, setLoadingSummary] = useState(false);

   async function loadSummary() {
      setLoadingSummary(true);
      try {
         const res = await fetchFullSummary(month, String(year));
         setSummary(res);
      } catch (err) {
         console.error('Failed to load financial summary:', err);
      } finally {
         setLoadingSummary(false);
      }
   }

   useEffect(() => {
      loadSummary();
      localStorage.setItem('app_period', JSON.stringify({ month, year }));
   }, [month, year]);

   return (
      <PeriodContext.Provider
         value={{
            month,
            setMonth,
            year,
            setYear,
            summary,
            loadingSummary,
            refreshSummary: loadSummary
         }}
      >
         {children}
      </PeriodContext.Provider>
   );
}

export const usePeriod = () => {
   const context = useContext(PeriodContext);
   if (!context) {
      throw new Error('usePeriod must be used within a PeriodProvider');
   }
   return context;
};