import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { travelPurposeApi } from '../api/travelPurposeApi';
import type {
  ReplaceTravelPurposesBody,
  TravelPurposePreference,
} from '../model/travelPurpose.types';
import {
  recommendationQueryKeys,
  travelPurposeQueryKeys,
  userQueryKeys,
} from '../model/travelPurposeQueryKeys';

export {
  recommendationQueryKeys,
  travelPurposeQueryKeys,
  userQueryKeys,
} from '../model/travelPurposeQueryKeys';

type TravelPurposeApi = typeof travelPurposeApi;

export function createTravelPurposeQueryOptions(
  api: Pick<TravelPurposeApi, 'getTravelPurposes'> = travelPurposeApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.getTravelPurposes(signal),
    queryKey: travelPurposeQueryKeys.mine(),
  };
}

export function createReplaceTravelPurposesMutationOptions(
  api: Pick<TravelPurposeApi, 'replaceTravelPurposes'> = travelPurposeApi,
) {
  return {
    mutationFn: (body: ReplaceTravelPurposesBody) => api.replaceTravelPurposes(body),
  };
}

export async function refreshPersonalizationCaches(
  queryClient: QueryClient,
  preference: TravelPurposePreference,
) {
  queryClient.setQueryData(travelPurposeQueryKeys.mine(), preference);

  await Promise.all([
    queryClient.invalidateQueries({ exact: true, queryKey: userQueryKeys.me() }),
    queryClient.invalidateQueries({ queryKey: recommendationQueryKeys.all }),
  ]);
}

export function useTravelPurposes() {
  return useQuery(createTravelPurposeQueryOptions());
}

export function useReplaceTravelPurposes() {
  const queryClient = useQueryClient();

  return useMutation({
    ...createReplaceTravelPurposesMutationOptions(),
    onSuccess: async (preference) => refreshPersonalizationCaches(queryClient, preference),
  });
}
