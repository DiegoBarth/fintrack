import { useQuery } from '@tanstack/react-query'
import { fetchFullSummary } from '@/api/endpoints/home';

/**
 * Hook to retrieve summary data for the selected period
 * * Responsibilities:
 * - Fetch consolidated data (complete financial summary)
 * - Only execute query when on the Home page (/)
 * - Provide loading and error states
 * * Optimizations:
 * - Query key includes month and year for granular caching
 * - enabled: false when outside the Home page (saves requests)
 * - Default data: null to prevent undefined errors
 * * @param month - Month as a string (e.g., "2")
 * @param year - Year as a string (e.g., "2025")
 * @returns Object containing the summary, loading, and error states
 * * @example
 * const { summary, isLoading, isError } = useSummary('2', '2025');
 * * if (isLoading) return <SkeletonLoader />;
 * if (isError) return <ErrorMessage />;
 * * return <SummaryCard summary={summary} />;
 */
export function useSummary(month: string, year: string) {
   // ===== Query Configuration =====
   // Cache Key: dynamic parameters must be included
   const queryKey = ['summary', month, year]

   // ===== TanStack React Query =====
   // Query responsibilities:
   // 1. Automatic data fetching
   // 2. Automatic caching
   // 3. Request deduplication
   // 4. Managed loading/error states
   const { data: summary = null, isLoading, isError } = useQuery({
      queryKey,
      queryFn: () => fetchFullSummary(month, String(year))
   })

   return {
      summary,   // Summary data for the period (null if not loaded)
      isLoading, // True while fetching
      isError    // True if the request failed
   }
}