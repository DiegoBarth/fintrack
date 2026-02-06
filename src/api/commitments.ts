import { apiGet, apiPost } from './client';
import type { Commitment } from '../types/Commitment';

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
   type: 'fixed' | 'variable';
   amount: number;
}) {
   return apiPost({
      action: 'createCommitment',
      ...payload
   });
}

export function deleteCommitment(rowIndex: number) {
   return apiPost({
      action: 'deleteCommitment',
      rowIndex
   });
}

export function updateCommitment(payload: {
   rowIndex: number;
   amount: number;
   paymentDate: string;
}) {
   return apiPost({
      action: 'updateCommitment',
      ...payload
   });
}

export function createCard(payload: {
   description: string;
   category: string;
   card: string;
   totalAmount: number;
   installments: number;
   dueDate: string;
}) {
   return apiPost({
      action: 'createCard',
      ...payload
   });
}