import { createListCache } from "./ListCache";
import type { Expense } from '../types/Expense';

export const expensesCache = createListCache<Expense>();