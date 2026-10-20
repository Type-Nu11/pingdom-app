import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { scoutProfileApi } from '../api/scoutProfileApi';
import { scoutProfileQueryKeys } from '../model/scoutProfileQueryKeys';
import type {
  ScoutProfile,
  ScoutProfileRequest,
} from '../model/scoutProfile.types';

type ScoutProfileApi = typeof scoutProfileApi;

export function createScoutProfileQueryOptions(
  api: Pick<ScoutProfileApi, 'getScoutProfile'> = scoutProfileApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.getScoutProfile(signal),
    queryKey: scoutProfileQueryKeys.mine(),
  };
}

export function createApplyScoutProfileMutationOptions(
  api: Pick<ScoutProfileApi, 'applyScoutProfile'> = scoutProfileApi,
) {
  return {
    mutationFn: (body: ScoutProfileRequest) => api.applyScoutProfile(body),
  };
}

export function createUpdateScoutProfileMutationOptions(
  api: Pick<ScoutProfileApi, 'updateScoutProfile'> = scoutProfileApi,
) {
  return {
    mutationFn: (body: ScoutProfileRequest) => api.updateScoutProfile(body),
  };
}

export function cacheScoutProfile(queryClient: QueryClient, profile: ScoutProfile): void {
  queryClient.setQueryData(scoutProfileQueryKeys.mine(), profile);
}

export function useScoutProfile() {
  return useQuery(createScoutProfileQueryOptions());
}

export function useApplyScoutProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    ...createApplyScoutProfileMutationOptions(),
    onSuccess: (profile) => cacheScoutProfile(queryClient, profile),
  });
}

export function useUpdateScoutProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    ...createUpdateScoutProfileMutationOptions(),
    onSuccess: (profile) => cacheScoutProfile(queryClient, profile),
  });
}
