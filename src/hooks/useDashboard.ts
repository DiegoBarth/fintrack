import { useQuery } from '@tanstack/react-query'
import { getDashboardQueryOptions } from '@/services/dashboardQuery';

export function useDashboard(month: string, year: string) {
   const { data: dashboard, isLoading, isError } = useQuery(getDashboardQueryOptions(month, year));

   return {
      dashboard: dashboard ?? { monthlyBalance: [], topCategories: [], cardsSummary: [] },
      isLoading,
      isError
   }
}