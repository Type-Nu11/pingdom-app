import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../v2/app/testing/testProviders';
import SignUpDetailsScreen from '../../../features/auth/screens/signup/SignUpDetailsScreen';

test.each(['abc', 'a'.repeat(51)])('signup explains invalid username length before the password step: %s', async (username) => {
  const { i18n, user } = await renderWithProviders(<SignUpDetailsScreen />, { language: 'ko' });
  await fireEvent.changeText(screen.getByPlaceholderText(i18n.t('auth.signup.usernamePlaceholder')), username);
  await fireEvent.changeText(screen.getByPlaceholderText(i18n.t('auth.signup.emailPlaceholder')), 'user@example.com');
  expect(screen.getByText('아이디는 4자 이상 50자 이하여야 합니다.')).toBeVisible();
  await user.press(screen.getByText(i18n.t('auth.signup.next')));
  expect(screen.getByPlaceholderText(i18n.t('auth.signup.usernamePlaceholder'))).toBeVisible();
  expect(screen.queryByPlaceholderText(i18n.t('auth.signup.passwordPlaceholder'))).toBeNull();
});

test.each(['abcd', 'a'.repeat(50)])('signup accepts the username length boundary: %s', async (username) => {
  const { i18n, user } = await renderWithProviders(<SignUpDetailsScreen />, { language: 'ko' });
  await fireEvent.changeText(screen.getByPlaceholderText(i18n.t('auth.signup.usernamePlaceholder')), username);
  await fireEvent.changeText(screen.getByPlaceholderText(i18n.t('auth.signup.emailPlaceholder')), 'user@example.com');
  await user.press(screen.getByText(i18n.t('auth.signup.next')));
  expect(screen.getByPlaceholderText(i18n.t('auth.signup.passwordPlaceholder'))).toBeVisible();
});

test('password confirmation can be shown and hidden independently without changing either value', async () => {
  const { i18n, user } = await renderWithProviders(<SignUpDetailsScreen />, { language: 'ko' });
  await fireEvent.changeText(screen.getByPlaceholderText(i18n.t('auth.signup.usernamePlaceholder')), 'testuser');
  await fireEvent.changeText(screen.getByPlaceholderText(i18n.t('auth.signup.emailPlaceholder')), 'user@example.com');
  await user.press(screen.getByText(i18n.t('auth.signup.next')));
  const password = screen.getByPlaceholderText(i18n.t('auth.signup.passwordPlaceholder'));
  const confirm = screen.getByPlaceholderText(i18n.t('auth.signup.passwordConfirmPlaceholder'));
  await fireEvent.changeText(password, 'Secret123!');
  await fireEvent.changeText(confirm, 'Secret123!');
  const field = i18n.t('auth.signup.passwordConfirm');
  await user.press(screen.getByRole('button', { name: i18n.t('myPage.profileEdit.showPassword', { field }) }));
  expect(confirm.props.secureTextEntry).toBe(false);
  expect(password.props.secureTextEntry).toBe(true);
  await user.press(screen.getByRole('button', { name: i18n.t('myPage.profileEdit.hidePassword', { field }) }));
  expect(confirm.props.secureTextEntry).toBe(true);
  expect(confirm.props.value).toBe('Secret123!');
  expect(password.props.value).toBe('Secret123!');
});
