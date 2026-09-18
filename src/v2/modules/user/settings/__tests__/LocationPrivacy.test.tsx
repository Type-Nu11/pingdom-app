import React from 'react';
import { AppState, Linking } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { apiClient } from '../../../../shared/api';
import { darkTheme } from '../../../../shared/theme';
import { accountApi } from '../../account';
import LocationPrivacyScreen from '../screens/LocationPrivacyScreen';

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(), requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(), getCurrentPositionAsync: jest.fn(), watchPositionAsync: jest.fn(),
}));
const permission = (status: string, canAskAgain = true) => ({ status, canAskAgain, granted: status === 'granted', expires: 'never' });
const read = jest.mocked(Location.getForegroundPermissionsAsync);
beforeEach(() => {
  read.mockResolvedValue(permission('undetermined') as Location.LocationPermissionResponse);
  jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
});

test('mount only reads permission, without requesting, collecting, tracking, or exporting', async () => {
  const exportData = jest.spyOn(accountApi, 'getUserDataExport');
  await renderWithProviders(<LocationPrivacyScreen onBack={jest.fn()} />);
  expect(await screen.findByText('권한 필요')).toBeVisible();
  expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  expect(Location.watchPositionAsync).not.toHaveBeenCalled();
  expect(exportData).not.toHaveBeenCalled();
});

test.each([
  ['granted', true, '허용됨', '기기 설정 열기'],
  ['denied', true, '권한 필요', '위치 권한 요청'],
  ['denied', false, '설정에서 허용 필요', '기기 설정 열기'],
  ['restricted', false, '설정에서 허용 필요', '기기 설정 열기'],
])('%s / canAskAgain=%s maps OS state and action', async (status, canAskAgain, label, action) => {
  read.mockResolvedValue(permission(status, canAskAgain) as Location.LocationPermissionResponse);
  await renderWithProviders(<LocationPrivacyScreen onBack={jest.fn()} />);
  expect(await screen.findByText(label)).toBeVisible();
  expect(screen.getByRole('button', { name: action })).toBeEnabled();
  expect(screen.queryAllByRole('switch')).toHaveLength(0);
});

test('explicit request updates denied to granted', async () => {
  jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue(permission('granted') as Location.LocationPermissionResponse);
  const view = await renderWithProviders(<LocationPrivacyScreen onBack={jest.fn()} />);
  await view.user.press(await screen.findByRole('button', { name: '위치 권한 요청' }));
  expect(await screen.findByText('허용됨')).toBeVisible();
  expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
});

test('blocked permission opens OS settings and safely reports failure', async () => {
  read.mockResolvedValue(permission('denied', false) as Location.LocationPermissionResponse);
  const open = jest.spyOn(Linking, 'openSettings').mockRejectedValue(new Error('private native detail'));
  const view = await renderWithProviders(<LocationPrivacyScreen onBack={jest.fn()} />);
  await view.user.press(await screen.findByRole('button', { name: '기기 설정 열기' }));
  expect(open).toHaveBeenCalledTimes(1);
  expect(await screen.findByText('기기 설정을 열지 못했습니다. 다시 시도해 주세요.')).toBeVisible();
  expect(screen.queryByText('private native detail')).toBeNull();
  expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
});

test('foreground return refreshes permission and removes listener on exit', async () => {
  const subscription = jest.spyOn(AppState, 'addEventListener');
  const view = await renderWithProviders(<LocationPrivacyScreen onBack={jest.fn()} />);
  await screen.findByText('권한 필요');
  const listener = subscription.mock.calls.at(-1)![1];
  await act(async () => listener('background'));
  read.mockResolvedValue(permission('granted') as Location.LocationPermissionResponse);
  await act(async () => listener('active'));
  expect(await screen.findByText('허용됨')).toBeVisible();
  await view.unmount();
});

test('disabled location services are unavailable even with permission', async () => {
  read.mockResolvedValue(permission('granted') as Location.LocationPermissionResponse);
  jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(false);
  await renderWithProviders(<LocationPrivacyScreen onBack={jest.fn()} />);
  expect(await screen.findByText('사용할 수 없음')).toBeVisible();
  expect(screen.getByText('현재 기기에서 사용할 수 없음')).toBeVisible();
});

