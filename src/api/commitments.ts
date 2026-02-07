import { apiGet, apiPost } from './client';
import type { Commitment } from '../types/Commitment';
import { commitmentsCache } from '../cache/CommitmentsCache';

export async function listCommitments(month: string, year: string) {
   const cached = commitmentsCache.get(month, year);
   if (cached) return cached;

   const data = await apiGet<Commitment[]>({
      action: 'listCommitments',
      month,
      year
   });

   commitmentsCache.set(month, year, data);

   return data;
}

export function createCommitment(payload: {
   description: string;
   category: string;
   type: 'fixed' | 'variable';
   amount: number;
}) {
   return apiPost({
      action: 'createCommitment',
      ...payload
   });
}

export async function deleteCommitment(rowIndex: number, month: string, year: string) {
   const res = await apiPost({
      action: 'deleteCommitment',
      rowIndex
   });

   commitmentsCache.remove(month, year, rowIndex);

   return res;
}

export async function updateCommitment(payload: {
   rowIndex: number;
   amount: number;
   paymentDate: string;
}, month: string, year: string) {
   const res = await apiPost({
      action: 'updateCommitment',
      ...payload
   });

   commitmentsCache.update(month, year, payload)

   return res;
}

export function createCard(payload: {
   description: string;
   category: string;
   card: string;
   totalAmount: number;
   installments: number;
   dueDate: string;
}, month: string, year: string) {
   console.log(month, year);
   return apiPost({
      action: 'createCard',
      ...payload
   });
}