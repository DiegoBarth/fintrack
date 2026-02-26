import { listExpenses } from '@/api/endpoints/expense'

export const expensesQueryKey = (year: string) => ['expenses', year] as const

export const getExpensesQueryOptions = (year: string) => ({
  queryKey: expensesQueryKey(year),
  queryFn: () => listExpenses(String(year)),
  staleTime: Infinity,
  retry: 1
})