import { apiGet, apiPost } from '@/api/client';
import type { Commitment } from '@/types/Commitment';
import { formatDateBR } from '@/utils/formatters';
import { sanitizeText } from '@/utils/sanitizers'

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
   type: 'Fixo' | 'Variável';
   amount: number;
   dueDate: string;
   months?: number;
   referenceMonth: string;
}) {
   const sanitizedPayload = {
      ...payload,
      description: sanitizeText(payload.description),
      category: sanitizeText(payload.category),
      type: sanitizeText(payload.type)
   };
   return apiPost<Commitment[]>({
      action: 'createCommitment',
      ...sanitizedPayload
   });
}

export function createCard(payload: {
   description: string;
   category: string;
   card?: string;
   amount: number | string;
   type: string;
   installments?: number;
   dueDate: string;
   referenceMonth: string;
}) {
   const payloadSanitizado = {
      ...payload,
      description: sanitizeText(payload.description),
      category: sanitizeText(payload.category),
      card: payload.card ? sanitizeText(payload.card) : undefined,
      type: sanitizeText(payload.type)
   };

   return apiPost<Commitment[]>({
      action: 'createCard',
      ...payloadSanitizado
   });
}

export function deleteCommitment(rowIndex: number, scope: 'single' | 'future' | 'all' = 'single'
) {
   return apiPost<Commitment[]>({
      action: 'deleteCommitment',
      rowIndex,
      scope
   });
}

export async function updateCommitment(
   payload: { rowIndex: number; amount: number; paymentDate: string; scope?: 'single' | 'future' }
) {
   const res = await apiPost<Commitment[]>({
      action: 'updateCommitment',
      ...payload
   });

   payload.paymentDate = payload.paymentDate ? formatDateBR(payload.paymentDate) : '';

   return res;
}