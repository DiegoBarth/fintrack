import { apiGet, apiPost } from '@/api/client';
import type { Income } from '@/types/Income';
import { formatDateBR } from '@/utils/formatters';

export function createIncome(payload: {
   expectedDate: string;
   receivedDate?: string | null;
   description: string;
   amount: number;
}) {
   return apiPost<Income>({
      action: 'createIncome',
      ...payload
   });
}

export function listIncomes(month: string, year: string) {
   return apiGet<Income[]>({
      action: 'listIncomes',
      month,
      year
   });
}

export function deleteIncome(rowIndex: number, month: string, year: string) {
   return apiPost({
      action: 'deleteIncome',
      rowIndex
   });
}

export async function updateIncome(payload: {
   rowIndex: number;
   amount: number;
   receivedDate?: string | null;
}) {
   const res = await apiPost({
      action: 'updateIncome',
      ...payload
   });

   payload.receivedDate = payload.receivedDate ? formatDateBR(payload.receivedDate) : '';

   return res;
}