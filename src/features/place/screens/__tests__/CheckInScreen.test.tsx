import React from 'react';
import { render, screen, userEvent } from '@testing-library/react-native';

import i18n from '../../../../i18n';
import { useLocationCheckIn } from '../../hooks/useLocationCheckIn';
import CheckInScreen from '../CheckInScreen';

jest.mock('../../hooks/useLocationCheckIn', () => ({
  classifyCheckInError: jest.fn(() => 'network'),
  useLocationCheckIn: jest.fn(),
}));

const baseWorkflow: ReturnType<typeof useLocationCheckIn> = {
  checkInError: null,
  checkInFailure: null,
  checkIns: [],
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  isCheckingIn: false,
  isFetchingNextPage: false,
  isListError: false,
  isListLoading: false,
  listError: null,
  location: {
    canAskAgain: true,
    coordinate: {
      accuracyMeters: 8,
      lat: 37.5,
      lng: 127,
      observedAt: '2026-08-18T05:20:00.000Z',
    },
    refresh: jest.fn(async () => undefined),
    status: 'granted' as const,
  },
  refetchCheckIns: jest.fn(),
  submit: jest.fn(),
  successfulCheckIn: null,
};

describe('CheckInScreen', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('ko');
  });

  test('empty 응답에서는 서버 방문 기록 대신 빈 상태를 표시한다', async () => {
    jest.mocked(useLocationCheckIn).mockReturnValue(baseWorkflow);

    await render(<CheckInScreen onBack={jest.fn()} placeId={17} />);

    expect(screen.getByText('아직 최근 방문 기록이 없습니다.')).toBeVisible();
    expect(screen.queryByTestId('check-in-visit-list')).toBeNull();
  });

  test('서버 체크인 응답만 최근 방문 목록에 표시한다', async () => {
    jest.mocked(useLocationCheckIn).mockReturnValue({
      ...baseWorkflow,
      checkIns: [{
        checkInDate: '2026-08-18',
        distanceMeters: 12.5,
        id: 701,
        observedAt: '2026-08-18T05:20:00.000Z',
        placeId: 17,
        recordedAt: '2026-08-18T05:20:01.000Z',
        status: 'PROXIMITY_MATCHED',
      }],
    });

    await render(<CheckInScreen onBack={jest.fn()} placeId={17} />);

    expect(screen.getByTestId('check-in-visit-list')).toBeVisible();
    expect(screen.getByText('장소 ID 17')).toBeVisible();
    expect(screen.getByText('장소와 13m 거리')).toBeVisible();
  });

  test('위치 권한 거부를 접근성 상태와 복구 동작으로 노출한다', async () => {
    const refresh = jest.fn(async () => undefined);
    jest.mocked(useLocationCheckIn).mockReturnValue({
      ...baseWorkflow,
      location: {
        canAskAgain: true,
        coordinate: null,
        refresh,
        status: 'denied',
      },
    });

    await render(<CheckInScreen onBack={jest.fn()} placeId={17} />);
    await userEvent.setup().press(screen.getByRole('button', { name: '위치 다시 확인' }));

    expect(screen.getAllByText('체크인하려면 위치 권한이 필요합니다.')).toHaveLength(2);
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
