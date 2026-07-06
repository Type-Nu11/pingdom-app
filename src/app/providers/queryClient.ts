import { QueryClient } from '@tanstack/react-query';

const QUERY_STALE_TIME = 1000 * 30;
const QUERY_GC_TIME = 1000 * 60 * 5;

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        retry: 0,
      },
      queries: {
        gcTime: QUERY_GC_TIME,
        refetchOnReconnect: true,
        retry: 1,
        staleTime: QUERY_STALE_TIME,
      },
    },
  });
}
