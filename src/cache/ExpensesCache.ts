import type { Expense } from '@/types/Expense';
import { createListCache } from "./ListCache";

export const expensesCache = createListCache<Expense>();