import { createNotificationPermissionAdapter } from '../notificationPermission';

function dependencies(overrides = {}) {
  return {
    platform: 'ios', version: 17, available: () => true,
    readNative: jest.fn(async () => 1), requestNative: jest.fn(async () => 1),
    checkAndroid: jest.fn(async () => false), requestAndroid: jest.fn(async () => 'granted'),
    openSettings: jest.fn(async () => undefined), ...overrides,
  };
}

test.each([[1, 'authorized'], [2, 'provisional'], [0, 'denied'], [-1, 'notDetermined']] as const)(
  'reads iOS %s as %s without prompting', async (native, expected) => {
    const deps = dependencies({ readNative: jest.fn(async () => native) });
    expect(await createNotificationPermissionAdapter(deps).read()).toBe(expected);
    expect(deps.requestNative).not.toHaveBeenCalled();
  },
);
test.each([1, 2])('does not request already permitted iOS status %s', async (native) => {
  const deps = dependencies({ readNative: jest.fn(async () => native) });
  await createNotificationPermissionAdapter(deps).request();
  expect(deps.requestNative).not.toHaveBeenCalled();
});
test('iOS denied requires device settings, not another prompt', async () => {
  const deps = dependencies({ readNative: jest.fn(async () => 0) });
  expect(await createNotificationPermissionAdapter(deps).request()).toBe('denied');
  expect(deps.requestNative).not.toHaveBeenCalled();
});
test('Android 13 requests POST_NOTIFICATIONS only on explicit request and exposes permanent denial', async () => {
  const deps = dependencies({ platform: 'android', version: 33, requestAndroid: jest.fn(async () => 'never_ask_again') });
  const adapter = createNotificationPermissionAdapter(deps);
  expect(await adapter.read()).toBe('denied');
  expect(deps.requestAndroid).not.toHaveBeenCalled();
  expect(await adapter.request()).toBe('blocked');
  expect(deps.requestAndroid).toHaveBeenCalledTimes(1);
  expect(await adapter.request()).toBe('blocked');
  expect(deps.requestAndroid).toHaveBeenCalledTimes(1);
});
test.each([true, false])('Android 12 reads app notification state without a runtime prompt: %s', async (allowed) => {
  const deps = dependencies({ platform: 'android', version: 32, readNative: jest.fn(async () => allowed ? 1 : 0) });
  expect(await createNotificationPermissionAdapter(deps).request()).toBe(allowed ? 'authorized' : 'denied');
  expect(deps.requestAndroid).not.toHaveBeenCalled();
  expect(deps.requestNative).not.toHaveBeenCalled();
});
test('missing Firebase runtime is unavailable even when Android permission is granted', async () => {
  const deps = dependencies({ platform: 'android', version: 34, available: () => false, checkAndroid: jest.fn(async () => true) });
  const adapter = createNotificationPermissionAdapter(deps);
  expect(await adapter.read()).toBe('unavailable');
  expect(await adapter.request()).toBe('unavailable');
  expect(deps.requestAndroid).not.toHaveBeenCalled();
});
test('errors remain distinct from user denial', async () => {
  const deps = dependencies({ readNative: jest.fn(async () => { throw new Error('native failure'); }) });
  expect(await createNotificationPermissionAdapter(deps).read()).toBe('error');
  expect(await createNotificationPermissionAdapter(deps).request()).toBe('error');
});

test('iOS notDetermined requests once and preserves a provisional grant', async () => {
  const deps = dependencies({ readNative: jest.fn(async () => -1), requestNative: jest.fn(async () => 2) });
  const adapter = createNotificationPermissionAdapter(deps);
  expect(await adapter.read()).toBe('notDetermined');
  const results = await Promise.all([adapter.request(), adapter.request()]);
  expect(results).toEqual(['provisional', 'provisional']);
  expect(deps.requestNative).toHaveBeenCalledTimes(1);
});

test('Android 13 reads native state again after granting runtime permission', async () => {
  const deps = dependencies({ platform: 'android', version: 33,
    checkAndroid: jest.fn().mockResolvedValueOnce(false).mockResolvedValue(true),
  });
  expect(await createNotificationPermissionAdapter(deps).request()).toBe('authorized');
  expect(deps.requestAndroid).toHaveBeenCalledTimes(1);
  expect(deps.readNative).toHaveBeenCalledTimes(1);
});

test('a thrown native prompt is an error rather than a denial', async () => {
  const deps = dependencies({ readNative: jest.fn(async () => -1), requestNative: jest.fn(async () => { throw new Error('prompt failed'); }) });
  expect(await createNotificationPermissionAdapter(deps).request()).toBe('error');
});
