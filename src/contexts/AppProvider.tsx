import type { ReactNode } from 'react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PeriodProvider } from '@/contexts/PeriodContext';
import { QUERY_STALE_TIME_MS } from '@/config/constants';
import { ThemeProvider } from '@/contexts/ThemeContext';

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
         <ThemeProvider>
            <PeriodProvider>
               {children}
            </PeriodProvider>
         </ThemeProvider>
      </QueryClientProvider>
   );
}