import React from 'react';
import { render, screen, userEvent } from '@testing-library/react-native';
import { Animated, type GestureResponderHandlers } from 'react-native';

import { useReservations } from '../../../../v2/features/reservations';
import ReservationBottomSheet from '../../components/ReservationBottomSheet';

jest.mock('../../../../v2/features/reservations', () => ({ useReservations: jest.fn() }));

const navigation = {
  onOpenFavorites: jest.fn(),
  onOpenMap: jest.fn(),
  onOpenRecommendations: jest.fn(),
  onOpenReservation: jest.fn(),
  onOpenVerification: jest.fn(),
};
const bottomSheet = {
  collapsedTranslateY: 600,
  height: 700,
  mediumTranslateY: 300,
  onHandlePress: jest.fn(),
  panHandlers: {} as GestureResponderHandlers,
  sheetChromeBottom: new Animated.Value(0),
  sheetTranslateY: new Animated.Value(300),
  showPreviewFixtures: false,
  snapPoint: 'medium' as const,
};
const reservation = {
  availabilityId: 801, canceledAt: null, completedAt: null, confirmedAt: null,
  createdAt: '2026-07-23T05:30:00Z', id: 901, productId: 601,
  productType: 'SERVICE' as const, quantity: 2, status: 'PENDING' as const,
  touristUserId: 201, updatedAt: '2026-07-23T05:30:00Z',
};

function queryResult(overrides: Record<string, unknown> = {}) {
  return ({ data: undefined, isError: false, isLoading: false, refetch: jest.fn(), ...overrides } as unknown as ReturnType<typeof useReservations>);
}

describe('ReservationBottomSheet', () => {
  test('loading, empty, error 상태를 구분한다', async () => {
    jest.mocked(useReservations).mockReturnValue(queryResult({ isLoading: true }));
    const view = await render(<ReservationBottomSheet {...bottomSheet} {...navigation} />);
    expect(screen.getByTestId('reservations-loading')).toBeVisible();

    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [], totalCount: 0, totalPages: 0 },
    }));
    await view.rerender(<ReservationBottomSheet {...bottomSheet} {...navigation} />);
    expect(screen.getByTestId('reservations-empty')).toBeVisible();

    jest.mocked(useReservations).mockReturnValue(queryResult({ isError: true }));
    await view.rerender(<ReservationBottomSheet {...bottomSheet} {...navigation} />);
    expect(screen.getByTestId('reservations-error')).toBeVisible();
  });

  test('서버 예약 식별자로 상세 진입한다', async () => {
    const onOpenReservation = jest.fn();
    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [reservation], totalCount: 1, totalPages: 1 },
    }));
    await render(<ReservationBottomSheet {...bottomSheet} {...navigation} onOpenReservation={onOpenReservation} />);
    await userEvent.setup().press(screen.getByTestId('reservation-card-901'));
    expect(onOpenReservation).toHaveBeenCalledWith(901);
    expect(screen.getByText('확정 대기')).toBeVisible();
  });

  test('UNKNOWN 상태를 안전한 안내로 표시한다', async () => {
    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [{ ...reservation, status: 'UNKNOWN' }], totalCount: 1, totalPages: 1 },
    }));
    await render(<ReservationBottomSheet {...bottomSheet} {...navigation} />);
    expect(screen.getByText('상태 확인 필요')).toBeVisible();
  });

  test('예약 탭 선택 상태와 다른 탭 이동을 제공한다', async () => {
    const onOpenMap = jest.fn();
    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [], totalCount: 0, totalPages: 0 },
    }));
    await render(<ReservationBottomSheet {...bottomSheet} {...navigation} onOpenMap={onOpenMap} />);
    expect(screen.getByRole('tab', { name: '예약', selected: true })).toBeVisible();
    await userEvent.setup().press(screen.getByRole('button', { name: '지도' }));
    expect(onOpenMap).toHaveBeenCalledTimes(1);
  });

  test('더미 주변 장소의 북마크를 선택하고 해제한다', async () => {
    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [], totalCount: 0, totalPages: 0 },
    }));
    await render(<ReservationBottomSheet {...bottomSheet} {...navigation} />);

    const firstBookmark = screen.getAllByRole('button', { name: '즐겨찾기 해제' })[0];
    await userEvent.setup().press(firstBookmark);

    expect(screen.getAllByRole('button', { name: '즐겨찾기 해제' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: '즐겨찾기' })).toHaveLength(2);
  });

  test('검증하기 버튼에서 검증 화면으로 이동한다', async () => {
    const onOpenVerification = jest.fn();
    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [], totalCount: 0, totalPages: 0 },
    }));
    await render(
      <ReservationBottomSheet
        {...bottomSheet}
        {...navigation}
        onOpenVerification={onOpenVerification}
        showPreviewFixtures
        snapPoint="expanded"
      />,
    );

    await userEvent.setup().press(screen.getByRole('button', { name: '검증하기' }));
    expect(onOpenVerification).toHaveBeenCalledTimes(1);
  });

  test('검증하기 버튼은 바텀 시트를 올렸을 때만 표시한다', async () => {
    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [], totalCount: 0, totalPages: 0 },
    }));

    const view = await render(
      <ReservationBottomSheet {...bottomSheet} {...navigation} showPreviewFixtures />,
    );
    expect(screen.queryByRole('button', { name: '검증하기' })).toBeNull();

    await view.rerender(
      <ReservationBottomSheet {...bottomSheet} {...navigation} showPreviewFixtures snapPoint="expanded" />,
    );
    expect(screen.getByRole('button', { name: '검증하기' })).toBeVisible();
  });
});
