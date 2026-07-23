import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { placeDetailQueryKeys } from '../../place-detail/hooks/usePlaceDetail';
import { placeListQueryKeys } from '../../place-list/hooks/usePlaceList';
import {
  checkInApi,
  type CreateCheckInBody,
  type CreateStatusVoteBody,
  type ListCheckInsParams,
} from '../api/checkInApi';

type CheckInApi = typeof checkInApi;

export const checkInQueryKeys = {
  all: ['v2', 'check-ins'] as const,
  list: (params: ListCheckInsParams) => [...checkInQueryKeys.all, 'list', params] as const,
};

export function createCheckInListQueryOptions(
  params: ListCheckInsParams = {},
  api: Pick<CheckInApi, 'listCheckIns'> = checkInApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.listCheckIns(params, signal),
    queryKey: checkInQueryKeys.list(params),
  };
}

export function createCheckInMutationOptions(
  api: Pick<CheckInApi, 'createCheckIn'> = checkInApi,
) {
  return {
    mutationFn: (body: CreateCheckInBody) => api.createCheckIn(body),
  };
}

export function createStatusVoteMutationOptions(
  api: Pick<CheckInApi, 'createStatusVote'> = checkInApi,
) {
  return {
    mutationFn: ({ body, placeId }: { body: CreateStatusVoteBody; placeId: number }) =>
      api.createStatusVote(placeId, body),
  };
}

export function useCheckIns(params: ListCheckInsParams = {}) {
  return useQuery(createCheckInListQueryOptions(params));
}

export function useCreateCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    ...createCheckInMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: checkInQueryKeys.all });
    },
  });
}

export function useCreateStatusVote() {
  const queryClient = useQueryClient();

  return useMutation({
    ...createStatusVoteMutationOptions(),
    onSuccess: async (_vote, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: placeDetailQueryKeys.detail(variables.placeId) }),
        queryClient.invalidateQueries({ queryKey: placeListQueryKeys.all }),
      ]);
    },
  });
}
