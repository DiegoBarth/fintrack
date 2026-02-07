import { createListCache } from './ListCache'
import type { Commitment } from '../types/Commitment';

export const commitmentsCache = createListCache<Commitment>();