import { configureApiAccessTokenProvider, configureApiTransport } from '../../v2/shared/api/apiClient';
import { configureTokenSession } from '../../v2/shared/auth/tokenSession';
import { unregisterStoredFcmToken } from '../../v2/modules/user/notifications/lifecycle';
import { installProductionRuntime, type ProductionRuntime } from '../runtime/productionRuntime';

jest.mock('../../v2/shared/api/apiClient', () => ({
  configureApiAccessTokenProvider: jest.fn(), configureApiTransport: jest.fn(),
}));
jest.mock('../../v2/shared/auth/tokenSession', () => ({ configureTokenSession: jest.fn() }));
jest.mock('../../v2/modules/user/notifications/lifecycle', () => ({ unregisterStoredFcmToken: jest.fn() }));

test('runtime injects the same transport, live token reader and logout function in established order', () => {
  let token: string | null = 'login-token';
  const runtime: ProductionRuntime = {
    transport: {} as ProductionRuntime['transport'],
    getAccessToken: () => token,
    beforeLogout: jest.fn(() => jest.fn()),
    logout: jest.fn(async () => {}),
  };
  installProductionRuntime(runtime);
  expect(configureApiTransport).toHaveBeenCalledWith(runtime.transport);
  expect(configureApiAccessTokenProvider).toHaveBeenCalledWith(runtime.getAccessToken);
  expect(runtime.beforeLogout).toHaveBeenCalledWith(unregisterStoredFcmToken);
  expect(configureTokenSession).toHaveBeenCalledWith({ clear: runtime.logout });
  const reader = jest.mocked(configureApiAccessTokenProvider).mock.calls[0][0];
  expect(reader()).toBe('login-token');
  token = 'refreshed-token';
  expect(reader()).toBe('refreshed-token');
  token = null;
  expect(reader()).toBeNull();
  const calls = [configureApiTransport, configureApiAccessTokenProvider, runtime.beforeLogout, configureTokenSession]
    .map(fn => jest.mocked(fn).mock.invocationCallOrder[0]);
  expect(calls).toEqual([...calls].sort((a, b) => a - b));
});
