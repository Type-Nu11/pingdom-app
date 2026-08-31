import React from 'react';
import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import NotificationSettingsScreen from '../NotificationSettingsScreen';

const onBack = jest.fn();

describe('NotificationSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('디자인의 다섯 섹션과 아홉 가지 알림 항목을 렌더링한다', async () => {
    await renderWithProviders(<NotificationSettingsScreen onBack={onBack} />);

    expect(screen.getByText('내 기록 · 장소')).toBeTruthy();
    expect(screen.getByText('관심 장소 · 구역')).toBeTruthy();
    expect(screen.getByText('리포트')).toBeTruthy();
    expect(screen.getByText('기타')).toBeTruthy();
    expect(screen.getAllByRole('switch')).toHaveLength(9);
    expect(screen.getByText('First Recorder로 남긴 장소가 뜨면 알려드려요')).toBeTruthy();
  });

  test('토글은 on/off 상태를 접근성 정보에 반영하고 화면 안에서만 변경한다', async () => {
    const firstRender = await renderWithProviders(<NotificationSettingsScreen onBack={onBack} />);
    const pushAll = screen.getByRole('switch', { name: '푸시 알림 전체 허용' });
    const mission = screen.getByRole('switch', { name: '오늘의 미션 구역' });

    expect(pushAll.props.accessibilityState).toMatchObject({ checked: true });
    expect(mission.props.accessibilityState).toMatchObject({ checked: false });

    await firstRender.user.press(pushAll);
    expect(screen.getByRole('switch', { name: '푸시 알림 전체 허용' }).props.accessibilityState)
      .toMatchObject({ checked: false });
    // 마스터 토글의 정책이 확정되지 않았으므로 하위 값을 추정해 함께 바꾸지 않는다.
    expect(screen.getByRole('switch', { name: '주간 리포트' }).props.accessibilityState)
      .toMatchObject({ checked: true });

    firstRender.unmount();
    await renderWithProviders(<NotificationSettingsScreen onBack={onBack} />);
    expect(screen.getByRole('switch', { name: '푸시 알림 전체 허용' }).props.accessibilityState)
      .toMatchObject({ checked: true });
  });

  test('저장 중인 토글은 busy/disabled로 표시하고 오류 문구를 알린다', async () => {
    await renderWithProviders(
      <NotificationSettingsScreen
        onBack={onBack}
        presentationStates={{
          favoriteMoodChange: { errorMessage: '변경하지 못했어요.' },
          weeklyReport: { isLoading: true },
        }}
      />,
    );

    expect(screen.getByRole('switch', { name: '주간 리포트' }).props.accessibilityState)
      .toMatchObject({ busy: true, disabled: true });
    expect(screen.getByText('변경하지 못했어요.').props.accessibilityLiveRegion).toBe('polite');
  });

  test('화면 로딩과 오류 상태를 표시하고 다시 시도를 제공한다', async () => {
    const onRetry = jest.fn();
    const loadingRender = await renderWithProviders(
      <NotificationSettingsScreen onBack={onBack} state="loading" />,
    );
    expect(screen.getByText('알림 설정을 불러오는 중')).toBeTruthy();

    loadingRender.unmount();
    const errorRender = await renderWithProviders(
      <NotificationSettingsScreen onBack={onBack} onRetry={onRetry} state="error" />,
    );
    expect(screen.getByText('알림 설정을 불러오지 못했어요.')).toBeTruthy();

    await errorRender.user.press(screen.getByRole('button', { name: '다시 시도' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('뒤로가기 버튼을 호출한다', async () => {
    const { user } = await renderWithProviders(<NotificationSettingsScreen onBack={onBack} />);

    await user.press(screen.getByRole('button', { name: '뒤로가기' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
