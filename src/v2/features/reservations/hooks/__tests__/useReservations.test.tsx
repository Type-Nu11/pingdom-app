import React, { type PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { reservationApi } from '../../api/reservationApi';
import {
  reservationQueryKeys,
  useCreateReservation,
  useReservationTransition,
} from '../useReservations';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { gcTime: Infinity, retry: false },
      queries: { gcTime: Infinity, retry: false },
    },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, wrapper };
}

describe('reservation mutation cache refresh', () => {
  test('예약 생성 성공 상태를 목록 재검증 완료 전에 반영한다', async () => {
    let finishInvalidation!: () => void;
    let invalidationFinished = false;
    jest.spyOn(reservationApi, 'createReservation').mockResolvedValue({
      availabilityId: 7,
      bookerName: '홍길동',
      bookerPhone: '010-1234-5678',
      canceledAt: null,
      confirmedAt: null,
      createdAt: '2026-09-02T00:00:00Z',
      id: 21,
      productId: 11,
      productType: 'GENERAL',
      quantity: 2,
      requestNote: null,
      reservationEndsAt: '2026-09-02T01:00:00Z',
      reservationStartsAt: '2026-09-02T00:30:00Z',
      status: 'PENDING',
      touristUserId: 3,
      updatedAt: '2026-09-02T00:00:00Z',
    });
    const { queryClient, wrapper } = createWrapper();
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries').mockReturnValue(
      new Promise<void>((resolve) => {
        finishInvalidation = () => {
          invalidationFinished = true;
          resolve();
        };
      }),
    );
    const { result } = await renderHook(() => useCreateReservation(), { wrapper });

    await act(async () => result.current.mutateAsync({
      availabilityId: 7,
      bookerName: '홍길동',
      bookerPhone: '010-1234-5678',
      idempotencyKey: 'issue-295-create',
      quantity: 2,
    }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidationFinished).toBe(false);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: reservationQueryKeys.lists() });

    await act(async () => {
      finishInvalidation();
      await Promise.resolve();
    });
  });

  test('예약 상태 변경도 완료된 API 결과를 캐시 재검증과 분리한다', async () => {
    let finishInvalidation!: () => void;
    jest.spyOn(reservationApi, 'cancelReservation').mockResolvedValue({
      availabilityId: 7,
      bookerName: '홍길동',
      bookerPhone: '010-1234-5678',
      canceledAt: '2026-09-02T00:01:00Z',
      confirmedAt: null,
      createdAt: '2026-09-02T00:00:00Z',
      id: 21,
      productId: 11,
      productType: 'GENERAL',
      quantity: 2,
      requestNote: null,
      reservationEndsAt: '2026-09-02T01:00:00Z',
      reservationStartsAt: '2026-09-02T00:30:00Z',
      status: 'CANCELED',
      touristUserId: 3,
      updatedAt: '2026-09-02T00:01:00Z',
    });
    const { queryClient, wrapper } = createWrapper();
    jest.spyOn(queryClient, 'invalidateQueries').mockReturnValue(
      new Promise<void>((resolve) => {
        finishInvalidation = resolve;
      }),
    );
    const { result } = await renderHook(
      () => useReservationTransition('cancelReservation'),
      { wrapper },
    );

    await act(async () => result.current.mutateAsync(21));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await act(async () => {
      finishInvalidation();
      await Promise.resolve();
    });
  });
});
