import * as Keychain from 'react-native-keychain';

import {
  clearExpiredSession,
  configureBeforeLogout,
  useAuthStore,
} from '../authStore';

const getGenericPassword = Keychain.getGenericPassword as jest.MockedFunction<
  typeof Keychain.getGenericPassword
>;
const resetGenericPassword = Keychain.resetGenericPassword as jest.MockedFunction<
  typeof Keychain.resetGenericPassword
>;
const setGenericPassword = Keychain.setGenericPassword as jest.MockedFunction<
  typeof Keychain.setGenericPassword
>;

describe('auth store session bootstrap', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      isHydrating: true,
      isLoggedIn: false,
    });
  });

  test('discards an access-token-only session instead of entering the protected app', async () => {
    getGenericPassword.mockResolvedValueOnce({
      password: JSON.stringify({ accessToken: 'expired-access', refreshToken: '' }),
      service: 'com.pingdom.auth',
      username: 'tokens',
    } as never);

    await useAuthStore.getState().bootstrapAuth();

    expect(resetGenericPassword).toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      isHydrating: false,
      isLoggedIn: false,
    });
  });

  test('restores a session only when both tokens are present', async () => {
    getGenericPassword.mockResolvedValueOnce({
      password: JSON.stringify({ accessToken: 'access', refreshToken: 'refresh' }),
      service: 'com.pingdom.auth',
      username: 'tokens',
    } as never);

    await useAuthStore.getState().bootstrapAuth();

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'access',
      isHydrating: false,
      isLoggedIn: true,
    });
  });

  test('refresh failure clears locally without starting authenticated pre-logout cleanup', async () => {
    const beforeLogout = jest.fn().mockResolvedValue(undefined);
    const resetBeforeLogout = configureBeforeLogout(beforeLogout);
    useAuthStore.setState({
      accessToken: 'expired-access',
      isHydrating: false,
      isLoggedIn: true,
    });

    try {
      await clearExpiredSession();
    } finally {
      resetBeforeLogout();
    }

    expect(beforeLogout).not.toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      isHydrating: false,
      isLoggedIn: false,
    });
  });

  test('does not persist a login response without a refresh token', async () => {
    await expect(useAuthStore.getState().login({
      accessToken: 'access',
      refreshToken: '',
    })).rejects.toThrow('refreshToken');

    expect(setGenericPassword).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });
});
