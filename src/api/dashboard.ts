import { apiGet } from './client';
import type {
   CategorySummary,
   MonthlyBalanceHistory,
   CreditCardSummary
} from '../types/Dashboard';

export function fetchMonthlyBalance(year: string) {
   return apiGet<MonthlyBalanceHistory[]>({
      action: 'getMonthlyBalance',
      year
   });
}

export function fetchTopCategories(month: string, year: string) {
   return apiGet<CategorySummary[]>({
      action: 'getTopCategories',
      month,
      year
   });
}

export function fetchCreditCardsSummary(month: string, year: string) {
   return apiGet<CreditCardSummary[]>({
      action: 'getCreditCardsSummary',
      month,
      year
   });
}