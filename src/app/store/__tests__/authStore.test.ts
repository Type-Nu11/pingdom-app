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
      hasAuthenticated: false,
      isHydrating: true,
      isLoggedIn: false,
    });
  });

  test('restores an access-token session backed by the server HttpOnly refresh cookie', async () => {
    getGenericPassword.mockResolvedValueOnce({
      password: JSON.stringify({ accessToken: 'access' }),
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

  test('keeps legacy stored sessions while ignoring the obsolete refresh token field', async () => {
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

  test('persists a login response containing the access token only', async () => {
    await expect(useAuthStore.getState().login({ accessToken: 'access' })).resolves.toBeUndefined();

    expect(setGenericPassword).toHaveBeenCalledWith(
      'tokens',
      JSON.stringify({ accessToken: 'access' }),
      { service: 'com.pingdom.auth' },
    );
    expect(useAuthStore.getState().isLoggedIn).toBe(true);
  });
});


test('a restored pre-onboarding session retains returning-user entry after logout and app restart', async () => {
  getGenericPassword.mockResolvedValueOnce({ password: JSON.stringify({ accessToken: 'legacy-access' }), username: 'tokens' } as never);
  await useAuthStore.getState().bootstrapAuth();
  await useAuthStore.getState().logout();
  expect(useAuthStore.getState()).toMatchObject({ isLoggedIn: false, hasAuthenticated: true });
  useAuthStore.setState({ hasAuthenticated: false, isHydrating: true });
  getGenericPassword.mockResolvedValueOnce(false);
  await useAuthStore.getState().bootstrapAuth();
  expect(useAuthStore.getState()).toMatchObject({ isLoggedIn: false, hasAuthenticated: true, isHydrating: false });
});

test('a first installation without a session remains eligible for onboarding', async () => {
  useAuthStore.setState({ hasAuthenticated: false });
  getGenericPassword.mockResolvedValueOnce(false);
  await useAuthStore.getState().bootstrapAuth();
  expect(useAuthStore.getState()).toMatchObject({ isLoggedIn: false, hasAuthenticated: false });
});
