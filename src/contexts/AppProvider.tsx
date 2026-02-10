import type { ReactNode } from 'react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PeriodProvider } from '@/contexts/PeriodContext';
import { QUERY_STALE_TIME_MS } from '@/config/constants';

export function createQueryClient() {
   return new QueryClient({
      defaultOptions: {
         queries: {
            staleTime: QUERY_STALE_TIME_MS,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false
         }
      }
   });
}

interface AppProviderProps {
   children: ReactNode;
   client?: QueryClient;
}

export function AppProvider({ children, client }: AppProviderProps) {
   const [internalClient] = useState(createQueryClient);
   const queryClient = client ?? internalClient;

   return (
      <QueryClientProvider client={queryClient}>
         <PeriodProvider>
            {children}
         </PeriodProvider>
         <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
   );
}