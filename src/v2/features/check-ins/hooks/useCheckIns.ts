import {
  type QueryClient,
  useInfiniteQuery,
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
  infinite: (limit: number) => [...checkInQueryKeys.all, 'infinite', { limit }] as const,
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

export function createInfiniteCheckInListQueryOptions(
  limit = 20,
  api: Pick<CheckInApi, 'listCheckIns'> = checkInApi,
) {
  return {
    getNextPageParam: (lastPage: Awaited<ReturnType<CheckInApi['listCheckIns']>>) => (
      lastPage.hasNext && lastPage.page < lastPage.totalPages
        ? lastPage.page + 1
        : undefined
    ),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }: { pageParam: number; signal?: AbortSignal }) => (
      api.listCheckIns({ limit, page: pageParam }, signal)
    ),
    queryKey: checkInQueryKeys.infinite(limit),
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

export function useInfiniteCheckIns(limit = 20) {
  return useInfiniteQuery(createInfiniteCheckInListQueryOptions(limit));
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
