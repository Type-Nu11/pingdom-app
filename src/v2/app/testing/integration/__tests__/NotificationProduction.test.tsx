import React from 'react';
import { act, screen, waitFor } from '@testing-library/react-native';
import { BackHandler } from 'react-native';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import MainNavigator, { NotificationSettingsRouteScreen } from '../../../../../app/navigation/MainNavigator';
import type { MainStackParamList } from '../../../../../app/navigation/types';
import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { notificationApi } from '../../../../modules/user/notifications/__tests__';
import { SettingsScreen } from '../../../../features/settings';

jest.mock('../../../../modules/place/map/screens/MapScreen', () => () => null);
jest.mock('expo-notifications', () => ({}));

test('production notification page never interprets allow-all as two category consents', async () => {
  jest.spyOn(notificationApi, 'getNotificationSettings').mockResolvedValue({
    newHotplaceEnabled: true, newLikeEnabled: false, quietHoursEnabled: false,
  });
  const patch = jest.spyOn(notificationApi, 'updateNotificationSettings');
  const view = await renderWithProviders(<SettingsScreen initialPage="notifications" onBack={jest.fn()} />);
  const toggle = await screen.findByRole('switch', { name: '푸시 알림 전체 허용' });
  expect(toggle).toBeDisabled();
  await view.user.press(toggle);
  expect(patch).not.toHaveBeenCalled();
  expect(screen.getByRole('switch', { name: '핫플레이스 알림' })).toBeChecked();
  expect(screen.getByRole('switch', { name: '좋아요 알림' })).not.toBeChecked();
});

test('actual production NotificationSettings route uses GET and PATCH and pops back', async () => {
  jest.spyOn(notificationApi, 'getNotificationSettings').mockResolvedValue({ newHotplaceEnabled: true, newLikeEnabled: false });
  const patch = jest.spyOn(notificationApi, 'updateNotificationSettings').mockResolvedValue({ newHotplaceEnabled: false, newLikeEnabled: false });
  const goBack = jest.fn();
  const view = await renderWithProviders(<NotificationSettingsRouteScreen
    navigation={{ goBack } as never} route={{ key: 'notifications', name: 'NotificationSettings' }} />);
  await view.user.press(await screen.findByRole('switch', { name: '핫플레이스 알림' }));
  await waitFor(() => expect(patch).toHaveBeenCalledWith({ newHotplaceEnabled: false }));
  await view.user.press(screen.getByRole('button', { name: '뒤로가기' }));
  expect(goBack).toHaveBeenCalledTimes(1);
});

test('production stack navigates Settings → notifications → Settings with server-backed content', async () => {
  jest.spyOn(notificationApi, 'getNotificationSettings').mockResolvedValue({ newHotplaceEnabled: true });
  const ref = createNavigationContainerRef<MainStackParamList>();
  const view = await renderWithProviders(<NavigationContainer ref={ref}><MainNavigator /></NavigationContainer>);
  await act(async () => { ref.navigate('Settings'); });
  await view.user.press(await screen.findByText('알림 설정'));
  expect(await screen.findByRole('switch', { name: '핫플레이스 알림' })).toBeChecked();
  expect(ref.getCurrentRoute()?.name).toBe('NotificationSettings');
  await view.user.press(screen.getByRole('button', { name: '뒤로가기' }));
  expect(ref.getCurrentRoute()?.name).toBe('Settings');
});

test('Android back from the local notification page returns to Settings root first', async () => {
  const subscription = jest.spyOn(BackHandler, 'addEventListener');
  const onBack = jest.fn();
  const view = await renderWithProviders(<SettingsScreen onBack={onBack} />);
  await view.user.press(screen.getByText('알림 설정'));
  const handler = subscription.mock.calls.filter(([event]) => event === 'hardwareBackPress').at(-1)?.[1];
  await act(async () => { expect(handler?.()).toBe(true); });
  expect(screen.getByTestId('v2-settings-screen')).toBeVisible();
  expect(onBack).not.toHaveBeenCalled();
  await view.user.press(screen.getByRole('button', { name: '뒤로가기' }));
  expect(onBack).toHaveBeenCalledTimes(1);
});
