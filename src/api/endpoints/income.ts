import { apiGet, apiPost } from '@/api/client';
import type { Income } from '@/types/Income';
import { sanitizeText } from '@/utils/sanitizers'

export function createIncome(payload: {
  expectedDate: string;
  receivedDate?: string | null;
  referenceMonth: string;
  description: string;
  amount: number | string;
}) {
  const sanitizedPayload = {
    ...payload,
    description: sanitizeText(payload.description)
  };

  return apiPost<Income[]>({
    action: 'createIncome',
    ...sanitizedPayload
  });
}

export function listIncomes(year: string) {
  return apiGet<Income[]>({
    action: 'listIncomes',
    year
  });
}

export function deleteIncome(rowIndex: number, scope?: 'single' | 'future') {
  return apiPost({
    action: 'deleteIncome',
    rowIndex,
    scope: scope || 'single'
  });
}

export async function updateIncome(payload: {
  rowIndex: number;
  amount: number;
  receivedDate?: string | null;
  scope?: 'single' | 'future';
}) {
  const res = await apiPost<Income[]>({
    action: 'updateIncome',
    ...payload
  });

  return res;
}