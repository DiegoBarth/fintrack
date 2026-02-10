import { useQuery } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom';
import { fetchFullSummary } from '@/api/endpoints/home';

export function useSummary(month: string, year: string) {
   const queryKey = ['summary', month, year]
   const location = useLocation();
   const enabled = location.pathname === '/'

   const { data: summary = null, isLoading, isError } = useQuery({
      queryKey,
      queryFn: () => fetchFullSummary(month, String(year)),
      enabled
   })

   return {
      summary,
      isLoading,
      isError
   }
}