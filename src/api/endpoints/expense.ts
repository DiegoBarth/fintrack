import { apiGet, apiPost } from '@/api/client';
import type { Expense } from '@/types/Expense';

export function createExpense(payload: {
   description: string;
   category: string;
   amount: number | string;
   paymentDate: string;
}) {
   return apiPost<Expense>({
      action: 'createExpense',
      ...payload
   });
}

export function listExpenses(month: string, year: string) {
   return apiGet<Expense[]>({
      action: 'listExpenses',
      month,
      year
   });
}

export function deleteExpense(rowIndex: number) {
   return apiPost({
      action: 'deleteExpense',
      rowIndex
   });
}

export function updateExpense(payload: {
   rowIndex: number;
   amount: number;
}) {
   return apiPost({
      action: 'updateExpense',
      ...payload
   });
}