import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { profileApi } from '../../../my-page/api/profileApi';
import type { Profile } from '../../../my-page/model/profile.types';
import { notificationApi } from '../../../notifications/api/notificationApi';
import LanguageSettingsScreen from '../LanguageSettingsScreen';
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
    expect(screen.getByText('설정')).toHaveStyle({ fontFamily: 'Pretendard' });
    expect(screen.getByText('계정')).toBeVisible();
    expect(screen.getByText('기록 · 장소')).toBeVisible();
    expect(screen.getByText('개인정보 · 위치')).toBeVisible();
    expect(screen.getByText('앱 정보')).toBeVisible();
    await waitFor(() => expect(screen.getByText('woo._sm')).toBeVisible());
  });

  test('프로필 편집 행을 production callback에 연결한다', async () => {
    const onOpenProfileEdit = jest.fn();
    const view = await renderSettings({ onOpenProfileEdit });

    await view.user.press(await screen.findByText('프로필 편집'));
    expect(onOpenProfileEdit).toHaveBeenCalledTimes(1);
  });

  test('MERCHANT에게 관광객 프로필 편집 액션을 노출하지 않는다', async () => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue({
      ...PROFILE,
      role: 'MERCHANT_OWNER',
    });
    await renderSettings();

    await waitFor(() => expect(screen.getByText('woo._sm')).toBeVisible());
    expect(screen.queryByRole('button', { name: '프로필 편집' })).toBeNull();
    expect(screen.queryByRole('button', { name: '비밀번호 변경' })).toBeNull();
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

  test('현재 표시 모드를 보여주고 기존 내부 탐색에 appearance 페이지만 연결한다', async () => {
    const view = await renderSettings();
    expect(screen.getByText('화면 모드')).toBeVisible();
    expect(screen.getByText('라이트 모드')).toBeVisible();

    await view.user.press(screen.getByText('화면 모드'));
    expect(screen.getByTestId('v2-appearance-settings-screen')).toBeVisible();
    expect(screen.getByRole('radio', { name: '라이트 모드, 선택됨' })).toBeSelected();
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
      screen.getByLabelText('핫플레이스 알림'),
    ).toBeEnabled());
    await view.user.press(screen.getByLabelText('핫플레이스 알림'));

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

  test('위치 설정 진입은 실제 권한 화면과 미지원 항목을 표시한다', async () => {
    const view = await renderSettings();
    await view.user.press(screen.getByText('위치 정보 설정'));
    expect(screen.getByTestId('v2-location-privacy-screen')).toBeVisible();
    expect(screen.getByText('GPS 현장 인증')).toBeVisible();
    expect(screen.getByText('공개 범위')).toBeVisible();
    expect(screen.queryAllByRole('switch')).toHaveLength(0);
    expect(screen.getByRole('button', { name: '내 데이터 내보내기' })).toBeEnabled();
  });

  test('로그아웃 연속 탭을 한 번만 처리한다', async () => {
    let resolveLogout: (() => void) | undefined;
    const onLogout = jest.fn(() => new Promise<void>((resolve) => {
      resolveLogout = resolve;
    }));
    await renderSettings({ onLogout });

    const logout = screen.getByLabelText('로그아웃');
    await fireEvent.press(logout);
    await fireEvent.press(logout);
    expect(onLogout).toHaveBeenCalledTimes(1);

    await act(async () => resolveLogout?.());
    await waitFor(() => expect(screen.getByLabelText('로그아웃')).toBeEnabled());
  });
});

test('Android back closes a local language page before delegating to the stack', async () => {
  const { BackHandler } = require('react-native');
  const subscription = jest.spyOn(BackHandler, 'addEventListener');
  const onBack = jest.fn();
  const view = await renderSettings({ onBack });
  await view.user.press(screen.getByText('언어'));
  const handler = subscription.mock.calls.filter(([event]) => event === 'hardwareBackPress').at(-1)?.[1] as () => boolean;
  await act(async () => { expect(handler()).toBe(true); });
  expect(screen.getByText('설정')).toBeVisible();
  expect(onBack).not.toHaveBeenCalled();
  await view.user.press(screen.getByLabelText('뒤로가기'));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('password keeps the existing profile callback when no detail navigator is injected', async () => {
  jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
  const onOpenProfileEdit = jest.fn();
  const view = await renderSettings({ onOpenProfileEdit });
  await screen.findByText('woo._sm');
  await view.user.press(screen.getByText('비밀번호 변경'));
  expect(onOpenProfileEdit).toHaveBeenCalledTimes(1);
});
