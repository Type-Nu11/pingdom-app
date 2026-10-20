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

// Serialize the entire optimistic transaction, including reconciliation. Mutation
// scope alone does not serialize onMutate, and can capture another optimistic value.
const settingsTransactions = new WeakMap<QueryClient, Promise<unknown>>();

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
    mutationFn: (update: NotificationSettingUpdateRequest) => {
      const owner = queryClient.getQueryCache().find({ exact: true, queryKey });
      const isCurrent = () => owner !== undefined
        && queryClient.getQueryCache().find({ exact: true, queryKey }) === owner;
      const previousTransaction = settingsTransactions.get(queryClient) ?? Promise.resolve();
      const transaction = previousTransaction.catch(() => undefined).then(async () => {
        // A queued write belongs to the session that enqueued it.
        if (!isCurrent()) throw new Error('Notification settings session changed');
        await queryClient.cancelQueries({ exact: true, queryKey });
        if (!isCurrent()) throw new Error('Notification settings session changed');
        const previous = optimisticallyUpdateNotificationSettings(queryClient, update);
        try {
          const setting = await notificationApi.updateNotificationSettings(update);
          if (isCurrent()) queryClient.setQueryData(queryKey, setting);
          return setting;
        } catch (error) {
          if (isCurrent() && previous) queryClient.setQueryData(queryKey, previous);
          throw error;
        } finally {
          if (isCurrent()) await queryClient.invalidateQueries({ exact: true, queryKey });
        }
      });
      settingsTransactions.set(queryClient, transaction);
      const cleanup = () => {
        if (settingsTransactions.get(queryClient) === transaction) settingsTransactions.delete(queryClient);
      };
      void transaction.then(cleanup, cleanup);
      return transaction;
    },
  });
}
