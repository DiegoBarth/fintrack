import { listDashboardData } from '@/api/endpoints/dashboard'
import type { MonthlyBalanceHistory, CategorySummary, CreditCardSummary } from '@/types/Dashboard'

export type DashboardResponse = {
  monthlyBalance: MonthlyBalanceHistory[]
  topCategories: CategorySummary[]
  cardsSummary: CreditCardSummary[]
}

export const getDashboardQueryOptions = (month: string, year: string) => ({
  queryKey: ['dashboard', month, year],
  queryFn: () => listDashboardData(month, String(year)),
  staleTime: Infinity
})