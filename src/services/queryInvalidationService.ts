import { QueryClient } from '@tanstack/react-query'

export function invalidateSummaryAndDashboardCache(queryClient: QueryClient) {
   queryClient.invalidateQueries({
      queryKey: ['summary'],
      exact: false
   })

   queryClient.invalidateQueries({
      queryKey: ['dashboard'],
      exact: false
   })
}