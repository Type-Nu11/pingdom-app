import React from 'react';
import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { SETTINGS_DETAIL_IDS } from '../../model/settings.types';
import AccountManagementScreen from '../AccountManagementScreen';
import SettingsDetailPendingScreen from '../SettingsDetailPendingScreen';
import SettingsScreen from '../SettingsScreen';

describe('SettingsScreen', () => {
  test('디자인의 다섯 섹션과 계정 작업 진입점을 보여준다', async () => {
    await renderWithProviders(
      <SettingsScreen
        onBack={jest.fn()}
        onOpenAccountManagement={jest.fn()}
        onOpenDetail={jest.fn()}
        onOpenProfileEdit={jest.fn()}
      />,
    );

    expect(screen.getByText('계정')).toBeTruthy();
    expect(screen.getByText('기록 · 장소')).toBeTruthy();
    expect(screen.getByText('알림')).toBeTruthy();
    expect(screen.getByText('개인정보 · 위치')).toBeTruthy();
    expect(screen.getByText('앱 정보')).toBeTruthy();
    expect(screen.getByText('프로필 편집')).toBeTruthy();
    expect(screen.getByText('아이디 · 이메일')).toBeTruthy();
    expect(screen.getByText('비밀번호 변경')).toBeTruthy();
    expect(screen.getByText('내 발자국 지도')).toBeTruthy();
    expect(screen.getByText('관심 장소 관리')).toBeTruthy();
    expect(screen.getByText('내 기록 관리')).toBeTruthy();
    expect(screen.getByText('위치 정보 설정')).toBeTruthy();
    expect(screen.getByText('데이터 다운로드·삭제')).toBeTruthy();
    expect(screen.getByText('공지사항')).toBeTruthy();
    expect(screen.getByText('이용약관')).toBeTruthy();
    expect(screen.getByText('개인정보 처리방침')).toBeTruthy();
    expect(screen.getByText('버전 정보')).toBeTruthy();
    expect(screen.getByText('1.0.0')).toBeTruthy();
    expect(screen.getByText('로그아웃')).toBeTruthy();
    expect(screen.getByText('회원 탈퇴')).toBeTruthy();
  });

  test('구현된 화면과 준비 중 상세 화면으로 진입을 위임한다', async () => {
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

    await user.press(screen.getByText('프로필 편집'));
    await user.press(screen.getByText('아이디 · 이메일'));
    await user.press(screen.getByText('알림 설정'));
    await user.press(screen.getByText('로그아웃'));
    await user.press(screen.getByText('회원 탈퇴'));

    expect(onOpenProfileEdit).toHaveBeenCalledTimes(1);
    expect(onOpenAccountManagement).toHaveBeenCalledTimes(1);
    expect(onOpenDetail).toHaveBeenNthCalledWith(1, SETTINGS_DETAIL_IDS.NotificationSettings);
    expect(onOpenDetail).toHaveBeenNthCalledWith(2, SETTINGS_DETAIL_IDS.Logout);
    expect(onOpenDetail).toHaveBeenNthCalledWith(3, SETTINGS_DETAIL_IDS.DeleteAccount);
  });
});

describe('AccountManagementScreen', () => {
  test('로그인 정보·내 기록·쿠폰·로그아웃·회원 탈퇴 진입 UI를 제공한다', async () => {
    const onOpenDetail = jest.fn();
    const { user } = await renderWithProviders(
      <AccountManagementScreen onBack={jest.fn()} onOpenDetail={onOpenDetail} />,
    );

    await user.press(screen.getByText('로그인 정보'));
    await user.press(screen.getByText('내 기록'));
    await user.press(screen.getByText('쿠폰'));
    await user.press(screen.getByText('로그아웃'));
    await user.press(screen.getByText('회원 탈퇴'));

    expect(onOpenDetail.mock.calls.map(([detail]) => detail)).toEqual([
      SETTINGS_DETAIL_IDS.LoginInformation,
      SETTINGS_DETAIL_IDS.MyRecords,
      SETTINGS_DETAIL_IDS.Coupons,
      SETTINGS_DETAIL_IDS.Logout,
      SETTINGS_DETAIL_IDS.DeleteAccount,
    ]);
  });
});

describe('SettingsDetailPendingScreen', () => {
  test('미연동 mutation이 실행되지 않았음을 명확하게 안내한다', async () => {
    const onBack = jest.fn();
    const { user } = await renderWithProviders(
      <SettingsDetailPendingScreen detail={SETTINGS_DETAIL_IDS.DeleteAccount} onBack={onBack} />,
    );

    expect(screen.getByText('준비 중인 기능입니다')).toBeTruthy();
    expect(screen.getByText('회원 탈퇴는 아직 연결되지 않았습니다. 계정에는 아무 변경도 적용되지 않았습니다.')).toBeTruthy();

    await user.press(screen.getByText('설정으로 돌아가기'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
