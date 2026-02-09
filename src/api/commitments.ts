import { apiGet, apiPost } from './client';
import type { Commitment } from '../types/Commitment';
import { commitmentsCache } from '../cache/CommitmentsCache';
import { formatDateBR } from '../utils/formatters';

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

export async function createCommitment(payload: {
   description: string;
   category: string;
   type: 'Fixed' | 'Variable';
   amount: number;
   dueDate: string;
   months?: number;
}) {
   const res = await apiPost<Commitment[]>({
      action: 'createCommitment',
      ...payload
   });

   res.forEach(p => commitmentsCache.add(p, 'dueDate'));

   return res;
}

export async function createCard(payload: {
   description: string;
   category: string;
   card: string;
   totalAmount: number;
   type: string;
   installments: number;
   dueDate: string;
}) {
   const res = await apiPost<Commitment[]>({
      action: 'createCard',
      ...payload
   });

   res.forEach(p => commitmentsCache.add(p, 'dueDate'));

   return res;
}

export async function deleteCommitment(rowIndex: number, month: string, year: string, scope: 'single' | 'future' | 'all' = 'single'
) {
   const res = await apiPost({
      action: 'deleteCommitment',
      rowIndex,
      scope
   });

   commitmentsCache.remove(month, year, rowIndex);

   return res;
}

export async function updateCommitment(
   payload: { rowIndex: number; amount: number; paymentDate: string; scope?: 'single' | 'future' },
   month: string,
   year: string
) {
   const res = await apiPost({
      action: 'updateCommitment',
      ...payload
   });

   payload.paymentDate = payload.paymentDate ? formatDateBR(payload.paymentDate) : '';

   commitmentsCache.update(month, year, payload)

   return res;
}