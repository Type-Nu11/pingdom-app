import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { currentActivityIntentApi } from '../api/currentActivityIntentApi';
import type { CurrentActivityIntent, ReplaceCurrentActivityIntentBody } from '../model/currentActivityIntent.types';
import { currentActivityIntentQueryKeys, recommendationQueryKeys } from '../model/currentActivityIntentQueryKeys';

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
  return { mutationFn: (body: ReplaceCurrentActivityIntentBody) => api.replaceCurrentActivityIntent(body) };
}

export function createClearCurrentActivityIntentMutationOptions(
  api: Pick<CurrentActivityIntentApi, 'clearCurrentActivityIntent'> = currentActivityIntentApi,
) {
  return { mutationFn: () => api.clearCurrentActivityIntent() };
}

export async function refreshCurrentActivityIntentCaches(
  queryClient: QueryClient,
  intent?: CurrentActivityIntent,
) {
  if (intent) queryClient.setQueryData(currentActivityIntentQueryKeys.mine(), intent);
  else await queryClient.invalidateQueries({ exact: true, queryKey: currentActivityIntentQueryKeys.mine() });
  await queryClient.invalidateQueries({ queryKey: recommendationQueryKeys.all });
}

export function useCurrentActivityIntent() {
  return useQuery(createCurrentActivityIntentQueryOptions());
}

export function useReplaceCurrentActivityIntent() {
  const queryClient = useQueryClient();
  return useMutation({
    ...createReplaceCurrentActivityIntentMutationOptions(),
    onSuccess: (intent) => refreshCurrentActivityIntentCaches(queryClient, intent),
  });
}

export function useClearCurrentActivityIntent() {
  const queryClient = useQueryClient();
  return useMutation({
    ...createClearCurrentActivityIntentMutationOptions(),
    onSuccess: () => refreshCurrentActivityIntentCaches(queryClient),
  });
}
