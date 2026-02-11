import { apiGet } from '@/api/client';
import type { CategorySummary, MonthlyBalanceHistory, CreditCardSummary } from '@/types/Dashboard';

export function listDashboardData(month: string, year: string) {
   return apiGet<{
      monthlyBalance: MonthlyBalanceHistory[];
      topCategories: CategorySummary[];
      cardsSummary: CreditCardSummary[];
   }>({
      action: 'listDashboardData',
      month,
      year
   });
}