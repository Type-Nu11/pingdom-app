import { QueryClient } from '@tanstack/react-query';

const SECOND = 1_000;

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        retry: 0,
      },
      queries: {
        gcTime: 5 * 60 * SECOND,
        refetchOnReconnect: true,
        retry: 1,
        staleTime: 30 * SECOND,
      },
    },
  });
}
