import { apiGet, apiPost } from './client';
import type { Income } from '../types/Income';

export function createIncome(payload: {
   expectedDate: string;
   receivedDate: string;
   description: string;
   amount: number;
}) {
   return apiPost({
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

export function deleteIncome(rowIndex: number) {
   return apiPost({
      action: 'deleteIncome',
      rowIndex
   });
}

export function updateIncome(payload: {
   rowIndex: number;
   amount: number;
   receivedDate: string;
}) {
   return apiPost({
      action: 'updateIncome',
      ...payload
   });
}