import React from 'react';
import { AppState } from 'react-native';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../app/testing/testProviders';
import { ApiError } from '../../../../shared/api/ApiError';
import { notificationApi } from '../api/notificationApi';
import type { NotificationPermissionAdapter, NotificationPermissionStatus } from '../services/notificationPermission';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';

const initial = { newHotplaceEnabled: false, newLikeEnabled: true, quietHoursEnabled: false,
  quietHoursStart: '22:00:30', quietHoursEnd: '08:00:00', timezone: 'Asia/Seoul' };
function permission(status: NotificationPermissionStatus = 'authorized'): NotificationPermissionAdapter {
  return { read: jest.fn(async () => status), request: jest.fn(async () => status), openSettings: jest.fn(async () => undefined) };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
beforeEach(() => {
  jest.spyOn(notificationApi, 'getNotificationSettings').mockResolvedValue(initial);
  jest.spyOn(notificationApi, 'updateNotificationSettings').mockImplementation(async (body) => ({ ...initial, ...body }));
});

test('generic GET failure describes loading failure, not a save failure', async () => {
  jest.mocked(notificationApi.getNotificationSettings).mockRejectedValue(new ApiError('offline', { isNetworkError: true }));
  await renderWithProviders(<NotificationSettingsScreen onBack={jest.fn()} permissionAdapter={permission()} />);
  expect(await screen.findByText('알림 설정을 불러오지 못했어요.')).toBeVisible();
});

test('optional category values are unknown and disabled, never defaulted to false', async () => {
  jest.mocked(notificationApi.getNotificationSettings).mockResolvedValue({});
  await renderWithProviders(<NotificationSettingsScreen onBack={jest.fn()} permissionAdapter={permission()} />);
  const toggle = await screen.findByRole('switch', { name: '핫플레이스 알림' });
  expect(toggle).toBeDisabled();
  expect(toggle.props.accessibilityState.checked).toBeUndefined();
  expect(toggle.props.accessibilityHint).toContain('올바른 설정값');
});

test('GET initializes categories; unsupported design toggles never save or request permission', async () => {
  const adapter = permission();
  const view = await renderWithProviders(<NotificationSettingsScreen onBack={jest.fn()} permissionAdapter={adapter} />);
  expect(await screen.findByRole('switch', { name: '핫플레이스 알림' })).not.toBeChecked();
  expect(screen.getByRole('switch', { name: '좋아요 알림' })).toBeChecked();
  for (const key of ['pushAll', 'firstRecordTrending', 'recordNewTags', 'favoriteMoodChange', 'frequentAreaHotPlace', 'todayMissionArea', 'weeklyReport', 'nightNotifications', 'marketingEvents']) {
    const toggle = screen.getByTestId(`notification-setting-${key}`);
    expect(toggle).toBeDisabled();
    expect(toggle.props.accessibilityHint).toBeTruthy();
    await view.user.press(toggle);
  }
  expect(notificationApi.updateNotificationSettings).not.toHaveBeenCalled();
  expect(adapter.request).not.toHaveBeenCalled();
});

test('GET loading, error and retry never expose editable false defaults', async () => {
  const get = deferred<typeof initial>();
  jest.mocked(notificationApi.getNotificationSettings).mockReturnValueOnce(get.promise);
  const view = await renderWithProviders(<NotificationSettingsScreen onBack={jest.fn()} permissionAdapter={permission()} />);
  expect(screen.getByText('알림 설정을 불러오는 중')).toBeVisible();
  expect(screen.queryByRole('switch', { name: '핫플레이스 알림' })).toBeNull();
  await act(async () => { get.reject(new ApiError('denied', { status: 403, code: 'ACCESS_DENIED' })); });
  expect(await screen.findByText('알림 설정에 접근할 권한이 없습니다.')).toBeVisible();
  await view.user.press(screen.getByRole('button', { name: '다시 시도' }));
  expect(await screen.findByRole('switch', { name: '좋아요 알림' })).toBeChecked();
});

test.each(['authorized', 'provisional'] as const)('%s enables only selected field without requesting again', async (status) => {
  const adapter = permission(status);
  jest.mocked(notificationApi.getNotificationSettings).mockResolvedValueOnce(initial).mockResolvedValue({ ...initial, newHotplaceEnabled: true });
  const view = await renderWithProviders(<NotificationSettingsScreen onBack={jest.fn()} permissionAdapter={adapter} />);
  await view.user.press(await screen.findByRole('switch', { name: '핫플레이스 알림' }));
  await waitFor(() => expect(notificationApi.updateNotificationSettings).toHaveBeenCalledWith({ newHotplaceEnabled: true }));
  expect(adapter.request).not.toHaveBeenCalled();
  await waitFor(() => expect(screen.getByRole('switch', { name: '핫플레이스 알림' })).toBeChecked());
});

test.each(['denied', 'blocked', 'unavailable', 'error'] as const)('%s never reports successful preference enable', async (status) => {
  const view = await renderWithProviders(<NotificationSettingsScreen onBack={jest.fn()} permissionAdapter={permission(status)} />);
  await view.user.press(await screen.findByRole('switch', { name: '핫플레이스 알림' }));
  await waitFor(() => expect(screen.getByRole('switch', { name: '핫플레이스 알림' })).toBeEnabled());
  expect(notificationApi.updateNotificationSettings).not.toHaveBeenCalled();
  expect(screen.getByRole('switch', { name: '핫플레이스 알림' })).not.toBeChecked();
  expect(screen.getByTestId('notification-setting-newHotplaceEnabled-error').props.accessibilityLiveRegion).toBe('polite');
});

test('leaving during a permission prompt prevents PATCH', async () => {
  const request = deferred<NotificationPermissionStatus>();
  const adapter = permission('notDetermined');
  jest.mocked(adapter.request).mockReturnValue(request.promise);
  const view = await renderWithProviders(<NotificationSettingsScreen onBack={jest.fn()} permissionAdapter={adapter} />);
  expect(adapter.request).not.toHaveBeenCalled();
  await view.user.press(await screen.findByRole('switch', { name: '핫플레이스 알림' }));
  expect(adapter.request).toHaveBeenCalledTimes(1);
  await view.unmount();
  await act(async () => request.resolve('authorized'));
  expect(notificationApi.updateNotificationSettings).not.toHaveBeenCalled();
});

test('disabling server preference does not require OS permission', async () => {
  const adapter = permission('denied');
  const view = await renderWithProviders(<NotificationSettingsScreen onBack={jest.fn()} permissionAdapter={adapter} />);
  await view.user.press(await screen.findByRole('switch', { name: '좋아요 알림' }));
  await waitFor(() => expect(notificationApi.updateNotificationSettings).toHaveBeenCalledWith({ newLikeEnabled: false }));
  expect(adapter.request).not.toHaveBeenCalled();
});

test.each([
  [400, 'INVALID_QUIET_HOURS', '서버의 방해 금지 시간 설정을 확인해 주세요.'],
  [401, 'EXPIRED_TOKEN', '로그인이 만료되었습니다. 다시 로그인해 주세요.'],
  [403, 'ACCESS_DENIED', '알림 설정에 접근할 권한이 없습니다.'],
] as const)('%s rolls back exact prior value and refetches', async (status, code, message) => {
  const patch = deferred<typeof initial>();
  jest.mocked(notificationApi.updateNotificationSettings).mockReturnValueOnce(patch.promise);
  const view = await renderWithProviders(<NotificationSettingsScreen onBack={jest.fn()} permissionAdapter={permission()} />);
  await view.user.press(await screen.findByRole('switch', { name: '좋아요 알림' }));
  await waitFor(() => expect(screen.getByRole('switch', { name: '좋아요 알림' })).not.toBeChecked());
  expect(screen.getByRole('switch', { name: '좋아요 알림' }).props.accessibilityState).toMatchObject({ busy: true, disabled: true });
  await act(async () => patch.reject(new ApiError('failure', { status, code })));
  expect(await screen.findByText(message)).toBeVisible();
  expect(screen.getByRole('switch', { name: '좋아요 알림' })).toBeChecked();
  expect(notificationApi.getNotificationSettings).toHaveBeenCalledTimes(2);
});

test('same-field duplicate presses are blocked while a different field queues safely', async () => {
  const patch = deferred<typeof initial>();
  jest.mocked(notificationApi.updateNotificationSettings).mockReturnValueOnce(patch.promise);
  const view = await renderWithProviders(<NotificationSettingsScreen onBack={jest.fn()} permissionAdapter={permission()} />);
  const like = await screen.findByRole('switch', { name: '좋아요 알림' });
  await fireEvent.press(like);
  await fireEvent.press(like);
  await view.user.press(screen.getByRole('switch', { name: '핫플레이스 알림' }));
  expect(notificationApi.updateNotificationSettings).toHaveBeenCalledTimes(1);
  await act(async () => patch.resolve({ ...initial, newLikeEnabled: false }));
  await waitFor(() => expect(notificationApi.updateNotificationSettings).toHaveBeenCalledTimes(2));
  expect(jest.mocked(notificationApi.updateNotificationSettings).mock.calls.map(([body]) => body)).toEqual([
    { newLikeEnabled: false }, { newHotplaceEnabled: true },
  ]);
});

test.each([{}, { quietHoursStart: null, quietHoursEnd: null }, { quietHoursStart: '25:10:00' }, { timezone: 'Not/AZone' }])(
  'quiet hours handles incomplete runtime values without inventing defaults: %j', async (override) => {
    jest.mocked(notificationApi.getNotificationSettings).mockResolvedValue(
      (Object.keys(override).length ? { ...initial, ...override } : { quietHoursEnabled: true }) as typeof initial,
    );
    await renderWithProviders(<NotificationSettingsScreen onBack={jest.fn()} permissionAdapter={permission()} />);
    expect(await screen.findByText('시간 또는 시간대 정보가 없거나 올바르지 않습니다.')).toBeVisible();
    expect(screen.getByTestId('notification-setting-quietHoursEnabled')).toBeDisabled();
    expect(notificationApi.updateNotificationSettings).not.toHaveBeenCalled();
  },
);

test.each(['ko', 'en'] as const)('%s dark mode presents locale quiet hours and explains read-only policy', async (language) => {
  await renderWithProviders(<NotificationSettingsScreen onBack={jest.fn()} permissionAdapter={permission()} />, { language, appearancePreference: 'DARK' });
  const quiet = await screen.findByTestId('notification-setting-quietHoursEnabled');
  expect(quiet).toBeDisabled();
  const start = new Intl.DateTimeFormat(language, { timeZone: 'UTC', hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(new Date(Date.UTC(2000, 0, 1, 22, 0, 30)));
  expect(screen.getByText(new RegExp(start))).toBeVisible();
  expect(quiet.props.accessibilityHint).not.toContain('notificationSettings.');
  expect(screen.getByTestId('v2-notification-settings-screen')).toHaveStyle({ backgroundColor: '#0F0F11' });
});

test('foreground return refreshes permission; device settings does not change preferences', async () => {
  const subscriptions = jest.spyOn(AppState, 'addEventListener');
  const adapter = permission('denied');
  const view = await renderWithProviders(<NotificationSettingsScreen onBack={jest.fn()} permissionAdapter={adapter} />);
  await view.user.press(await screen.findByRole('button', { name: '기기 알림 설정 열기' }));
  expect(adapter.openSettings).toHaveBeenCalledTimes(1);
  jest.mocked(adapter.read).mockResolvedValue('provisional');
  const listener = subscriptions.mock.calls.find(([type]) => type === 'change')?.[1];
  await act(async () => listener?.('active'));
  expect(await screen.findByText('조용한 알림 허용')).toBeVisible();
  expect(notificationApi.updateNotificationSettings).not.toHaveBeenCalled();
});
