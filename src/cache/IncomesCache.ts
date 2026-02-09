import type { Income } from '@/types/Income';
import { createListCache } from "./ListCache";

export const incomesCache = createListCache<Income>();