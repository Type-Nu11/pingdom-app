import React from 'react';
import { Button } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../v2/app/testing/testProviders';
import { darkColors, lightColors, useAppearance } from '../../../v2/shared/theme';
import { LoginRoute, SignupRoute } from '../AuthFormRoutes';

function SwitchTheme() {
  const { setPreference } = useAppearance();
  return <Button accessibilityLabel="Light" title="Light" onPress={() => void setPreference('LIGHT')} />;
}

test.each(['login', 'signup'] as const)('%s keeps the active field and step when the app overrides system dark', async (route) => {
  const { i18n } = await renderWithProviders(<>
    {route === 'login' ? <LoginRoute onBack={jest.fn()} /> : <SignupRoute />}
    <SwitchTheme />
  </>, { colorScheme: 'dark', appearancePreference: 'SYSTEM' });

  const username = screen.getByPlaceholderText(i18n.t(`auth.${route}.usernamePlaceholder`));
  expect(username).toHaveStyle({ color: darkColors.textStrong });
  await fireEvent.changeText(username, 'theme-user');
  if (route === 'signup') {
    await fireEvent.changeText(screen.getByPlaceholderText(i18n.t('auth.signup.emailPlaceholder')), 'test@example.com');
    await fireEvent.press(screen.getByText(i18n.t('auth.signup.next')));
  }
  const password = () => screen.getByPlaceholderText(i18n.t(`auth.${route}.passwordPlaceholder`));
  await fireEvent.changeText(password(), 'typed-password');
  expect(password().props.placeholderTextColor).toBe(darkColors.textMuted);
  await fireEvent.press(screen.getByRole('button', { name: 'Light' }));
  expect(password()).toHaveStyle({ color: lightColors.textStrong });
  expect(password().props.placeholderTextColor).toBe(lightColors.textMuted);
  expect(password().props.value).toBe('typed-password');
});
