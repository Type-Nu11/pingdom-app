import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { notificationApi } from '../api/notificationApi';
import type {
  NotificationSetting,
  NotificationSettingUpdateRequest,
} from '../model/notificationApi.types';

type NotificationApi = typeof notificationApi;

export const notificationSettingsQueryKeys = {
  all: ['v2', 'notifications', 'settings'] as const,
  mine: () => [...notificationSettingsQueryKeys.all, 'me'] as const,
};

export function createNotificationSettingsQueryOptions(
  api: Pick<NotificationApi, 'getNotificationSettings'> = notificationApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      api.getNotificationSettings(signal),
    queryKey: notificationSettingsQueryKeys.mine(),
  };
}

export function createUpdateNotificationSettingsMutationOptions(
  api: Pick<NotificationApi, 'updateNotificationSettings'> = notificationApi,
) {
  return {
    mutationFn: (body: NotificationSettingUpdateRequest) =>
      api.updateNotificationSettings(body),
  };
}

export function optimisticallyUpdateNotificationSettings(
  queryClient: QueryClient,
  update: NotificationSettingUpdateRequest,
): NotificationSetting | undefined {
  const queryKey = notificationSettingsQueryKeys.mine();
  const previous = queryClient.getQueryData<NotificationSetting>(queryKey);

  if (previous) {
    queryClient.setQueryData<NotificationSetting>(queryKey, { ...previous, ...update });
  }

  return previous;
}

export function useNotificationSettings(enabled = true) {
  return useQuery({
    ...createNotificationSettingsQueryOptions(),
    enabled,
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  const queryKey = notificationSettingsQueryKeys.mine();

  return useMutation({
    ...createUpdateNotificationSettingsMutationOptions(),
    onMutate: async (update) => {
      await queryClient.cancelQueries({ exact: true, queryKey });
      return {
        previous: optimisticallyUpdateNotificationSettings(queryClient, update),
      };
    },
    onError: (_error, _update, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSuccess: (setting) => queryClient.setQueryData(queryKey, setting),
    onSettled: () => queryClient.invalidateQueries({ exact: true, queryKey }),
  });
}
