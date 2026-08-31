import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { profileApi } from '../../../my-page/api/profileApi';
import type { Profile } from '../../../my-page/model/profile.types';
import { notificationApi } from '../../../notifications/api/notificationApi';
import SettingsScreen from '../SettingsScreen';

const PROFILE: Profile = {
  birthYear: 1998,
  country: 'South Korea',
  email: 'woo.sm@pingdom.app',
  id: 1,
  language: 'ko',
  profileImageUrl: null,
  role: 'USER',
  username: 'woo._sm',
};

function renderSettings(overrides: Partial<React.ComponentProps<typeof SettingsScreen>> = {}) {
  return renderWithProviders(
    <SettingsScreen
      onBack={jest.fn()}
      onLogout={jest.fn(async () => undefined)}
      onOpenProfileEdit={jest.fn()}
      {...overrides}
    />,
  );
}

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
    jest.spyOn(notificationApi, 'getNotificationSettings').mockResolvedValue({
      newHotplaceEnabled: true,
      newLikeEnabled: true,
      quietHoursEnabled: false,
    });
    jest.spyOn(notificationApi, 'updateNotificationSettings').mockImplementation(async (body) => ({
      newHotplaceEnabled: true,
      newLikeEnabled: true,
      quietHoursEnabled: false,
      ...body,
    }));
  });

  test('설정 진입 시 디자인의 섹션과 실제 프로필 값을 표시한다', async () => {
    await renderSettings();

    expect(screen.getByTestId('v2-settings-screen')).toBeVisible();
    expect(screen.getByText('설정')).toBeVisible();
    expect(screen.getByText('계정')).toBeVisible();
    expect(screen.getByText('기록 · 장소')).toBeVisible();
    expect(screen.getByText('개인정보 · 위치')).toBeVisible();
    expect(screen.getByText('앱 정보')).toBeVisible();
    await waitFor(() => expect(screen.getByText('woo._sm')).toBeVisible());
  });

  test('프로필 편집 행을 production callback에 연결한다', async () => {
    const onOpenProfileEdit = jest.fn();
    const view = await renderSettings({ onOpenProfileEdit });

    await view.user.press(screen.getByText('프로필 편집'));
    expect(onOpenProfileEdit).toHaveBeenCalledTimes(1);
  });

  test('알림 하위 화면은 서버 설정을 읽고 해당 field만 변경한다', async () => {
    const view = await renderSettings();
    await view.user.press(screen.getByText('알림 설정'));

    await waitFor(() => expect(
      screen.getByLabelText('내가 먼저 기록한 장소 급상승'),
    ).toBeEnabled());
    fireEvent(screen.getByLabelText('내가 먼저 기록한 장소 급상승'), 'valueChange', false);

    await waitFor(() => expect(notificationApi.updateNotificationSettings).toHaveBeenCalledWith({
      newHotplaceEnabled: false,
    }));
    await waitFor(() => expect(notificationApi.getNotificationSettings).toHaveBeenCalledTimes(2));
  });

  test('하위 화면의 뒤로가기는 설정 루트로 복귀하고 루트 뒤로가기는 navigation을 호출한다', async () => {
    const onBack = jest.fn();
    const view = await renderSettings({ onBack });

    await view.user.press(screen.getByText('아이디 · 이메일'));
    expect(screen.getByText('계정 관리')).toBeVisible();
    await view.user.press(screen.getByLabelText('뒤로가기'));
    expect(screen.getByText('설정')).toBeVisible();
    expect(onBack).not.toHaveBeenCalled();

    await view.user.press(screen.getByLabelText('뒤로가기'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test('로그아웃 연속 탭을 한 번만 처리한다', async () => {
    let resolveLogout: (() => void) | undefined;
    const onLogout = jest.fn(() => new Promise<void>((resolve) => {
      resolveLogout = resolve;
    }));
    await renderSettings({ onLogout });

    const logout = screen.getByLabelText('로그아웃');
    fireEvent.press(logout);
    fireEvent.press(logout);
    expect(onLogout).toHaveBeenCalledTimes(1);

    await act(async () => resolveLogout?.());
    await waitFor(() => expect(screen.getByLabelText('로그아웃')).toBeEnabled());
  });
});
