import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../v2/app/testing/testProviders';
import AuthNavigator from '../AuthNavigator';

test('returning accounts without signup context see login/signup and can open the login form', async () => {
  const { user, i18n } = await renderWithProviders(<NavigationContainer>
    <AuthNavigator returningUser onComplete={jest.fn()} />
  </NavigationContainer>, { language: 'ko' });
  expect(screen.getByTestId('auth-landing-screen')).toBeVisible();
  expect(screen.getByTestId('auth-landing-signup')).toBeVisible();
  await user.press(screen.getByTestId('auth-landing-login'));
  expect(screen.getByPlaceholderText(i18n.t('auth.login.usernamePlaceholder'))).toBeVisible();
});
