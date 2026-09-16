import { act, renderHook, waitFor } from '@testing-library/react-native';
import { createTestWrapper } from '../../../../shared/testing/testProviders';
import { notificationApi } from '../../api/notificationApi';
import { notificationSettingsQueryKeys, useUpdateNotificationSettings } from '../useNotificationSettings';

const key = notificationSettingsQueryKeys.mine();
const initial = { newHotplaceEnabled: false, newLikeEnabled: true, quietHoursEnabled: false };
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test('serializes mutations across hook instances so a late failure cannot overwrite a later success', async () => {
  const first = deferred<typeof initial>();
  const second = deferred<typeof initial>();
  const api = jest.spyOn(notificationApi, 'updateNotificationSettings')
    .mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
  const { wrapper, queryClient } = await createTestWrapper();
  queryClient.setQueryData(key, initial);
  const { result } = await renderHook(() => ({ a: useUpdateNotificationSettings(), b: useUpdateNotificationSettings() }), { wrapper });
  let a!: Promise<unknown>;
  let b!: Promise<unknown>;
  await act(async () => {
    a = result.current.a.mutateAsync({ newHotplaceEnabled: true }).catch(() => undefined);
    b = result.current.b.mutateAsync({ newLikeEnabled: false });
  });
  expect(api).toHaveBeenCalledTimes(1);
  expect(queryClient.getQueryData(key)).toEqual({ ...initial, newHotplaceEnabled: true });
  // Even if a later response is ready first, it cannot enter the cache until
  // the earlier request's rollback and reconciliation have completed.
  await act(async () => { second.resolve({ ...initial, newLikeEnabled: false }); });
  await act(async () => { first.reject(new Error('failed')); await a; });
  await waitFor(() => expect(api).toHaveBeenCalledTimes(2));
  expect(queryClient.getQueryData(key)).toEqual({ ...initial, newLikeEnabled: false });
  await act(async () => { await b; });
  expect(queryClient.getQueryData(key)).toEqual({ ...initial, newLikeEnabled: false });
  await waitFor(() => expect(result.current.b.isSuccess).toBe(true));
});

test('an in-flight response does not recreate cache removed on logout', async () => {
  const pending = deferred<typeof initial>();
  jest.spyOn(notificationApi, 'updateNotificationSettings').mockReturnValue(pending.promise);
  const { wrapper, queryClient } = await createTestWrapper();
  queryClient.setQueryData(key, initial);
  const { result } = await renderHook(useUpdateNotificationSettings, { wrapper });
  let request!: Promise<unknown>;
  await act(async () => { request = result.current.mutateAsync({ newLikeEnabled: false }); });
  queryClient.clear();
  await act(async () => { pending.resolve({ ...initial, newLikeEnabled: false }); await request; });
  expect(queryClient.getQueryData(key)).toBeUndefined();
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
});

test('successful mutation caches the server response, including changes outside the submitted field', async () => {
  const response = { ...initial, newHotplaceEnabled: true, newLikeEnabled: false, timezone: 'UTC' };
  jest.spyOn(notificationApi, 'updateNotificationSettings').mockResolvedValue(response);
  const { wrapper, queryClient } = await createTestWrapper();
  queryClient.setQueryData(key, initial);
  const { result } = await renderHook(useUpdateNotificationSettings, { wrapper });
  await act(async () => { await result.current.mutateAsync({ newLikeEnabled: false }); });
  expect(queryClient.getQueryData(key)).toEqual(response);
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
});

test('logout cancels queued writes as well as discarding the in-flight response', async () => {
  const pending = deferred<typeof initial>();
  const api = jest.spyOn(notificationApi, 'updateNotificationSettings').mockReturnValue(pending.promise);
  const { wrapper, queryClient } = await createTestWrapper();
  queryClient.setQueryData(key, initial);
  const { result } = await renderHook(useUpdateNotificationSettings, { wrapper });
  let first!: Promise<unknown>;
  let second!: Promise<unknown>;
  await act(async () => {
    first = result.current.mutateAsync({ newLikeEnabled: false });
    second = result.current.mutateAsync({ newHotplaceEnabled: true }).catch(() => undefined);
  });
  queryClient.clear();
  await act(async () => { pending.resolve(initial); await first; await second; });
  expect(api).toHaveBeenCalledTimes(1);
  expect(queryClient.getQueryData(key)).toBeUndefined();
  await waitFor(() => expect(result.current.isError).toBe(true));
});
