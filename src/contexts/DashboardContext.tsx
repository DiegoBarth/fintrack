import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
   listMonthlyBalance,
   listTopCategories,
   listCardsSummary
} from '@/api/endpoints/dashboard';
import { listIncomes } from '@/api/endpoints/incomes';
import { listExpenses } from '@/api/endpoints/expenses';
import { listCommitments } from '@/api/endpoints/commitments';

import type { MonthlyBalanceHistory, CategorySummary, CreditCardSummary } from '@/types/Dashboard';
import type { FullSummary } from '@/types/FullSummary';
import type { Income } from '@/types/Income';
import type { Expense } from '@/types/Expense';
import type { Commitment } from '@/types/Commitment';
import { usePeriod } from '@/contexts/PeriodContext';

interface DashboardContextType {
   yearlyBalance: MonthlyBalanceHistory[];
   topCategories: CategorySummary[];
   cards: CreditCardSummary[];
   incomes: Income[];
   expenses: Expense[];
   commitments: Commitment[];
   summary: FullSummary | null;
   loading: boolean;
}

const DashboardContext = createContext<DashboardContextType>(
   {} as DashboardContextType
);

/**
 * Provider that aggregates dashboard data using TanStack Query for caching and synchronization.
 * It provides a unified loading state for all essential dashboard metrics.
 */
export function DashboardProvider({ children }: { children: React.ReactNode }) {
   const { month, year, summary } = usePeriod();

   // Yearly Balance History
   const { data: yearlyBalance = [], isLoading: loadingBalance } = useQuery({
      queryKey: ['dashboard', 'balance', year],
      queryFn: () => listMonthlyBalance(String(year)),
      placeholderData: (previous) => previous ?? []
   });

   // Top Spending Categories
   const { data: topCategories = [], isLoading: loadingTop } = useQuery({
      queryKey: ['dashboard', 'topCategories', month, year],
      queryFn: () => listTopCategories(month, String(year)),
      placeholderData: (previous) => previous ?? []
   });

   // Credit Cards Summary
   const { data: cards = [], isLoading: loadingCards } = useQuery({
      queryKey: ['dashboard', 'cards', month, year],
      queryFn: () => listCardsSummary(month, String(year)),
      placeholderData: (previous) => previous ?? []
   });

   // Detailed Lists (Incomes, Expenses, Commitments)
   const { data: incomes = [], isLoading: loadingIncomes } = useQuery({
      queryKey: ['incomes', month, year],
      queryFn: () => listIncomes(month, String(year)),
      placeholderData: (previous) => previous ?? []
   });

   const { data: commitments = [], isLoading: loadingCommitments } = useQuery({
      queryKey: ['commitments', month, year],
      queryFn: () => listCommitments(month, String(year)),
      placeholderData: (previous) => previous ?? []
   });

   const { data: expenses = [], isLoading: loadingExpenses } = useQuery({
      queryKey: ['expenses', month, year],
      queryFn: () => listExpenses(month, String(year)),
      placeholderData: (previous) => previous ?? []
   });

   const isLoading =
      loadingBalance ||
      loadingTop ||
      loadingCards ||
      loadingIncomes ||
      loadingExpenses ||
      loadingCommitments;

   return (
      <DashboardContext.Provider
         value={{
            yearlyBalance,
            topCategories,
            cards,
            incomes,
            expenses,
            commitments,
            summary,
            loading: isLoading
         }}
      >
         {children}
      </DashboardContext.Provider>
   );
}

/**
 * Hook to access dashboard metrics, unified lists, and loading states.
 */
export function useDashboard() {
   return useContext(DashboardContext);
}