import React from 'react';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import MainNavigator from '../MainNavigator';
import { SettingsRouteScreen as StandaloneSettingsRouteScreen, AccountManagementRouteScreen as StandaloneAccountRouteScreen } from '../../../v2/app/navigation/RootNavigator';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../v2/shared/testing/testProviders';
import { profileApi } from '../../../v2/features/my-page/api/profileApi';
import { notificationApi } from '../../../v2/features/notifications/api/notificationApi';
import { AccountManagementRouteScreen, NotificationSettingsRouteScreen, SettingsDetailRouteScreen, SettingsRouteScreen } from '../MainNavigator';
import { useAuthStore } from '../../store/authStore';
import { offerCouponApi } from '../../../v2/features/offers-coupons/api/offerCouponApi';
import { checkInApi } from '../../../v2/features/check-ins/api/checkInApi';
import type { MainScreenProps } from '../types';

jest.mock('../../../v2/features/map/screens/MapScreen', () => () => null);
jest.mock('expo-notifications', () => ({}));

const navigation = {
  addListener: jest.fn(() => jest.fn()), goBack: jest.fn(), navigate: jest.fn(), replace: jest.fn(),
} as unknown as MainScreenProps<'Settings'>['navigation'];

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(profileApi, 'listMyReviews').mockResolvedValue({ reviews: [], totalElements: 0 } as never);
  jest.spyOn(offerCouponApi, 'listCoupons').mockResolvedValue({ coupons: [], totalElements: 0 } as never);
  jest.spyOn(checkInApi, 'listCheckIns').mockResolvedValue({ checkIns: [], serverTotalElements: 0 } as never);
  jest.spyOn(profileApi, 'getProfile').mockResolvedValue({
    id: 1, username: 'actual_user', email: 'actual@example.com', birthYear: 1998,
    country: 'KR', language: 'ko', profileImageUrl: null, role: 'USER',
  });
  jest.spyOn(notificationApi, 'getNotificationSettings').mockResolvedValue({
    newHotplaceEnabled: true, newLikeEnabled: false, quietHoursEnabled: false,
  });
});

test.each([
  ['프로필 편집', 'ProfileEdit'],
  ['아이디 · 이메일', 'AccountManagement'],
  ['비밀번호 변경', 'ProfileEdit'],
  ['쿠폰', 'CouponBox'],
  ['알림 설정', 'NotificationSettings'],
])('%s opens %s once even for consecutive taps', async (label, destination) => {
  await renderWithProviders(<SettingsRouteScreen navigation={navigation} route={{ key: 'settings', name: 'Settings' }} />);
  await screen.findByText('actual_user');
  const row = await screen.findByText(label);
  await fireEvent.press(row);
  await fireEvent.press(row);
  expect(navigation.navigate).toHaveBeenCalledTimes(1);
  expect(navigation.navigate).toHaveBeenCalledWith(destination);
});

test('unsupported records preserve the detail parameter without opening a different product', async () => {
  const view = await renderWithProviders(<SettingsRouteScreen navigation={navigation} route={{ key: 'settings', name: 'Settings' }} />);
  await view.user.press(screen.getByText('내 기록 관리'));
  expect(navigation.navigate).toHaveBeenCalledWith('SettingsDetail', { detail: 'myRecords' });
});


test.each([
  ['프로필 편집', 'ProfileEdit'], ['비밀번호 변경', 'ProfileEdit'], ['쿠폰', 'CouponBox'],
])('account %s shares the root destination %s', async (label, destination) => {
  await renderWithProviders(<AccountManagementRouteScreen navigation={navigation as never} route={{ key: 'account', name: 'AccountManagement' }} />);
  await screen.findByText('actual_user');
  await fireEvent.press(screen.getByText(label));
  await fireEvent.press(screen.getByText(label));
  expect(navigation.navigate).toHaveBeenCalledTimes(1);
  expect(navigation.navigate).toHaveBeenCalledWith(destination);
});