test('native errors show safe retry and recover', async () => {
  read.mockRejectedValueOnce(new Error('native secret'));
  const view = await renderWithProviders(<LocationPrivacyScreen onBack={jest.fn()} />);
  expect(await screen.findByText('확인 실패')).toBeVisible();
  await view.user.press(screen.getByRole('button', { name: '다시 확인' }));
  expect(await screen.findByText('권한 필요')).toBeVisible();
});

test('loading is accessible and late completion after unmount does not collect location', async () => {
  let resolve!: (value: Location.LocationPermissionResponse) => void;
  read.mockImplementationOnce(() => new Promise(r => { resolve = r; }));
  const view = await renderWithProviders(<LocationPrivacyScreen onBack={jest.fn()} />);
  expect(screen.getByLabelText('기기 위치 권한, 확인 중').props.accessibilityState).toMatchObject({ busy: true });
  await view.unmount();
  await act(async () => resolve(permission('granted') as Location.LocationPermissionResponse));
  expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
});

test.each(['ko', 'en'] as const)('%s dark UI offers no unsupported preferences or delete action', async language => {
  const deleteRequest = jest.spyOn(apiClient, 'delete');
  const view = await renderWithProviders(<LocationPrivacyScreen onBack={jest.fn()} />, { language, appearancePreference: 'DARK' });
  await screen.findByRole('button', { name: language === 'ko' ? '위치 권한 요청' : 'Request location permission' });
  expect(screen.queryAllByRole('switch')).toHaveLength(0);
  expect(screen.queryByRole('button', { name: /위치 기록 전체 삭제|Delete all location history/ })).toBeNull();
  await fireEvent.press(screen.getByText(language === 'ko' ? '위치 기록 전체 삭제' : 'Delete all location history'));
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  expect(screen.getByText(language === 'ko' ? '내 데이터 내보내기' : 'Export my data')).toBeVisible();
  expect(deleteRequest).not.toHaveBeenCalled();
  expect(screen.getByTestId('v2-location-privacy-screen')).toHaveStyle({ backgroundColor: darkTheme.colors.background });
});


test('export navigation describes user data and back returns to permission screen without downloading', async () => {
  const exportData = jest.spyOn(accountApi, 'getUserDataExport');
  const onBack = jest.fn();
  const view = await renderWithProviders(<LocationPrivacyScreen onBack={onBack} />);
  await view.user.press(screen.getByRole('button', { name: '내 데이터 내보내기' }));
  expect(screen.getByTestId('v2-data-export-screen')).toBeVisible();
  expect(exportData).not.toHaveBeenCalled();
  await view.user.press(screen.getByLabelText('뒤로가기'));
  expect(await screen.findByText('권한 필요')).toBeVisible();
  expect(onBack).not.toHaveBeenCalled();
});

test('foreground while permission prompt resolves cannot overwrite the granted result', async () => {
  let resolve!: (value: Location.LocationPermissionResponse) => void;
  jest.mocked(Location.requestForegroundPermissionsAsync).mockImplementationOnce(() => new Promise(r => { resolve = r; }));
  const subscription = jest.spyOn(AppState, 'addEventListener');
  const view = await renderWithProviders(<LocationPrivacyScreen onBack={jest.fn()} />);
  await view.user.press(await screen.findByRole('button', { name: '위치 권한 요청' }));
  const listener = subscription.mock.calls.at(-1)![1];
  await act(async () => { listener('inactive'); listener('active'); });
  await act(async () => resolve(permission('granted') as Location.LocationPermissionResponse));
  expect(await screen.findByText('허용됨')).toBeVisible();
});

test('permission request failure is retryable and does not collect coordinates', async () => {
  jest.mocked(Location.requestForegroundPermissionsAsync).mockRejectedValueOnce(new Error('native failure'));
  const view = await renderWithProviders(<LocationPrivacyScreen onBack={jest.fn()} />);
  await view.user.press(await screen.findByRole('button', { name: '위치 권한 요청' }));
  expect(await screen.findByText('확인 실패')).toBeVisible();
  expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
});
