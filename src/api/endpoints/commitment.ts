import { apiGet, apiPost } from '@/api/client';
import type { Commitment } from '@/types/Commitment';
import { formatDateBR } from '@/utils/formatters';

export function listCommitments(month: string, year: string) {
   return apiGet<Commitment[]>({
      action: 'listCommitments',
      month,
      year
   });
}

export function createCommitment(payload: {
   description: string;
   category: string;
   type: 'Fixed' | 'Variable';
   amount: number;
   dueDate: string;
   months?: number;
}) {
   return apiPost<Commitment[]>({
      action: 'createCommitment',
      ...payload
   });
}

export function createCard(payload: {
   description: string;
   category: string;
   card?: string;
   amount: number;
   type: string;
   installments?: number;
   dueDate: string;
}) {
   return apiPost<Commitment[]>({
      action: 'createCard',
      ...payload
   });
}

export function deleteCommitment(rowIndex: number, scope: 'single' | 'future' | 'all' = 'single'
) {
   return apiPost({
      action: 'deleteCommitment',
      rowIndex,
      scope
   });
}

export async function updateCommitment(
   payload: { rowIndex: number; amount: number; paymentDate: string; scope?: 'single' | 'future' }
) {
   const res = await apiPost({
      action: 'updateCommitment',
      ...payload
   });

   payload.paymentDate = payload.paymentDate ? formatDateBR(payload.paymentDate) : '';

   return res;
}