import { apiGet } from './client';
import type { FullSummary } from '../types/FullSummary';

export function fetchFullSummary(month: string, year: string) {
   return apiGet<FullSummary>({
      action: 'getFullSummary',
      month,
      year
   });
}