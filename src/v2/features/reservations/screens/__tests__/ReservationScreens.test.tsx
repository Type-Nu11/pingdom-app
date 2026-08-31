import type { ReactElement } from 'react';
import { screen } from '@testing-library/react-native';

import {
  createTestI18n,
  renderWithProviders,
} from '../../../../shared/testing/testProviders';
import { registerReservationResources } from '../../i18n/reservationResources';
import CreateReservationScreen from '../CreateReservationScreen';
import ReservationDetailScreen from '../ReservationDetailScreen';
import { usePlaceDetail } from '../../../place-detail/hooks/usePlaceDetail';
import { useAvailabilities, useCreateReservation } from '../../hooks/useReservations';
import { useReservationDetail } from '../../hooks/useReservations';
import { useAllPayments } from '../../../payments/hooks/usePayments';
import { createReservationIdempotencyKey, localDateKey } from '../../model/reservationAvailability';

const FIXED_NOW = new Date(2026, 7, 26, 9, 0, 0);

jest.mock('../../../place-detail/hooks/usePlaceDetail', () => ({ usePlaceDetail: jest.fn() }));
jest.mock('../../hooks/useReservations', () => ({
  useAvailabilities: jest.fn(),
  useCreateReservation: jest.fn(),
  useReservationDetail: jest.fn(),
}));
jest.mock('../../../payments/hooks/usePayments', () => ({ useAllPayments: jest.fn() }));

async function renderReservationScreen(ui: ReactElement, language: 'ko' | 'en' = 'ko') {
  const i18n = await createTestI18n(language);
  registerReservationResources(i18n);
  return renderWithProviders(ui, { i18n });
}

