import type { Commitment } from '@/types/Commitment';
import { createListCache } from './ListCache'

export const commitmentsCache = createListCache<Commitment>();