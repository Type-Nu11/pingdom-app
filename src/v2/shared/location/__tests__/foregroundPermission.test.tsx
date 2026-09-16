import { act, renderHook } from '@testing-library/react-native';
import { AppState, Linking } from 'react-native';
import { readForegroundPermission, type ForegroundPermissionAdapter } from '../foregroundPermission';
import { useForegroundPermission } from '../useForegroundPermission';

const createAdapter = (): ForegroundPermissionAdapter => ({
  get: jest.fn(async () => ({ status: 'denied', canAskAgain: true })),
  request: jest.fn(async () => ({ status: 'granted', canAskAgain: true })),
  servicesEnabled: jest.fn(async () => true),
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(r => { resolve = r; });
  return { promise, resolve };
}

test.each([
  ['denied', false, 'restricted'], ['restricted', true, 'restricted'], ['granted', true, 'granted'],
])('action rechecks %s / %s without prompting when request is not allowed', async (status, canAskAgain, expected) => {
  const adapter = createAdapter();
  jest.mocked(adapter.get).mockResolvedValue({ status, canAskAgain });
  expect(await readForegroundPermission(adapter, true)).toBe(expected);
  expect(adapter.request).not.toHaveBeenCalled();
});

test('unavailable services never trigger a permission request', async () => {
  const adapter = createAdapter();
  jest.mocked(adapter.servicesEnabled).mockResolvedValue(false);
  expect(await readForegroundPermission(adapter, true)).toBe('unavailable');
  expect(adapter.request).not.toHaveBeenCalled();
});

test('service lookup failure is a safe error', async () => {
  const adapter = createAdapter();
  jest.mocked(adapter.servicesEnabled).mockRejectedValue(new Error('native detail'));
  expect(await readForegroundPermission(adapter)).toBe('error');
});

test('unmount removes listener and ignores pending permission results and stale actions', async () => {
  const adapter = createAdapter();
  const pending = deferred<{ status: string; canAskAgain: boolean }>();
  jest.mocked(adapter.get).mockReturnValue(pending.promise);
  const subscription = jest.spyOn(AppState, 'addEventListener');
  const view = await renderHook(() => useForegroundPermission(adapter));
  const remove = jest.spyOn(subscription.mock.results.at(-1)!.value, 'remove');
  const actions = view.result.current;
  await view.unmount();
  await act(async () => pending.resolve({ status: 'granted', canAskAgain: true }));
  expect(view.result.current.state).toBe('loading');
  expect(remove).toHaveBeenCalledTimes(1);
  await actions.refresh(true);
  expect(adapter.request).not.toHaveBeenCalled();
});

test('latest refresh wins over an older permission response', async () => {
  const adapter = createAdapter();
  const pending = deferred<{ status: string; canAskAgain: boolean }>();
  jest.mocked(adapter.get).mockReturnValueOnce(pending.promise).mockResolvedValue({ status: 'granted', canAskAgain: true });
  const view = await renderHook(() => useForegroundPermission(adapter));
  await act(async () => view.result.current.refresh());
  expect(view.result.current.state).toBe('granted');
  await act(async () => pending.resolve({ status: 'denied', canAskAgain: true }));
  expect(view.result.current.state).toBe('granted');
});

test('settings completion after unmount does not publish state', async () => {
  const pending = deferred<void>();
  jest.spyOn(Linking, 'openSettings').mockReturnValue(pending.promise);
  const adapter = createAdapter();
  const view = await renderHook(() => useForegroundPermission(adapter));
  let opening!: Promise<void>;
  await act(async () => { opening = view.result.current.openSettings(); });
  const beforeUnmount = view.result.current;
  await view.unmount();
  await act(async () => { pending.resolve(); await opening; });
  expect(view.result.current).toBe(beforeUnmount);
});
