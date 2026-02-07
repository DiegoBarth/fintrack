import { createListCache } from "./ListCache";
import type { Income } from '../types/Income';

export const incomesCache = createListCache<Income>();