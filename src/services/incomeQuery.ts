import { listIncomes } from '@/api/endpoints/income'

export const incomesQueryKey = (year: string) => ['incomes', year] as const

export const getIncomesQueryOptions = (year: string) => ({
  queryKey: incomesQueryKey(year),
  queryFn: () => listIncomes(year),
  staleTime: Infinity,
  retry: 1
})