import { listCommitments } from '@/api/endpoints/commitment'

export const commitmentsQueryKey = (year: string) => ['commitments', year] as const

export const getCommitmentsQueryOptions = (year: string) => ({
  queryKey: commitmentsQueryKey(year),
  queryFn: () => listCommitments(String(year)),
  staleTime: Infinity,
  retry: 1
})