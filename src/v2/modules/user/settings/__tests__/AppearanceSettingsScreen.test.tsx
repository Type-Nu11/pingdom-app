import { screen } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../../../app/testing/testProviders';
import AppearanceSettingsScreen from '../screens/AppearanceSettingsScreen';

describe('AppearanceSettingsScreen', () => {
  test('renders three Korean radio options and updates selection immediately', async () => {
    const view = await renderWithProviders(
      <AppearanceSettingsScreen onBack={jest.fn()} />,
      { appearancePreference: 'SYSTEM', language: 'ko' },
    );
    expect(screen.getByRole('radio', { name: '시스템 설정 사용, 선택됨' })).toBeSelected();
    expect(screen.getByRole('radio', { name: '라이트 모드' })).not.toBeSelected();
    expect(screen.getByRole('radio', { name: '다크 모드' })).not.toBeSelected();

    await view.user.press(screen.getByRole('radio', { name: '다크 모드' }));
    expect(screen.getByRole('radio', { name: '다크 모드, 선택됨' })).toBeSelected();
  });

  test('renders English copy without exposing enum values', async () => {
    await renderWithProviders(
      <AppearanceSettingsScreen onBack={jest.fn()} />,
      { appearancePreference: 'LIGHT', language: 'en' },
    );
    expect(screen.getByText('Appearance')).toBeVisible();
    expect(screen.getByRole('radio', { name: 'Use system setting' })).not.toBeSelected();
    expect(screen.getByRole('radio', { name: 'Light mode, Selected' })).toBeSelected();
    expect(screen.getByRole('radio', { name: 'Dark mode' })).not.toBeSelected();
    expect(screen.queryByText('LIGHT')).not.toBeOnTheScreen();
  });
});
