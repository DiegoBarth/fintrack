import { apiGet, apiPost } from '@/api/client';
import { expensesCache } from '@/cache/ExpensesCache';
import type { Expense } from '@/types/Expense';

export async function createExpense(payload: {
   date: string;
   description: string;
   category: string;
   amount: number;
}) {
   const res = await apiPost<Expense>({
      action: 'createExpense',
      ...payload
   });

   expensesCache.add(res, 'paymentDate');

   return res;
}

export async function listExpenses(month: string, year: string) {
   const cached = expensesCache.get(month, year);
   if (cached) return cached;

   const data = await apiGet<Expense[]>({
      action: 'listExpenses',
      month,
      year
   });

   expensesCache.set(month, year, data);

   return data;
}

export async function deleteExpense(rowIndex: number, month: string, year: string) {
   const res = await apiPost({
      action: 'deleteExpense',
      rowIndex
   });

   expensesCache.remove(month, year, rowIndex);

   return res;
}

export async function updateExpense(payload: {
   rowIndex: number;
   amount: number;
}, month: string, year: string) {
   const res = await apiPost({
      action: 'updateExpense',
      ...payload
   });

   expensesCache.update(month, year, payload);

   return res;
}