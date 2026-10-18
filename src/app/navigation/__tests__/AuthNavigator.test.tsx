import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../v2/app/testing/testProviders';
import AuthNavigator from '../AuthNavigator';
import { authApi } from '../../../features/auth/api/authApi';

test('returning accounts without signup context see login/signup and can open the login form', async () => {
  const { user, i18n } = await renderWithProviders(<NavigationContainer>
    <AuthNavigator returningUser onComplete={jest.fn()} />
  </NavigationContainer>, { language: 'ko' });
  expect(screen.getByTestId('auth-landing-screen')).toBeVisible();
  expect(screen.getByTestId('auth-landing-signup')).toBeVisible();
  await user.press(screen.getByTestId('auth-landing-login'));
  expect(screen.getByPlaceholderText(i18n.t('auth.login.usernamePlaceholder'))).toBeVisible();
});

test('login HTTP 401 shows Korean credential guidance instead of the transport message', async () => {
  jest.spyOn(authApi, 'login').mockRejectedValueOnce(Object.assign(
    new Error('Request failed with status code 401'),
    { isAxiosError: true, response: { status: 401, data: { message: 'Unauthorized', code: 'INVALID_CREDENTIALS' } } },
  ));
  const { user, i18n } = await renderWithProviders(<NavigationContainer>
    <AuthNavigator returningUser onComplete={jest.fn()} />
  </NavigationContainer>, { language: 'ko' });
  await user.press(screen.getByTestId('auth-landing-login'));
  await user.type(screen.getByPlaceholderText(i18n.t('auth.login.usernamePlaceholder')), 'wrong_user');
  await user.type(screen.getByPlaceholderText(i18n.t('auth.login.passwordPlaceholder')), 'wrong_password');
  await user.press(screen.getByText(i18n.t('auth.login.submit')));
  expect(await screen.findByText('아이디 또는 비밀번호가 올바르지 않습니다. 다시 확인해 주세요.')).toBeVisible();
  expect(screen.queryByText(/401|Unauthorized/)).toBeNull();
});
