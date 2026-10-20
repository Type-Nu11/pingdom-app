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
    expect(screen.getByRole('radio', { name: '시스템 테마 사용, 선택됨' })).toBeSelected();
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
    expect(screen.getByRole('radio', { name: 'Use system theme' })).not.toBeSelected();
    expect(screen.getByRole('radio', { name: 'Light mode, Selected' })).toBeSelected();
    expect(screen.getByRole('radio', { name: 'Dark mode' })).not.toBeSelected();
    expect(screen.queryByText('LIGHT')).not.toBeOnTheScreen();
  });
});

test.each([
  ['ko', '시스템 테마 사용'],
  ['en', 'Use system theme'],
  ['ja', 'システムテーマを使用'],
  ['zh-CN', '跟随系统主题'],
  ['zh-TW', '使用系統主題'],
  ['vi', 'Dùng chủ đề hệ thống'],
  ['es', 'Tema del sistema'],
  ['pt-BR', 'Tema do sistema'],
  ['th', 'ใช้ธีมของระบบ'],
] as const)('%s 화면 모드의 시스템 옵션은 "시스템 테마" 문구로 설정 행과 내부 화면에 같이 쓰인다', async (language, label) => {
  const view = await renderWithProviders(
    <AppearanceSettingsScreen onBack={jest.fn()} />,
    { appearancePreference: 'LIGHT', language },
  );
  expect(screen.getByRole('radio', { name: label })).not.toBeSelected();
  expect(view.i18n.t('settings.appearance.system')).toBe(label);
});
