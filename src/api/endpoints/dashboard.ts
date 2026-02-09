import { apiGet } from '@/api/client';
import type { CategorySummary, MonthlyBalanceHistory, CreditCardSummary } from '@/types/Dashboard';

export function listMonthlyBalance(year: string) {
   return apiGet<MonthlyBalanceHistory[]>({
      action: 'getMonthlyBalance',
      year
   });
}

export function listTopCategories(month: string, year: string) {
   return apiGet<CategorySummary[]>({
      action: 'getTopCategories',
      month,
      year
   });
}

export function listCardsSummary(month: string, year: string) {
   return apiGet<CreditCardSummary[]>({
      action: 'getCreditCardsSummary',
      month,
      year
   });
}