import React, { type ReactElement, type PropsWithChildren } from 'react';
import { render, screen, userEvent } from '@testing-library/react-native';
import { Animated, type GestureResponderHandlers } from 'react-native';
import { I18nextProvider } from 'react-i18next';

import { useReservations } from '../..';
import { registerReservationResources } from '../../i18n/reservationResources';
import { createTestI18n } from '../../../../shared/testing/testProviders';
import ReservationBottomSheet from '../../components/ReservationBottomSheet';

jest.mock('../..', () => ({ useReservations: jest.fn() }));

const navigation = {
  onOpenFavorites: jest.fn(),
  onOpenMap: jest.fn(),
  onOpenRecommendations: jest.fn(),
  onOpenReservation: jest.fn(),
  onPlacePress: jest.fn(),
  onToggleBookmark: jest.fn().mockResolvedValue(undefined),
};
const nearbyPlace = {
  address: '대구광역시 달성군', category: 'CAFE', distance: '123m', distanceMeters: 123,
  id: 101, latitude: 35.65, longitude: 128.41, name: '서버 카페', tags: ['Bookable'],
  verifiedAgo: 'recently', wait: '예약 가능',
};
const bottomSheet = {
  bookmarkedPlaceIds: { '101': true },
  bookmarkPendingPlaceIds: {},
  collapsedTranslateY: 600,
  height: 700,
  isBookmarkStateLoading: false,
  mediumTranslateY: 300,
  nearbyPlaces: [nearbyPlace],
  onHandlePress: jest.fn(),
  panHandlers: {} as GestureResponderHandlers,
  sheetChromeBottom: new Animated.Value(0),
  sheetTranslateY: new Animated.Value(300),
  snapPoint: 'medium' as const,
};
const expandedBottomSheet = {
  ...bottomSheet,
  sheetTranslateY: new Animated.Value(0),
  snapPoint: 'expanded' as const,
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

async function renderReservations(ui: ReactElement, language: 'ko' | 'en' = 'ko') {
  const i18n = await createTestI18n(language);
  registerReservationResources(i18n);
  return render(ui, {
    wrapper: ({ children }: PropsWithChildren) => (
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    ),
  });
}

describe('ReservationBottomSheet', () => {
  test('loading, empty, error 상태를 구분한다', async () => {
    jest.mocked(useReservations).mockReturnValue(queryResult({ isLoading: true }));
    const view = await renderReservations(<ReservationBottomSheet {...expandedBottomSheet} {...navigation} />);
    expect(screen.getByTestId('reservations-loading')).toBeVisible();

    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [], totalCount: 0, totalPages: 0 },
    }));
    await view.rerender(<ReservationBottomSheet {...expandedBottomSheet} {...navigation} />);
    expect(screen.getByTestId('reservations-empty')).toBeVisible();

    jest.mocked(useReservations).mockReturnValue(queryResult({ isError: true }));
    await view.rerender(<ReservationBottomSheet {...expandedBottomSheet} {...navigation} />);
    expect(screen.getByTestId('reservations-error')).toBeVisible();
  });

  test('서버 예약 식별자로 상세 진입한다', async () => {
    const onOpenReservation = jest.fn();
    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [reservation], totalCount: 1, totalPages: 1 },
    }));
    await renderReservations(<ReservationBottomSheet {...expandedBottomSheet} {...navigation} onOpenReservation={onOpenReservation} />);
    await userEvent.setup().press(screen.getByTestId('reservation-card-901'));
    expect(onOpenReservation).toHaveBeenCalledWith(901);
    expect(screen.getByText('확정 대기')).toBeVisible();
  });

  test('UNKNOWN 상태를 안전한 안내로 표시한다', async () => {
    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [{ ...reservation, status: 'UNKNOWN' }], totalCount: 1, totalPages: 1 },
    }));
    await renderReservations(<ReservationBottomSheet {...expandedBottomSheet} {...navigation} />);
    expect(screen.getByText('상태 확인 필요')).toBeVisible();
  });

  test('예약 탭 선택 상태와 다른 탭 이동을 제공한다', async () => {
    const onOpenMap = jest.fn();
    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [], totalCount: 0, totalPages: 0 },
    }));
    await renderReservations(<ReservationBottomSheet {...bottomSheet} {...navigation} onOpenMap={onOpenMap} />);
    expect(screen.getByRole('tab', { name: '예약', selected: true })).toBeVisible();
    await userEvent.setup().press(screen.getByRole('button', { name: '지도' }));
    expect(onOpenMap).toHaveBeenCalledTimes(1);
  });

  test('예약함은 패널을 확장했을 때만 표시한다', async () => {
    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [], totalCount: 0, totalPages: 0 },
    }));
    const view = await renderReservations(<ReservationBottomSheet {...bottomSheet} {...navigation} />);
    expect(screen.queryByText('예약함')).toBeNull();

    await view.rerender(<ReservationBottomSheet {...expandedBottomSheet} {...navigation} />);
    expect(screen.getByText('예약함')).toBeVisible();
  });

  test('실제 주변 예약 가능 장소를 열고 북마크를 해제한다', async () => {
    const onPlacePress = jest.fn();
    const onToggleBookmark = jest.fn().mockResolvedValue(undefined);
    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [], totalCount: 0, totalPages: 0 },
    }));
    await renderReservations(
      <ReservationBottomSheet
        {...bottomSheet}
        {...navigation}
        onPlacePress={onPlacePress}
        onToggleBookmark={onToggleBookmark}
      />,
    );

    await userEvent.setup().press(screen.getByRole('button', { name: '즐겨찾기 해제' }));
    expect(onToggleBookmark).toHaveBeenCalledWith(nearbyPlace, false);

    await userEvent.setup().press(screen.getByRole('button', { name: '서버 카페, 123m' }));
    expect(onPlacePress).toHaveBeenCalledWith(nearbyPlace);
  });

  test('주변 예약 가능 서버 장소가 없으면 더미 카드 대신 빈 상태를 표시한다', async () => {
    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [], totalCount: 0, totalPages: 0 },
    }));
    await renderReservations(
      <ReservationBottomSheet {...bottomSheet} {...navigation} nearbyPlaces={[]} />,
    );

    expect(screen.getByTestId('nearby-reservations-empty')).toBeVisible();
    expect(screen.queryByText('오아시스 팝업 스토어')).toBeNull();
  });

  test('영어에서는 예약 탭과 목록 제목을 영어로 표시한다', async () => {
    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [], totalCount: 0, totalPages: 0 },
    }));

    await renderReservations(
      <ReservationBottomSheet {...bottomSheet} {...navigation} />,
      'en',
    );

    expect(screen.getByText('Reservations near your current location')).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Reservations', selected: true })).toBeVisible();
  });
});