describe('V2 reservation screens', () => {
  beforeEach(() => {
    jest.mocked(useReservationDetail).mockReturnValue({
      data: {
        availabilityId: 801,
        canceledAt: null,
        confirmedAt: null,
        createdAt: '2026-08-25T04:00:00Z',
        id: 901,
        productId: 501,
        productType: 'TICKET',
        quantity: 2,
        status: 'PENDING',
        touristUserId: 101,
        updatedAt: '2026-08-25T04:00:00Z',
      },
      isError: false,
      isPending: false,
    } as ReturnType<typeof useReservationDetail>);
    jest.mocked(useAllPayments).mockReturnValue({
      data: [],
      isError: false,
      isPending: false,
    } as unknown as ReturnType<typeof useAllPayments>);
  });

  function availability(id: number, startsAt: Date, overrides = {}) {
    return {
      id,
      placeId: 17,
      productId: 9 + id,
      productType: 'GENERAL' as const,
      startsAt: startsAt.toISOString(),
      endsAt: new Date(startsAt.getTime() + 60 * 60_000).toISOString(),
      totalCapacity: 12,
      remainingCapacity: 8,
      status: 'ACTIVE' as const,
      ...overrides,
    };
  }

  function mockCreateReservation(mutate = jest.fn()) {
    jest.mocked(useCreateReservation).mockReturnValue({
      isError: false,
      isPending: false,
      isSuccess: false,
      mutate,
    } as unknown as ReturnType<typeof useCreateReservation>);
    return mutate;
  }

  function mockPlace() {
    jest.mocked(usePlaceDetail).mockReturnValue({
      data: { name: '대성반점' },
    } as unknown as ReturnType<typeof usePlaceDetail>);
  }

  function createScreen() {
    return <CreateReservationScreen
      navigation={{ goBack: jest.fn() } as never}
      now={FIXED_NOW}
      route={{ key: 'create', name: 'CreateReservation', params: {
        category: '음식점',
        imageUrl: 'https://example.com/daeseong.jpg',
        placeId: 17,
        placeName: '대성반점',
      } } as never}
    />;
  }

  test('현재 날짜의 달력에서 시작하고 서버 계약 외 입력과 fallback 시간을 표시하지 않는다', async () => {
    mockPlace();
    mockCreateReservation();
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    await renderReservationScreen(createScreen());

    expect(screen.getByTestId('v2-reservation-month')).toHaveTextContent('2026년 8월');
    expect(screen.getByText('이 장소에 등록된 예약 가능 일정이 없습니다.')).toBeVisible();
    expect(screen.queryByPlaceholderText('이름을 입력하세요')).not.toBeOnTheScreen();
    expect(screen.queryByPlaceholderText('전화번호를 입력하세요')).not.toBeOnTheScreen();
    expect(screen.queryByPlaceholderText('전달하고 싶은 내용을 입력해주세요')).not.toBeOnTheScreen();
    expect(screen.queryByText('09:00')).not.toBeOnTheScreen();
    expect(screen.getByTestId('v2-reservation-submit').props.accessibilityState.disabled).toBe(true);
  });

  test('가장 가까운 실제 availability 날짜를 선택하고 실제 ID로만 제출한다', async () => {
    const mutate = mockCreateReservation();
    mockPlace();
    const nearest = new Date(2026, 8, 2, 10, 0, 0);
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [availability(77, nearest)],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    const { user } = await renderReservationScreen(createScreen());

    expect(screen.getByTestId('v2-create-reservation-screen')).toBeVisible();
    expect(await screen.findByText('2026년 9월')).toBeVisible();
    expect(screen.getByTestId('v2-reservation-submit').props.accessibilityState.disabled).toBe(true);
    await user.press(screen.getByTestId('v2-availability-77'));
    expect(screen.getByTestId('v2-reservation-submit').props.accessibilityState.disabled).toBe(false);
    await user.press(screen.getByTestId('v2-reservation-submit'));

    expect(mutate).toHaveBeenCalledTimes(1);
    const body = mutate.mock.calls[0][0];
    expect(Object.keys(body).sort()).toEqual(['availabilityId', 'idempotencyKey', 'quantity']);
    expect(body).toEqual({
      availabilityId: 77,
      idempotencyKey: expect.stringMatching(/^reservation-.{20,}$/),
      quantity: 2,
    });
    expect(body.idempotencyKey.length).toBeLessThanOrEqual(100);
  });

  test('조회 오류와 빈 응답을 구분하고 오류에서 재시도한다', async () => {
    mockPlace();
    mockCreateReservation();
    const refetch = jest.fn();
    jest.mocked(useAvailabilities).mockReturnValue({
      data: undefined,
      isError: true,
      isPending: false,
      refetch,
    } as unknown as ReturnType<typeof useAvailabilities>);

    const { user } = await renderReservationScreen(createScreen());
    expect(screen.getByText('예약 가능 일정을 불러오지 못했습니다.')).toBeVisible();
    expect(screen.queryByText('이 장소에 등록된 예약 가능 일정이 없습니다.')).not.toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: '다시 시도' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  test('availability 조회 중 상태를 빈 응답과 구분한다', async () => {
    mockPlace();
    mockCreateReservation();
    jest.mocked(useAvailabilities).mockReturnValue({
      data: undefined,
      isError: false,
      isPending: true,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    await renderReservationScreen(createScreen());
    expect(screen.getByText('예약 가능 일정을 불러오는 중이에요…')).toBeVisible();
    expect(screen.queryByText('이 장소에 등록된 예약 가능 일정이 없습니다.')).not.toBeOnTheScreen();
  });

  test('INACTIVE와 잔여 인원 부족 슬롯은 텍스트 상태와 함께 비활성화한다', async () => {
    mockPlace();
    mockCreateReservation();
    const startsAt = new Date(2026, 7, 27, 10, 0, 0);
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [
        availability(77, startsAt),
        availability(78, startsAt, { status: 'INACTIVE' }),
        availability(79, startsAt, { remainingCapacity: 1 }),
      ],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    await renderReservationScreen(createScreen());
    expect(await screen.findByText('예약 불가 · 비활성 일정')).toBeVisible();
    expect(screen.getByText('잔여 1명 · 인원 부족')).toBeVisible();
    expect(screen.getByTestId('v2-availability-78').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByTestId('v2-availability-79').props.accessibilityState.disabled).toBe(true);
  });

  test('인원 증가로 수용 인원이 부족해지면 기존 선택을 해제한다', async () => {
    mockPlace();
    mockCreateReservation();
    const startsAt = new Date(2026, 7, 27, 10, 0, 0);
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [availability(77, startsAt, { remainingCapacity: 2 }), availability(88, startsAt, { remainingCapacity: 12 })],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    const { user } = await renderReservationScreen(createScreen());
    await user.press(await screen.findByTestId('v2-availability-77'));
    expect(screen.getByTestId('v2-reservation-submit').props.accessibilityState.disabled).toBe(false);
    await user.press(screen.getByRole('button', { name: '3명' }));
    expect(screen.getByTestId('v2-availability-77').props.accessibilityState.selected).toBe(false);
    expect(screen.getByTestId('v2-reservation-submit').props.accessibilityState.disabled).toBe(true);
  });

  test('실패 후 동일 제출 재시도에는 같은 idempotency key를 쓴다', async () => {
    mockPlace();
    const mutate = jest.fn((_body, options) => {
      options?.onError?.(new Error('network'), undefined, undefined);
    });
    mockCreateReservation(mutate);
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [availability(77, new Date(2026, 7, 27, 10, 0, 0))],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    const { user } = await renderReservationScreen(createScreen());
    await user.press(await screen.findByTestId('v2-availability-77'));
    await user.press(screen.getByTestId('v2-reservation-submit'));
    expect(mutate).toHaveBeenCalledTimes(1);
    const firstKey = mutate.mock.calls[0][0].idempotencyKey;
    await user.press(screen.getByTestId('v2-reservation-submit'));
    expect(mutate).toHaveBeenCalledTimes(2);
    expect(mutate.mock.calls[1][0].idempotencyKey).toBe(firstKey);
  });

  test('mutation 진행 중에는 중복 제출을 차단한다', async () => {
    mockPlace();
    const mutate = mockCreateReservation();
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [availability(77, new Date(2026, 7, 27, 10, 0, 0))],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    const { user } = await renderReservationScreen(createScreen());
    await user.press(await screen.findByTestId('v2-availability-77'));
    await user.press(screen.getByTestId('v2-reservation-submit'));
    await user.press(screen.getByTestId('v2-reservation-submit'));
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  test('성공으로 화면을 떠난 뒤 새 예약 시도에는 새로운 idempotency key를 만든다', async () => {
    mockPlace();
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [availability(77, new Date(2026, 7, 27, 10, 0, 0))],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);
    const firstMutate = mockCreateReservation();
    const firstAttempt = await renderReservationScreen(createScreen());
    await firstAttempt.user.press(await screen.findByTestId('v2-availability-77'));
    await firstAttempt.user.press(screen.getByTestId('v2-reservation-submit'));
    const firstKey = firstMutate.mock.calls[0][0].idempotencyKey;
    firstAttempt.unmount();

    const secondMutate = mockCreateReservation();
    const secondAttempt = await renderReservationScreen(createScreen());
    await secondAttempt.user.press(await screen.findByTestId('v2-availability-77'));
    await secondAttempt.user.press(screen.getByTestId('v2-reservation-submit'));
    expect(secondMutate.mock.calls[0][0].idempotencyKey).not.toBe(firstKey);
  });

  test('영어에서도 availability 상태를 명시적으로 표시한다', async () => {
    mockPlace();
    mockCreateReservation();
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [availability(77, new Date(2026, 7, 27, 10, 0, 0), { remainingCapacity: 1 })],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    await renderReservationScreen(createScreen(), 'en');
    expect(screen.getByText('Availability exists, but no slots can accommodate 2 guests.')).toBeVisible();
  });

  test('로컬 date key는 UTC 날짜 문자열 절단 없이 사용자 날짜를 유지하고 키는 충분한 entropy를 갖는다', () => {
    expect(localDateKey(new Date(2026, 7, 26, 0, 30, 0))).toBe('2026-08-26');
    const key = createReservationIdempotencyKey(() => 1234, () => 0.5);
    expect(key).toMatch(/^reservation-ya-/);
    expect(key.length).toBeLessThanOrEqual(100);
  });

  test('예약 상세는 전달받은 실제 예약 식별자를 표시한다', async () => {
    const onBack = jest.fn();
    const { user } = await renderReservationScreen(
      <ReservationDetailScreen onBack={onBack} reservationId={901} />,
    );

    expect(screen.getByText('901')).toBeVisible();
    expect(screen.getByText('결제 내역이 없어요')).toBeVisible();
    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test('모든 페이지에서 합쳐진 결제 중 예약에 연결된 내역만 표시한다', async () => {
    jest.mocked(useAllPayments).mockReturnValue({
      data: [
        {
          amountMinor: 10000,
          createdAt: '2026-08-25T03:02:00Z',
          currency: 'KRW',
          failedAt: null,
          failureCode: null,
          id: 1001,
          paidAt: '2026-08-25T03:03:00Z',
          provider: 'TOSS_PAYMENTS',
          providerPaymentId: 'pay_1001',
          refundedAt: null,
          reservationId: 999,
          status: 'PAID',
        },
        {
          amountMinor: 25000,
          createdAt: '2026-08-25T04:02:00Z',
          currency: 'KRW',
          failedAt: null,
          failureCode: null,
          id: 1002,
          paidAt: '2026-08-25T04:03:00Z',
          provider: 'TOSS_PAYMENTS',
          providerPaymentId: 'pay_1002',
          refundedAt: null,
          reservationId: 901,
          status: 'REFUND_PROCESSING',
        },
      ],
      isError: false,
      isPending: false,
    } as unknown as ReturnType<typeof useAllPayments>);

    await renderReservationScreen(
      <ReservationDetailScreen onBack={jest.fn()} reservationId={901} />,
    );

    expect(screen.getByText('REFUND_PROCESSING')).toBeVisible();
    expect(screen.getByText('최소 화폐 단위 금액·통화: 25000 KRW')).toBeVisible();
    expect(screen.queryByText('결제 번호 1001')).not.toBeOnTheScreen();
    expect(screen.queryByText('결제 내역이 없어요')).not.toBeOnTheScreen();
  });

  test('영어에서는 예약 상세 문구를 영어로 표시한다', async () => {
    await renderReservationScreen(
      <ReservationDetailScreen onBack={jest.fn()} reservationId={901} />,
      'en',
    );

    expect(screen.getByText('Reservation details')).toBeVisible();
    expect(screen.getByText('Reservation ID')).toBeVisible();
  });
});
