import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';
import { createDeleteFcmTokenMutationOptions, createRegisterFcmTokenMutationOptions } from '../hooks/useFcmTokenMutations.ts';
import { createNotificationSettingsQueryOptions, createUpdateNotificationSettingsMutationOptions, notificationSettingsQueryKeys, optimisticallyUpdateNotificationSettings } from '../hooks/useNotificationSettings.ts';

test('notification Hook options forward AbortSignal and contract bodies', async () => {
  const setting = { newLikeEnabled: true, timezone: 'Asia/Seoul' };
  const update = { newLikeEnabled: false };
  const token = { token: 'device-token' };
  const signal = new AbortController().signal;
  const calls = [];

  const query = createNotificationSettingsQueryOptions({
    getNotificationSettings: async (receivedSignal) => {
      calls.push(['get', receivedSignal]);
      return setting;
    },
  });
  const updateMutation = createUpdateNotificationSettingsMutationOptions({
    updateNotificationSettings: async (body) => {
      calls.push(['update', body]);
      return { ...setting, ...body };
    },
  });
  const registerMutation = createRegisterFcmTokenMutationOptions({
    registerFcmToken: async (body) => { calls.push(['register', body]); },
  });
  const deleteMutation = createDeleteFcmTokenMutationOptions({
    deleteFcmToken: async (body) => { calls.push(['delete', body]); },
  });

  assert.equal(await query.queryFn({ signal }), setting);
  assert.equal((await updateMutation.mutationFn(update)).newLikeEnabled, false);
  await registerMutation.mutationFn(token);
  await deleteMutation.mutationFn(token);
  assert.deepEqual(query.queryKey, ['v2', 'notifications', 'settings', 'me']);
  assert.deepEqual(calls, [
    ['get', signal],
    ['update', update],
    ['register', token],
    ['delete', token],
  ]);
});

test('notification setting optimistic update can be rolled back to server cache', () => {
  const queryClient = new QueryClient();
  const queryKey = notificationSettingsQueryKeys.mine();
  const previous = {
    newHotplaceEnabled: true,
    newLikeEnabled: true,
    quietHoursEnabled: false,
    timezone: 'Asia/Seoul',
  };
  queryClient.setQueryData(queryKey, previous);

  const snapshot = optimisticallyUpdateNotificationSettings(queryClient, {
    newLikeEnabled: false,
  });

  assert.deepEqual(snapshot, previous);
  assert.deepEqual(queryClient.getQueryData(queryKey), {
    ...previous,
    newLikeEnabled: false,
  });
  queryClient.setQueryData(queryKey, snapshot);
  assert.deepEqual(queryClient.getQueryData(queryKey), previous);
});
