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

/**
 * Context Interface - defines all globally accessible values
 * * Responsibilities:
 * - Selected period state (month/year)
 * - Methods to change the period
 * - Consolidated data for the period (income, expenses, etc.)
 * - Loading states for synchronization between components
 */
interface PeriodContextType {
   // ===== Period State =====
   month: string;                      // Month in "1"-"12" format
   setMonth: (month: string) => void;  // Reactive setter
   year: number;                       // Full year (2025)
   setYear: (year: number) => void;    // Reactive setter

   // ===== Period Data =====
   summary: FullSummary | null;           // Consolidated summary
   incomes: Income[] | null;              // List of income records
   expenses: Expense[] | null;            // List of expenses
   commitments: Commitment[] | null;      // Financial obligations
   alertCommitments: Commitment[] | null; // Commitments nearing due date
   dashboard: Dashboard | null;           // Dashboard data

   // ===== Synchronization States =====
   isLoading: boolean;    // True if any query is currently loading
}

/**
 * Default Context
 * Initial values to prevent undefined when used outside the Provider
 */
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
 * Retrieves the saved period from sessionStorage or returns the current month/year
 * * Benefit: Allows the user to return to the same period after a page refresh
 * sessionStorage is preferable to localStorage as it is cleared when the tab is closed
 * * @returns Object containing the initial month and year
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

/**
 * Context Provider
 * * Responsibilities:
 * 1. Manages global period state (month/year)
 * 2. Fetches data for the selected period (using all feature hooks)
 * 3. Saves period to sessionStorage for persistence between reloads
 * 4. Provides consolidated states for loading synchronization
 * * Data Flow:
 * - User changes month/year
 * - useEffect detects the change
 * - sessionStorage is updated
 * - Hooks detect the query key has changed
 * - New data is fetched
 * - Context updates value
 * - Subscribed components receive new value
 * * @example
 * <PeriodoProvider>
 * <App />
 * </PeriodoProvider>
 */
export function PeriodProvider({ children }: { children: ReactNode }) {
   // ===== Retrieve Initial Period =====
   const initialPeriod = getInitialPeriod();

   // ===== Reactive State =====
   // These changes trigger a re-render of the Provider and all subscribers
   const [month, setMonth] = useState<string>(initialPeriod.month);
   const [year, setYear] = useState<number>(initialPeriod.year);

   // ===== Fetch Period Data =====
   // Each hook monitors month/year and refetches whenever they change
   // All hooks use TanStack React Query with automatic caching
   const { summary, isLoading } = useSummary(month, String(year))
   const { incomes } = useIncome(month, String(year))
   const { expenses } = useExpense(month, String(year))
   const { commitments } = useCommitment(month, String(year))

   // Note: alertCommitments fetches 'all' months but filters by year
   // This allows alerts to appear even when viewing other months
   const { alertCommitments } = useCommitment('all', String(year), 'alerts')
   const { dashboard } = useDashboard(month, String(year))

   // ===== Period Persistence =====
   // Saves current period to sessionStorage
   // useEffect with [month, year] dependency prevents infinite loops
   // Executes AFTER render (non-blocking)
   useEffect(() => {
      sessionStorage.setItem(
         'period',
         JSON.stringify({ month, year })
      );
   }, [month, year]);

   // ===== Provider Render =====
   // Value is a new object on every render (even if values are identical)
   // To optimize, useMemo could be used:
   // const value = useMemo(() => ({ month, setMonth, ... }), [month, year, ...])
   // However, for this application, the overhead is minimal
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
 * Custom hook to consume PeriodoContext
 * * Benefit: Automatic typing + error handling if used outside the Provider
 * * @example
 * const { month, setMonth, expenses } = usePeriodo();
 * * @throws Error if used outside of PeriodoProvider
 */
export const usePeriod = () => useContext(PeriodContext);