import React from 'react';
import { render, screen, userEvent } from '@testing-library/react-native';

import { useReservations } from '../../../../v2/features/reservations';
import ReservationsScreen from '../ReservationsScreen';

jest.mock('../../../../v2/features/reservations', () => ({ useReservations: jest.fn() }));

const navigation = {
  onOpenFavorites: jest.fn(),
  onOpenMap: jest.fn(),
  onOpenReservation: jest.fn(),
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

describe('ReservationsScreen', () => {
  test('loading, empty, error 상태를 구분한다', async () => {
    jest.mocked(useReservations).mockReturnValue(queryResult({ isLoading: true }));
    const view = await render(<ReservationsScreen {...navigation} />);
    expect(screen.getByTestId('reservations-loading')).toBeVisible();

    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [], totalCount: 0, totalPages: 0 },
    }));
    await view.rerender(<ReservationsScreen {...navigation} />);
    expect(screen.getByTestId('reservations-empty')).toBeVisible();

    jest.mocked(useReservations).mockReturnValue(queryResult({ isError: true }));
    await view.rerender(<ReservationsScreen {...navigation} />);
    expect(screen.getByTestId('reservations-error')).toBeVisible();
  });

  test('서버 예약 식별자로 상세 진입한다', async () => {
    const onOpenReservation = jest.fn();
    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [reservation], totalCount: 1, totalPages: 1 },
    }));
    await render(<ReservationsScreen {...navigation} onOpenReservation={onOpenReservation} />);
    await userEvent.setup().press(screen.getByTestId('reservation-card-901'));
    expect(onOpenReservation).toHaveBeenCalledWith(901);
    expect(screen.getByText('확정 대기')).toBeVisible();
  });

  test('UNKNOWN 상태를 안전한 안내로 표시한다', async () => {
    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [{ ...reservation, status: 'UNKNOWN' }], totalCount: 1, totalPages: 1 },
    }));
    await render(<ReservationsScreen {...navigation} />);
    expect(screen.getByText('상태 확인 필요')).toBeVisible();
  });

  test('예약 탭 선택 상태와 다른 탭 이동을 제공한다', async () => {
    const onOpenMap = jest.fn();
    jest.mocked(useReservations).mockReturnValue(queryResult({
      data: { hasNext: false, limit: 20, page: 1, reservations: [], totalCount: 0, totalPages: 0 },
    }));
    await render(<ReservationsScreen {...navigation} onOpenMap={onOpenMap} />);
    expect(screen.getByRole('tab', { name: '예약', selected: true })).toBeVisible();
    await userEvent.setup().press(screen.getByRole('button', { name: '지도' }));
    expect(onOpenMap).toHaveBeenCalledTimes(1);
  });
});
