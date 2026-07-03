import type { Commitment } from '@/types/Commitment';
import type { Expense } from '@/types/Expense';
import type { Income } from '@/types/Income';
import type { FullSummary } from '@/types/FullSummary';
import { apiGet, apiPost } from '@/api/client';

export interface AppData {
  commitments: Commitment[];
  incomes: Income[];
  expenses: Expense[];
}

export interface GeminiAdvisorResponse {
  success: boolean;
  answer?: string;
  error?: string;
}

export function verifyEmailAuthorization(email: string) {
  return apiGet({
    acao: 'verifyEmailAuthorization',
    email
  });
}

export function fetchFullSummary(month: string, year: string) {
  return apiGet<FullSummary>({
    action: 'getFullSummary',
    month,
    year
  });
}

export function fetchAllData(month: string, year: string) {
  return apiGet<AppData>({
    action: 'fetchAllData',
    month,
    year
  });
}

export function askGeminiAdvisor(prompt: string) {
  return apiPost<GeminiAdvisorResponse>({
    action: 'askGeminiAdvisor',
    prompt
  });
}