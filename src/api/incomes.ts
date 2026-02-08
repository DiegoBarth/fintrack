import { apiGet, apiPost } from './client';
import type { Income } from '../types/Income';
import { incomesCache } from '../cache/IncomesCache';
import { formatDateBR } from '../utils/formatters';

export async function createIncome(payload: {
   expectedDate: string;
   receivedDate: string;
   description: string;
   amount: number;
}) {
   const res = await apiPost<Income>({
      action: 'createIncome',
      ...payload
   });

   incomesCache.add(res, 'expectedDate');

   return res;
}

export async function listIncomes(month: string, year: string) {
   const cached = incomesCache.get(month, year);
   if (cached) return cached;

   const data = await apiGet<Income[]>({
      action: 'listIncomes',
      month,
      year
   });

   incomesCache.set(month, year, data);

   return data;
}

export async function deleteIncome(rowIndex: number, month: string, year: string) {
   const res = await apiPost({
      action: 'deleteIncome',
      rowIndex
   });

   incomesCache.remove(month, year, rowIndex);

   return res;
}

export async function updateIncome(payload: {
   rowIndex: number;
   amount: number;
   receivedDate: string;
}, month: string, year: string) {
   const res = await apiPost({
      action: 'updateIncome',
      ...payload
   });

   payload.receivedDate = formatDateBR(payload.receivedDate);

   incomesCache.update(month, year, payload);

   return res;
}