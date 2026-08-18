import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { placeQueryKeys } from '../../../shared/query/placeQueryKeys';
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
    retry: false,
  };
}

export async function invalidateCheckInDependencies(
  queryClient: QueryClient,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: checkInQueryKeys.all }),
    queryClient.invalidateQueries({ queryKey: placeQueryKeys.all }),
  ]);
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
      await invalidateCheckInDependencies(queryClient);
    },
  });
}

export function useCreateStatusVote() {
  const queryClient = useQueryClient();

  return useMutation({
    ...createStatusVoteMutationOptions(),
    onSuccess: async (_vote, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: placeQueryKeys.detail(variables.placeId) }),
        queryClient.invalidateQueries({ queryKey: placeQueryKeys.lists() }),
      ]);
    },
  });
}
