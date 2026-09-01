import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { profileApi } from '../../../my-page/api/profileApi';
import type { Profile } from '../../../my-page/model/profile.types';
import { notificationApi } from '../../../notifications/api/notificationApi';
import LanguageSettingsScreen from '../LanguageSettingsScreen';
import LocationPrivacyScreen, { type LocationPermissionPresentationState } from '../LocationPrivacyScreen';
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

function renderLocationPrivacy(permissionState?: LocationPermissionPresentationState) {
  return renderWithProviders(
    <LocationPrivacyScreen onBack={jest.fn()} permissionState={permissionState} />,
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

  test('설정 루트는 현재 언어만 표시하고 선택은 전용 페이지에서 제공한다', async () => {
    const view = await renderSettings();

    expect(screen.getByText('환경설정')).toBeVisible();
    expect(screen.getByText('언어')).toBeVisible();
    expect(screen.getByText('한국어')).toBeVisible();
    expect(screen.queryByText('영어')).not.toBeOnTheScreen();

    await view.user.press(screen.getByText('언어'));

    expect(screen.getByTestId('v2-language-settings-screen')).toBeVisible();
    expect(screen.getByText('언어 설정')).toBeVisible();
    expect(screen.getByRole('radio', { name: '한국어, 선택됨' })).toBeSelected();
    expect(screen.getByRole('radio', { name: '영어' })).not.toBeSelected();
  });

  test('언어 전용 페이지에서 선택과 뒤로가기를 각각 처리한다', async () => {
    const onBack = jest.fn();
    const onSelectLanguage = jest.fn();
    const view = await renderWithProviders(
      <LanguageSettingsScreen
        onBack={onBack}
        onSelectLanguage={onSelectLanguage}
      />,
    );

    await view.user.press(screen.getByRole('radio', { name: '영어' }));
    expect(onSelectLanguage).toHaveBeenCalledWith('en');

    await view.user.press(screen.getByLabelText('뒤로가기'));
    expect(onBack).toHaveBeenCalledTimes(1);
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

  test('위치·개인정보 화면은 미연결 상태와 전체 정보 구조를 명확히 표시한다', async () => {
    const view = await renderSettings();
    await view.user.press(screen.getByText('위치 정보 설정'));

    expect(screen.getByTestId('v2-location-privacy-screen')).toBeVisible();
    expect(screen.getByText('GPS 현장 인증')).toBeVisible();
    expect(screen.getByText('공개 범위')).toBeVisible();
    expect(screen.getAllByText('연결 전')).toHaveLength(2);
    expect(screen.getByText(/권한 요청과 위치 수집은 아직 연결되지 않았어요/)).toBeVisible();
    expect(screen.getByLabelText('위치 기반 서비스 허용')).toBeDisabled();
    expect(screen.getByLabelText('기록할 때만 위치 수집')).toBeDisabled();
    expect(screen.getByLabelText('GPS 현장 인증')).toBeDisabled();
  });

  test.each([
    ['denied', '기기 설정에서 위치 권한이 거부되어 있어요'],
    ['restricted', '기기 정책에 의해 위치 사용이 제한되어 있어요'],
  ] as const)('%s 위치 권한 상태를 안전하게 표현한다', async (state, description) => {
    await renderLocationPrivacy(state);

    expect(screen.getByText(description)).toBeVisible();
    expect(screen.getByLabelText('위치 기반 서비스 허용')).toBeDisabled();
  });

  test('다운로드와 공개 범위 진입은 미연결 안내만 하고 삭제 진입은 비파괴 경고를 표시한다', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const view = await renderLocationPrivacy();

    await view.user.press(screen.getByText('내 발자국 지도'));
    expect(alertSpy).toHaveBeenLastCalledWith(
      '내 발자국 지도',
      expect.stringContaining('지금은 화면만 미리 볼 수 있어요'),
      [{ text: '확인' }],
    );

    await view.user.press(screen.getByText('내 위치 기록 다운로드'));
    expect(alertSpy).toHaveBeenLastCalledWith(
      '내 위치 기록 다운로드',
      expect.stringContaining('지금은 화면만 미리 볼 수 있어요'),
      [{ text: '확인' }],
    );

    await view.user.press(screen.getByText('위치 기록 전체 삭제'));
    expect(alertSpy).toHaveBeenLastCalledWith(
      '위치 기록 전체 삭제',
      expect.stringContaining('어떤 위치 기록도 삭제되지 않습니다'),
      [{ style: 'cancel', text: '확인' }],
    );
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
