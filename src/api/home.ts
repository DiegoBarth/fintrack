import { apiGet } from './client';
import type { FullSummary } from '../types/FullSummary';
import type { Commitment } from '../types/Commitment';
import type { Income } from '../types/Income';
import type { Expense } from '../types/Expense';
import { commitmentsCache } from '../cache/CommitmentsCache';
import { incomesCache } from '../cache/IncomesCache';
import { expensesCache } from '../cache/ExpensesCache';

export interface AppData {
   commitments: Commitment[];
   incomes: Income[];
   expenses: Expense[];
}

export function fetchFullSummary(month: string, year: string) {
   return apiGet<FullSummary>({
      action: 'getFullSummary',
      month,
      year
   });
}

export async function fetchAllData(month: string, year: string) {
   const cachedCommitments = commitmentsCache.get(month, year);
   const cachedIncomes = incomesCache.get(month, year);
   const cachedExpenses = expensesCache.get(month, year);

   if (cachedCommitments && cachedIncomes && cachedExpenses) {
      return {
         commitments: cachedCommitments,
         incomes: cachedIncomes,
         expenses: cachedExpenses
      };
   }

   const response = await apiGet<AppData>({
      action: 'fetchAllData',
      month,
      year
   });

   response.commitments?.forEach(c => commitmentsCache.add(c, 'dueDate'));
   response.incomes?.forEach(r => incomesCache.add(r, 'expectedDate'));
   response.expenses?.forEach(g => expensesCache.add(g, 'paymentDate'));

   return response;
}