test('focus return releases navigation lock', async () => {
  const view = await renderWithProviders(<SettingsRouteScreen navigation={navigation} route={{ key: 'settings', name: 'Settings' }} />);
  await screen.findByText('actual_user');
  await view.user.press(screen.getByText('쿠폰'));
  const focus = jest.mocked(navigation.addListener).mock.calls.find(([event]) => event === 'focus')?.[1];
  await act(async () => (focus as () => void)());
  await view.user.press(screen.getByText('쿠폰'));
  expect(navigation.navigate).toHaveBeenCalledTimes(2);
});

test.each(['root', 'account'])('%s logout calls production session once and never navigates to a placeholder', async (source) => {
  let complete!: () => void;
  const logout = jest.fn(() => new Promise<void>((resolve) => { complete = resolve; }));
  const original = useAuthStore.getState().logout;
  useAuthStore.setState({ logout });
  try {
    await renderWithProviders(source === 'root'
      ? <SettingsRouteScreen navigation={navigation} route={{ key: 'settings', name: 'Settings' }} />
      : <AccountManagementRouteScreen navigation={navigation as never} route={{ key: 'account', name: 'AccountManagement' }} />);
    await screen.findByText('actual_user');
    const row = screen.getByRole('button', { name: '로그아웃' });
    await fireEvent.press(row);
    await fireEvent.press(row);
    expect(logout).toHaveBeenCalledTimes(1);
    expect(row).toBeDisabled();
    expect(navigation.navigate).not.toHaveBeenCalled();
    await act(async () => complete());
  } finally { await act(async () => useAuthStore.setState({ logout: original })); }
});

test('notification route back pops the stack instead of opening a nested settings root', async () => {
  const view = await renderWithProviders(<NotificationSettingsRouteScreen navigation={navigation as never} route={{ key: 'notifications', name: 'NotificationSettings' }} />);
  await view.user.press(screen.getByLabelText('뒤로가기'));
  expect(navigation.goBack).toHaveBeenCalledTimes(1);
});

test('detail route preserves loginInformation param and displays actual identity', async () => {
  const view = await renderWithProviders(<SettingsDetailRouteScreen navigation={navigation as never} route={{ key: 'detail', name: 'SettingsDetail', params: { detail: 'loginInformation' } }} />);
  expect(await screen.findByText('actual@example.com')).toBeVisible();
  await view.user.press(screen.getByLabelText('뒤로가기'));
  expect(navigation.goBack).toHaveBeenCalledTimes(1);
});


test('legacy SettingsDetail coupon params resolve to the actual route without a back loop', async () => {
  await renderWithProviders(<SettingsDetailRouteScreen navigation={navigation as never} route={{ key: 'detail', name: 'SettingsDetail', params: { detail: 'coupons' } }} />);
  expect(navigation.replace).toHaveBeenCalledWith('CouponBox');
  expect(screen.queryByTestId('v2-settings-detail-pending-screen')).toBeNull();
});


test.each([
  ['쿠폰', 'CouponBox'], ['비밀번호 변경', 'ProfileEdit'], ['알림 설정', 'NotificationSettings'],
])('standalone root %s uses the production destination %s', async (label, destination) => {
  await renderWithProviders(<StandaloneSettingsRouteScreen navigation={navigation as never} route={{ key: 'settings', name: 'Settings' }} />);
  await screen.findByText('actual_user');
  await fireEvent.press(screen.getByText(label));
  expect(navigation.navigate).toHaveBeenCalledWith(destination);
  expect(navigation.navigate).toHaveBeenCalledTimes(1);
});

test('standalone account coupon uses the production destination', async () => {
  await renderWithProviders(<StandaloneAccountRouteScreen navigation={navigation as never} route={{ key: 'account', name: 'AccountManagement' }} />);
  await screen.findByText('actual_user');
  await fireEvent.press(screen.getByText('쿠폰'));
  expect(navigation.navigate).toHaveBeenCalledWith('CouponBox');
});

test('production stack registers every supported settings destination', async () => {
  const ref = createNavigationContainerRef();
  await renderWithProviders(<NavigationContainer ref={ref}><MainNavigator /></NavigationContainer>);
  expect(ref.getRootState().routeNames).toEqual(expect.arrayContaining([
    'Settings', 'AccountManagement', 'SettingsDetail', 'ProfileEdit', 'CouponBox', 'NotificationSettings',
  ]));
});
