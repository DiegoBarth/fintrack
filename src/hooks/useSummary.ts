import { useQuery } from '@tanstack/react-query'
import { fetchFullSummary } from '@/api/endpoints/home';

export function useSummary(month: string, year: string) {
   const queryKey = ['summary', month, year]

   const { data: summary = null, isLoading, isError } = useQuery({
      queryKey,
      queryFn: () => fetchFullSummary(month, String(year))
   })

   return {
      summary,
      isLoading,
      isError
   }
}