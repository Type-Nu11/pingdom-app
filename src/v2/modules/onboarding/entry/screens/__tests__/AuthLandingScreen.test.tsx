import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../../../../app/testing/testProviders';
import AuthLandingScreen from '../AuthLandingScreen';

describe('AuthLandingScreen', () => {
  test.each(['kr', 'foreign'] as const)(
    '%s 진입에서도 기존 계정 로그인과 회원가입을 모두 제공한다',
    async (entryVariant) => {
      const onLogin = jest.fn();
      const onSignup = jest.fn();
      await renderWithProviders(
        <AuthLandingScreen entryVariant={entryVariant} onBack={jest.fn()} onLogin={onLogin} onSignup={onSignup} />,
        { language: 'en' },
      );

      await fireEvent.press(screen.getByTestId('auth-landing-login'));
      await fireEvent.press(screen.getByTestId('auth-landing-signup'));

      expect(onLogin).toHaveBeenCalledTimes(1);
      expect(onSignup).toHaveBeenCalledTimes(1);
    },
  );

  test('시스템 다크 테마에서도 같은 화면과 동작을 유지한다', async () => {
    const onLogin = jest.fn();
    await renderWithProviders(
      <AuthLandingScreen entryVariant="foreign" onBack={jest.fn()} onLogin={onLogin} onSignup={jest.fn()} />,
      { colorScheme: 'dark', appearancePreference: 'SYSTEM', language: 'en' },
    );

    await fireEvent.press(screen.getByTestId('auth-landing-login'));
    expect(onLogin).toHaveBeenCalledTimes(1);
  });
});
