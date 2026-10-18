import { act, renderHook } from '@testing-library/react-native';
import { authApi } from '../../../features/auth/api/authApi';
import { useSignup } from '../../../features/auth/hooks/useSignup';
import { usePasswordReset } from '../../../features/auth/hooks/usePasswordReset';
import { createTestWrapper } from '../../../v2/app/testing/testProviders';

const failure = (status: number, data: unknown) => Object.assign(
  new Error(`Request failed with status code ${status}`),
  { isAxiosError: true, response: { status, data } },
);

test('signup replaces English server field reasons with localized validation guidance', async () => {
  jest.spyOn(authApi, 'signup').mockRejectedValueOnce(failure(400, {
    message: 'Validation failed', errors: { email: 'must be a well-formed email address' },
  }));
  const { wrapper, i18n } = await createTestWrapper({ language: 'ko' });
  const view = await renderHook(() => useSignup(), { wrapper });
  await act(async () => {
    expect(await view.result.current.signup({ username: 'user', email: 'invalid', password: 'password' })).toBeNull();
  });
  expect(view.result.current.errorMessage).toBe(i18n.t('common.apiError.validation.description'));
  expect(view.result.current.errorMessage).not.toMatch(/Validation|well-formed|400/);
  expect(view.result.current.isSubmitting).toBe(false);
});

test('password reset retains invalid-code guidance and sanitizes subsequent server failures', async () => {
  jest.spyOn(authApi, 'confirmPasswordReset').mockRejectedValueOnce(failure(400, {
    code: 'INVALID_PASSWORD_RESET_TOKEN', message: 'Invalid reset token',
  }));
  jest.spyOn(authApi, 'requestPasswordReset').mockRejectedValueOnce(failure(503, { message: 'Service Unavailable' }));
  const { wrapper, i18n } = await createTestWrapper({ language: 'ko' });
  const view = await renderHook(() => usePasswordReset(), { wrapper });
  await act(async () => {
    expect(await view.result.current.confirmReset({ email: 'user@example.com', token: 'bad', newPassword: 'password123', confirmPassword: 'password123' })).toBe(false);
  });
  expect(view.result.current.errorMessage).toBe(i18n.t('auth.passwordReset.invalidToken'));
  await act(async () => { view.result.current.clearError(); });
  expect(view.result.current.errorMessage).toBeNull();
  await act(async () => { expect(await view.result.current.requestReset('user@example.com')).toBe(false); });
  expect(view.result.current.errorMessage).toBe(i18n.t('common.apiError.server.description'));
  expect(view.result.current.isSubmitting).toBe(false);
});
