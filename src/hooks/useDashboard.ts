import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'
import { listDashboardData } from '@/api/endpoints/dashboard';
import type { MonthlyBalanceHistory, CategorySummary, CreditCardSummary } from '@/types/Dashboard';

export function useDashboard(month: string, year: string) {
   const location = useLocation();
   const enabled = ['/dashboard', '/'].includes(location.pathname)

   const { data: dashboard, isLoading, isError } = useQuery<{
      monthlyBalance: MonthlyBalanceHistory[];
      topCategories: CategorySummary[];
      cardsSummary: CreditCardSummary[];
   }>({
      queryKey: ['dashboard', month, year],
      queryFn: () => listDashboardData(month, String(year)),
      staleTime: Infinity,
      enabled
   });

   return {
      dashboard: dashboard ?? { monthlyBalance: [], topCategories: [], cardsSummary: [] },
      isLoading,
      isError
   }
}