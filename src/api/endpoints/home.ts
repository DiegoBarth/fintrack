import type { Commitment } from '@/types/Commitment';
import type { Expense } from '@/types/Expense';
import type { Income } from '@/types/Income';
import type { FullSummary } from '@/types/FullSummary';
import { apiGet } from '@/api/client';

export interface AppData {
   commitments: Commitment[];
   incomes: Income[];
   expenses: Expense[];
}

export function verifyEmailAuthorization(email: string) {
   return apiGet({
      acao: 'verifyEmailAuthorization',
      email
   });
}

export function fetchFullSummary(month: string, year: string) {
   return apiGet<FullSummary>({
      action: 'getFullSummary',
      month,
      year
   });
}

export function fetchAllData(month: string, year: string) {
   return apiGet<AppData>({
      action: 'fetchAllData',
      month,
      year
   });
}