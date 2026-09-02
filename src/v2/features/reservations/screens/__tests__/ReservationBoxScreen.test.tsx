import React from 'react';
import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { useReservations } from '../../hooks/useReservations';
import ReservationBoxScreen from '../ReservationBoxScreen';

jest.mock('../../hooks/useReservations', () => ({ useReservations: jest.fn() }));

const reservation = {
  availabilityId: 801,
  canceledAt: null,
  confirmedAt: null,
  createdAt: '2026-09-02T02:01:00Z',
  id: 901,
  productId: 601,
  productType: 'GENERAL' as const,
  quantity: 2,
  status: 'PENDING' as const,
  touristUserId: 201,
  updatedAt: '2026-09-02T02:01:00Z',
};

function queryResult(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    isError: false,
    isLoading: false,
    isRefetching: false,
    refetch: jest.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useReservations>;
}

describe('ReservationBoxScreen', () => {
  test('보유 예약을 쿠폰함 형태의 카드 목록으로 표시하고 상세로 이동한다', async () => {
    const onOpenReservation = jest.fn();
    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: {
        hasNext: false,
        limit: 100,
        page: 1,
        reservations: [reservation],
        totalCount: 1,
        totalPages: 1,
      },
    }));

    const { user } = await renderWithProviders(
      <ReservationBoxScreen
        onBack={jest.fn()}
        onOpenReservation={onOpenReservation}
        onOpenSettings={jest.fn()}
      />,
    );

    expect(screen.getByTestId('v2-reservation-box-screen')).toBeVisible();
    expect(screen.getByText('보유 예약 1건')).toBeVisible();
    expect(screen.getByText('예약 번호 901')).toBeVisible();
    expect(screen.getByText('GENERAL')).toBeVisible();
    expect(screen.getByText('2명 예약')).toBeVisible();
    await user.press(screen.getByTestId('reservation-card-901'));
    expect(onOpenReservation).toHaveBeenCalledWith(901);
  });

  test('뒤로가기와 설정 진입을 제공한다', async () => {
    const onBack = jest.fn();
    const onOpenSettings = jest.fn();
    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { reservations: [], totalCount: 0 },
    }));

    const { user } = await renderWithProviders(
      <ReservationBoxScreen
        onBack={onBack}
        onOpenReservation={jest.fn()}
        onOpenSettings={onOpenSettings}
      />,
    );

    expect(screen.getByText('아직 예약 내역이 없어요.')).toBeVisible();
    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));
    await user.press(screen.getByRole('button', { name: '설정 열기' }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
