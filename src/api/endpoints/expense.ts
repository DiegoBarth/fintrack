import { apiGet, apiPost } from '@/api/client';
import type { Expense } from '@/types/Expense';
import { sanitizeText } from '@/utils/sanitizers'

export function createExpense(payload: {
   description: string;
   category: string;
   amount: number | string;
   paymentDate: string;
}) {
   const sanitizedPayload = {
      ...payload,
      description: sanitizeText(payload.description),
      category: sanitizeText(payload.category)
   };

   return apiPost<Expense>({
      action: 'createExpense',
      ...sanitizedPayload
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
   return apiPost<Expense>({
      action: 'deleteExpense',
      rowIndex
   });
}

export function updateExpense(payload: {
   rowIndex: number;
   amount: number;
}) {
   return apiPost<Expense>({
      action: 'updateExpense',
      ...payload
   });
}