import React from 'react';
import { View } from 'react-native';
import { screen } from '@testing-library/react-native';
import { renderWithProviders, createTestI18n } from '../../../../app/testing/testProviders';
import { SettingsRow, SettingsScreenLayout } from '../components/SettingsLayout';
import SettingsDetailScreen from '../screens/SettingsDetailScreen';
import SettingsDetailPendingScreen from '../screens/SettingsDetailPendingScreen';

const unsupported = ['deleteAccount', 'footprintMap', 'myRecords', 'notices', 'privacyPolicy', 'savedPlaces', 'terms'] as const;

test.each(['ko', 'en'] as const)('%s provides a translated reason for every unsupported feature and only allows returning', async (language) => {
  const i18n = await createTestI18n(language);
  for (const detail of unsupported) {
    const onBack = jest.fn();
    const view = await renderWithProviders(<SettingsDetailPendingScreen detail={detail} onBack={onBack} />, { i18n });
    const description = i18n.t(`settings.details.${detail}.description`);
    expect(description).not.toContain('settings.details.');
    expect(screen.getByText(description)).toBeVisible();
    expect(screen.getAllByRole('button')).toHaveLength(2);
    await view.user.press(screen.getByText(i18n.t('settings.pending.back')));
    expect(onBack).toHaveBeenCalledTimes(1);
    await view.unmount();
  }
});

test('long translated labels and values remain untruncated in a narrow settings row', async () => {
  const label = 'A very long translated setting label with multiple words';
  const reason = 'This feature cannot be changed until the required product policy has been defined.';
  await renderWithProviders(<SettingsScreenLayout testID="narrow-settings">
    <View style={{ width: 320 }}><SettingsRow disabled label={label} subtitle={reason} value="a.long.email.address@example.com" /></View>
  </SettingsScreenLayout>, { language: 'en', appearancePreference: 'DARK' });
  expect(screen.getByText(label).props.numberOfLines).toBeUndefined();
  expect(screen.getByText(reason).props.numberOfLines).toBeUndefined();
  expect(screen.getByText('a.long.email.address@example.com')).toHaveStyle({ flexShrink: 1, maxWidth: '55%' });
  expect(screen.getByRole('button')).toBeDisabled();
});


test('an uncomposed supported detail explains missing navigation instead of claiming the feature is pending', async () => {
  await renderWithProviders(<SettingsDetailScreen detail="coupons" onBack={jest.fn()} />);
  expect(screen.queryByTestId('v2-settings-detail-pending-screen')).toBeNull();
  expect(screen.getByText('이 화면의 탐색 연결을 사용할 수 없습니다. 설정으로 돌아가 다시 시도해 주세요.')).toBeVisible();
});
