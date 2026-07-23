import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '../shared/api';

const SECOND = 1_000;

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  if (error instanceof ApiError && error.status && error.status >= 400 && error.status < 500) {
    return false;
  }

  return true;
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        retry: 0,
      },
      queries: {
        gcTime: 5 * 60 * SECOND,
        refetchOnReconnect: true,
        retry: shouldRetryQuery,
        staleTime: 30 * SECOND,
      },
    },
  });
}
