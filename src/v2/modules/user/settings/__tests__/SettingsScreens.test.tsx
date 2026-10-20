import React from 'react';
import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../app/testing/testProviders';
import { profileApi } from '../../profile/__tests__';
import { notificationApi } from '../../notifications/__tests__';
import { SETTINGS_DETAIL_IDS } from '../model/settings.types';
import AccountManagementScreen from '../screens/AccountManagementScreen';
import SettingsDetailPendingScreen from '../screens/SettingsDetailPendingScreen';
import SettingsScreen from '../screens/SettingsScreen';

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue({
      birthYear: 1998,
      country: 'KR',
      email: 'pingdom@example.com',
      id: 1,
      language: 'ko',
      profileImageUrl: null,
      username: 'pingdom_user',
    });
    jest.spyOn(notificationApi, 'getNotificationSettings').mockResolvedValue({
      newHotplaceEnabled: true,
      newLikeEnabled: true,
      quietHoursEnabled: false,
    });
  });

  test('설정 루트에서 지원하는 메뉴만 보여준다', async () => {
    await renderWithProviders(
      <SettingsScreen
        onBack={jest.fn()}
        onOpenAccountManagement={jest.fn()}
        onOpenDetail={jest.fn()}
        onOpenProfileEdit={jest.fn()}
      />,
    );

    expect(screen.getByText('계정')).toBeTruthy();
    expect(screen.getByText('알림')).toBeTruthy();
    expect(screen.getByText('개인정보 · 위치')).toBeTruthy();
    expect(await screen.findByText('계정 관리')).toBeTruthy();
    expect(screen.getByText('위치 정보 설정')).toBeTruthy();
    expect(screen.getByText('데이터 관리')).toBeTruthy();
    expect(screen.getByRole('button', { name: '회원 탈퇴' })).toBeTruthy();
    expect(screen.getByText('로그아웃')).toBeTruthy();
    expect(screen.getByText('버전 정보')).toBeTruthy();
    for (const label of ['프로필 편집', '비밀번호 변경', '내 발자국 지도', '관심 장소 관리', '내 기록 관리', '공지사항', '이용약관', '개인정보 처리방침', '쿠폰']) {
      expect(screen.queryByText(label)).toBeNull();
    }
  });

  test('계정 관리와 데이터 관리의 실제 진입점에 위임한다', async () => {
    const onOpenAccountManagement = jest.fn();
    const onOpenDetail = jest.fn();
    const onOpenProfileEdit = jest.fn();
    const { user } = await renderWithProviders(
      <SettingsScreen
        onBack={jest.fn()}
        onOpenAccountManagement={onOpenAccountManagement}
        onOpenDetail={onOpenDetail}
        onOpenProfileEdit={onOpenProfileEdit}
      />,
    );

    await user.press(screen.getByText('계정 관리'));
    await user.press(screen.getByText('데이터 관리'));
    expect(onOpenProfileEdit).not.toHaveBeenCalled();
    expect(onOpenAccountManagement).toHaveBeenCalledTimes(1);
    await user.press(screen.getByRole('button', { name: '회원 탈퇴' }));
    expect(onOpenDetail.mock.calls).toEqual([[SETTINGS_DETAIL_IDS.DataManagement], [SETTINGS_DETAIL_IDS.DeleteAccount]]);
  });
});

describe('AccountManagementScreen', () => {
  test('로그인 정보와 쿠폰을 유지하고 미지원 계정 메뉴를 숨긴다', async () => {
    const onOpenDetail = jest.fn();
    const { user } = await renderWithProviders(
      <AccountManagementScreen onBack={jest.fn()} onOpenDetail={onOpenDetail} onLogout={jest.fn(async () => undefined)} />,
    );

    expect(screen.getByText('로그인 정보')).toBeTruthy();
    await user.press(screen.getByText('쿠폰'));
    expect(screen.queryByText('내 기록')).toBeNull();
    expect(screen.queryByText('회원 탈퇴')).toBeNull();
    expect(screen.queryByText('비밀번호 변경')).toBeNull();
    expect(screen.queryByText('로그아웃')).toBeNull();
    expect(onOpenDetail.mock.calls).toEqual([[SETTINGS_DETAIL_IDS.Coupons]]);
  });
});

describe('SettingsDetailPendingScreen', () => {
  test('미연동 mutation이 실행되지 않았음을 명확하게 안내한다', async () => {
    const onBack = jest.fn();
    const { user } = await renderWithProviders(
      <SettingsDetailPendingScreen detail={SETTINGS_DETAIL_IDS.DeleteAccount} onBack={onBack} />,
    );

    expect(screen.getByText('준비 중인 기능입니다')).toBeTruthy();
    expect(screen.getByText(/재인증과 최종 확인 정책/)).toBeTruthy();

    await user.press(screen.getByText('설정으로 돌아가기'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
