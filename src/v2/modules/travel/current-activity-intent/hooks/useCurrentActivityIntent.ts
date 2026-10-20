import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { currentActivityIntentApi } from '../api/currentActivityIntentApi';
import type {
  CurrentActivityIntent,
  ReplaceCurrentActivityIntentBody,
} from '../model/currentActivityIntent.types';
import {
  currentActivityIntentQueryKeys,
  recommendationQueryKeys,
} from '../model/currentActivityIntentQueryKeys';

type CurrentActivityIntentApi = typeof currentActivityIntentApi;

export function createCurrentActivityIntentQueryOptions(
  api: Pick<CurrentActivityIntentApi, 'getCurrentActivityIntent'> = currentActivityIntentApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.getCurrentActivityIntent(signal),
    queryKey: currentActivityIntentQueryKeys.mine(),
  };
}

export function createReplaceCurrentActivityIntentMutationOptions(
  api: Pick<CurrentActivityIntentApi, 'replaceCurrentActivityIntent'> = currentActivityIntentApi,
) {
  return {
    mutationFn: (body: ReplaceCurrentActivityIntentBody) =>
      api.replaceCurrentActivityIntent(body),
  };
}

export function createClearCurrentActivityIntentMutationOptions(
  api: Pick<CurrentActivityIntentApi, 'clearCurrentActivityIntent'> = currentActivityIntentApi,
) {
  return {
    mutationFn: () => api.clearCurrentActivityIntent(),
  };
}

export async function refreshCachesAfterCurrentActivityIntentReplace(
  queryClient: QueryClient,
  intent: CurrentActivityIntent,
) {
  queryClient.setQueryData(currentActivityIntentQueryKeys.mine(), intent);
  await queryClient.invalidateQueries({ queryKey: recommendationQueryKeys.all });
}

export async function refreshCachesAfterCurrentActivityIntentClear(
  queryClient: QueryClient,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      exact: true,
      queryKey: currentActivityIntentQueryKeys.mine(),
    }),
    queryClient.invalidateQueries({ queryKey: recommendationQueryKeys.all }),
  ]);
}

/** Backward-compatible entry point for recommendation integrations. */
export async function refreshCurrentActivityIntentCaches(
  queryClient: QueryClient,
  intent?: CurrentActivityIntent,
) {
  if (intent) {
    await refreshCachesAfterCurrentActivityIntentReplace(queryClient, intent);
    return;
  }

  await refreshCachesAfterCurrentActivityIntentClear(queryClient);
}

export function useCurrentActivityIntent() {
  return useQuery(createCurrentActivityIntentQueryOptions());
}

export function useReplaceCurrentActivityIntent() {
  const queryClient = useQueryClient();

  return useMutation({
    ...createReplaceCurrentActivityIntentMutationOptions(),
    onSuccess: async (intent) =>
      refreshCachesAfterCurrentActivityIntentReplace(queryClient, intent),
  });
}

export function useClearCurrentActivityIntent() {
  const queryClient = useQueryClient();

  return useMutation({
    ...createClearCurrentActivityIntentMutationOptions(),
    onSuccess: async () => refreshCachesAfterCurrentActivityIntentClear(queryClient),
  });
}
