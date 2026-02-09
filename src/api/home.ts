import { commitmentsCache } from '@/cache/CommitmentsCache';
import { expensesCache } from '@/cache/ExpensesCache';
import { incomesCache } from '@/cache/IncomesCache';
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

export async function fetchAllData(month: string, year: string) {
   const cachedIncomes =
      month === 'all'
         ? incomesCache.getAll()
         : incomesCache.get(month, year);

   const cachedExpenses =
      month === 'all'
         ? expensesCache.getAll()
         : expensesCache.get(month, year);


   const cachedCommitments =
      month === 'all'
         ? commitmentsCache.getAll()
         : commitmentsCache.get(month, year);

   if (cachedIncomes || cachedExpenses || cachedCommitments) {
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