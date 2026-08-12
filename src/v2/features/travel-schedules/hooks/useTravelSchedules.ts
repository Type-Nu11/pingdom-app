import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import {
  recommendationQueryKeys,
  userQueryKeys,
} from '../../travel-purposes/model/travelPurposeQueryKeys';
import {
  travelScheduleApi,
  type CreateTravelScheduleBody,
  type UpdateTravelScheduleBody,
} from '../api/travelScheduleApi';
import { travelScheduleQueryKeys } from '../model/travelScheduleQueryKeys';

type TravelScheduleApi = typeof travelScheduleApi;

export type UpdateTravelScheduleVariables = {
  body: UpdateTravelScheduleBody;
  scheduleId: number;
};

export function createTravelSchedulesQueryOptions(
  api: Pick<TravelScheduleApi, 'getTravelSchedules'> = travelScheduleApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.getTravelSchedules(signal),
    queryKey: travelScheduleQueryKeys.list(),
  };
}

export function createTravelScheduleMutationOptions(
  api: Pick<TravelScheduleApi, 'createTravelSchedule'> = travelScheduleApi,
) {
  return {
    mutationFn: (body: CreateTravelScheduleBody) => api.createTravelSchedule(body),
  };
}

export function createUpdateTravelScheduleMutationOptions(
  api: Pick<TravelScheduleApi, 'updateTravelSchedule'> = travelScheduleApi,
) {
  return {
    mutationFn: ({ body, scheduleId }: UpdateTravelScheduleVariables) =>
      api.updateTravelSchedule(scheduleId, body),
  };
}

export function createCancelTravelScheduleMutationOptions(
  api: Pick<TravelScheduleApi, 'cancelTravelSchedule'> = travelScheduleApi,
) {
  return {
    mutationFn: (scheduleId: number) => api.cancelTravelSchedule(scheduleId),
  };
}

export async function invalidateTravelScheduleDependencies(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: travelScheduleQueryKeys.all }),
    queryClient.invalidateQueries({ exact: true, queryKey: userQueryKeys.me() }),
    queryClient.invalidateQueries({ queryKey: recommendationQueryKeys.all }),
  ]);
}

export function useTravelSchedules(enabled = true) {
  return useQuery({
    ...createTravelSchedulesQueryOptions(),
    enabled,
  });
}

export function useCreateTravelSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    ...createTravelScheduleMutationOptions(),
    onSuccess: async () => invalidateTravelScheduleDependencies(queryClient),
  });
}

export function useUpdateTravelSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    ...createUpdateTravelScheduleMutationOptions(),
    onSuccess: async () => invalidateTravelScheduleDependencies(queryClient),
  });
}

export function useCancelTravelSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    ...createCancelTravelScheduleMutationOptions(),
    onSuccess: async () => invalidateTravelScheduleDependencies(queryClient),
  });
}
