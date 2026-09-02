import type { ReactElement } from 'react';
import { screen } from '@testing-library/react-native';

import { ApiError } from '../../../../shared/api';
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
        bookerName: '김민수',
        bookerPhone: '010-1234-5678',
        canceledAt: null,
        confirmedAt: null,
        createdAt: '2026-08-25T04:00:00Z',
        id: 901,
        productId: 501,
        productType: 'TICKET',
        quantity: 2,
        requestNote: '창가 자리 부탁드려요',
        reservationEndsAt: '2026-08-27T07:00:00Z',
        reservationStartsAt: '2026-08-27T06:00:00Z',
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

  async function fillBooker(
    user: Awaited<ReturnType<typeof renderReservationScreen>>['user'],
    {
      name = '홍길동',
      note = '',
      phone = '010-1234-5678',
    }: { name?: string; note?: string; phone?: string } = {},
  ) {
    if (name) await user.type(screen.getByTestId('v2-booker-name'), name);
    if (phone) await user.type(screen.getByTestId('v2-booker-phone'), phone);
    if (note) await user.type(screen.getByTestId('v2-booker-note'), note);
  }

  test('현재 날짜의 달력에서 시작하고 실서버 필수 예약자 입력을 표시한다', async () => {
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
    // The booker fields are contract-backed (ReservationCreateRequest), so they
    // render; the screen still invents no fallback time.
    expect(screen.getByTestId('v2-booker-name')).toBeVisible();
    expect(screen.getByTestId('v2-booker-phone')).toBeVisible();
    expect(screen.getByTestId('v2-booker-note')).toBeVisible();
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
    // A real slot enables the button, but the create still needs booker details.
    expect(screen.getByTestId('v2-reservation-submit').props.accessibilityState.disabled).toBe(false);
    await user.press(screen.getByTestId('v2-reservation-submit'));
    expect(mutate).not.toHaveBeenCalled();
    expect(screen.getByTestId('v2-booker-name-error')).toBeVisible();

    await fillBooker(user, {
      name: '홍길동',
      note: '창가 자리 부탁드립니다.',
      phone: '010-1234-5678',
    });
    await user.press(screen.getByTestId('v2-reservation-submit'));

    expect(mutate).toHaveBeenCalledTimes(1);
    const body = mutate.mock.calls[0][0];
    expect(Object.keys(body).sort()).toEqual([
      'availabilityId',
      'bookerName',
      'bookerPhone',
      'idempotencyKey',
      'quantity',
      'requestNote',
    ]);
    expect(body).toEqual({
      availabilityId: 77,
      bookerName: '홍길동',
      bookerPhone: '010-1234-5678',
      idempotencyKey: expect.stringMatching(/^reservation-.{20,}$/),
      quantity: 2,
      requestNote: '창가 자리 부탁드립니다.',
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
    expect(screen.getByTestId('v2-availability-78').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByTestId('v2-availability-79').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByTestId('v2-availability-78').props.accessibilityLabel).toContain('예약 불가 · 비활성 일정');
    expect(screen.getByTestId('v2-availability-79').props.accessibilityLabel).toContain('잔여 1명 · 인원 부족');
    expect(screen.getByText('예약 불가 · 비활성 일정')).toBeVisible();
    expect(screen.getByText('잔여 1명 · 인원 부족')).toBeVisible();
  });

  test('첨부 디자인처럼 오전과 오후 탭으로 시간 버튼을 구분한다', async () => {
    mockPlace();
    mockCreateReservation();
    const morning = new Date(2026, 7, 27, 10, 0, 0);
    const afternoon = new Date(2026, 7, 27, 14, 0, 0);
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [availability(77, morning), availability(88, afternoon)],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    const { user } = await renderReservationScreen(createScreen());
    expect(screen.getByRole('tab', { name: '오전' }).props.accessibilityState.selected).toBe(true);
    expect(screen.getByText('10:00')).toBeVisible();
    expect(screen.queryByText('14:00')).not.toBeOnTheScreen();

    await user.press(screen.getByRole('tab', { name: '오후' }));
    expect(screen.getByRole('tab', { name: '오후' }).props.accessibilityState.selected).toBe(true);
    expect(screen.getByText('14:00')).toBeVisible();
    expect(screen.queryByText('10:00')).not.toBeOnTheScreen();
  });

  test('선택 인원을 수용하지 못해도 실제 일정 날짜와 시간을 숨기지 않는다', async () => {
    mockPlace();
    mockCreateReservation();
    const startsAt = new Date(2026, 8, 2, 10, 0, 0);
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [availability(77, startsAt, { remainingCapacity: 1 })],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    await renderReservationScreen(createScreen());

    expect(await screen.findByText('2026년 9월')).toBeVisible();
    expect(screen.getByRole('button', { name: '2026-09-02, 일정 있음' })).toBeEnabled();
    expect(screen.getByText('현재 2명이 예약 가능한 시간은 없습니다. 아래에서 등록된 일정과 예약 불가 사유를 확인해 주세요.')).toBeVisible();
    expect(screen.getByText('10:00')).toBeVisible();
    expect(screen.getByTestId('v2-availability-77')).toBeDisabled();
    expect(screen.getByTestId('v2-availability-77').props.accessibilityLabel).toContain('잔여 1명 · 인원 부족');
    expect(screen.getByText('잔여 1명 · 인원 부족')).toBeVisible();
  });

  test('지난 일정도 캘린더에서 일정이 있는 날짜로 식별한다', async () => {
    mockPlace();
    mockCreateReservation();
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [availability(77, new Date(2026, 7, 26, 8, 0, 0))],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    await renderReservationScreen(createScreen());

    expect(screen.getByRole('button', { name: '2026-08-26, 일정 있음' })).toBeEnabled();
    expect(screen.getByTestId('v2-availability-77').props.accessibilityLabel).toContain('예약 불가 · 지난 시간');
    expect(screen.getByText('예약 불가 · 지난 시간')).toBeVisible();
  });

  test('오늘보다 이전인 일정 날짜는 캘린더에서 예약 불가 상태로 비활성화한다', async () => {
    mockPlace();
    mockCreateReservation();
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [availability(77, new Date(2026, 7, 25, 10, 0, 0))],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    await renderReservationScreen(createScreen());

    expect(screen.getByRole('button', { name: '2026-08-25, 예약 불가' })).toBeDisabled();
    expect(screen.queryByTestId('v2-availability-77')).toBeNull();
    expect(screen.getByTestId('v2-reservation-submit').props.accessibilityState.disabled).toBe(true);
  });

  test('여러 날에 걸친 availability 기간 전체를 표시하고 종료 전까지 예약 가능하다', async () => {
    mockPlace();
    mockCreateReservation();
    const startsAt = new Date(2026, 8, 2, 17, 28, 0);
    const endsAt = new Date(2026, 8, 5, 0, 0, 0);
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [availability(77, startsAt, { endsAt: endsAt.toISOString() })],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    await renderReservationScreen(
      <CreateReservationScreen
        navigation={{ goBack: jest.fn() } as never}
        now={new Date(2026, 8, 2, 17, 45, 0)}
        route={{ key: 'create', name: 'CreateReservation', params: {
          placeId: 17,
          placeName: '대성반점',
        } } as never}
      />,
    );

    for (const date of ['02', '03', '04', '05']) {
      expect(screen.getByRole('button', { name: `2026-09-${date}, 예약 가능` })).toBeEnabled();
    }
    expect(screen.getByText('17:28')).toBeVisible();
    expect(screen.queryByText(/9월 2일 17:28.9월 5일 00:00/)).not.toBeOnTheScreen();
    expect(screen.getByTestId('v2-availability-77')).toBeEnabled();
    expect(screen.queryByText('예약 불가 · 지난 시간')).not.toBeOnTheScreen();
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
    await fillBooker(user);
    expect(screen.getByTestId('v2-reservation-submit').props.accessibilityState.disabled).toBe(false);
    await user.press(screen.getByRole('button', { name: '3명' }));
    expect(screen.getByTestId('v2-availability-77').props.accessibilityState.selected).toBe(false);
    expect(screen.getByTestId('v2-reservation-submit').props.accessibilityState.disabled).toBe(true);
  });

  test('상품명이 없는 TICKET/CLASS는 선택·제출할 수 없고 GENERAL 시간만 살아 있다', async () => {
    mockPlace();
    const mutate = mockCreateReservation();
    const startsAt = new Date(2026, 7, 27, 10, 0, 0);
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [
        availability(77, startsAt),
        availability(78, startsAt, { productType: 'TICKET' }),
        availability(79, startsAt, { productType: 'CLASS' }),
      ],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    const { user } = await renderReservationScreen(createScreen());

    // GENERAL slot stays selectable and submittable.
    await user.press(await screen.findByTestId('v2-availability-77'));
    await fillBooker(user);
    expect(screen.getByTestId('v2-reservation-submit').props.accessibilityState.disabled).toBe(false);

    // TICKET/CLASS render as disabled rows, the reason shows as visible copy,
    // and the raw product type or an invented product name is never exposed.
    expect(screen.getByTestId('v2-availability-78').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByTestId('v2-availability-79').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByText('상품 정보를 불러올 수 없어 현재 예약할 수 없습니다.')).toBeVisible();
    expect(screen.getByTestId('v2-availability-78').props.accessibilityLabel)
      .toContain('상품 정보를 불러올 수 없어 현재 예약할 수 없습니다.');
    expect(screen.queryByText(/TICKET/)).not.toBeOnTheScreen();
    expect(screen.queryByText(/CLASS/)).not.toBeOnTheScreen();

    // Pressing a blocked row does not move the selection off the GENERAL slot.
    await user.press(screen.getByTestId('v2-availability-78'));
    expect(screen.getByTestId('v2-availability-77').props.accessibilityState.selected).toBe(true);

    await user.press(screen.getByTestId('v2-reservation-submit'));
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toEqual({
      availabilityId: 77,
      bookerName: '홍길동',
      bookerPhone: '010-1234-5678',
      idempotencyKey: expect.stringMatching(/^reservation-/),
      quantity: 2,
    });
  });

  test('GENERAL 없이 TICKET/CLASS만 있으면 빈 상태·오류가 아닌 상품 정보 부족 안내를 보여준다', async () => {
    mockPlace();
    mockCreateReservation();
    const startsAt = new Date(2026, 7, 27, 10, 0, 0);
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [
        availability(78, startsAt, { productType: 'TICKET' }),
        availability(79, startsAt, { productType: 'CLASS' }),
      ],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    await renderReservationScreen(createScreen());

    expect(await screen.findByText('상품 정보를 불러올 수 없어 현재 예약할 수 없습니다.')).toBeVisible();
    expect(screen.queryByText('이 장소에 등록된 예약 가능 일정이 없습니다.')).not.toBeOnTheScreen();
    expect(screen.queryByText('예약 가능 일정을 불러오지 못했습니다.')).not.toBeOnTheScreen();
    expect(screen.getByTestId('v2-reservation-submit').props.accessibilityState.disabled).toBe(true);
  });

  test('알 수 없는 productType은 GENERAL로 fallback하지 않고 비활성 안내만 남긴다', async () => {
    mockPlace();
    mockCreateReservation();
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [availability(80, new Date(2026, 7, 27, 10, 0, 0), { productType: 'TABLE' })],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    await renderReservationScreen(createScreen());

    expect(await screen.findByText('지원하지 않는 예약 유형이라 현재 예약할 수 없습니다.')).toBeVisible();
    expect(screen.queryByTestId('v2-availability-80')).toBeNull();
    expect(screen.getByTestId('v2-reservation-submit').props.accessibilityState.disabled).toBe(true);
  });

  test('영어에서도 상품 정보 부족 상태를 영어 안내로 표시한다', async () => {
    mockPlace();
    mockCreateReservation();
    const startsAt = new Date(2026, 7, 27, 10, 0, 0);
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [availability(77, startsAt), availability(78, startsAt, { productType: 'TICKET' })],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    await renderReservationScreen(createScreen(), 'en');

    expect(
      await screen.findByText(
        "This item can't be reserved right now because its product details are unavailable.",
      ),
    ).toBeVisible();
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
    await fillBooker(user);
    await user.press(screen.getByTestId('v2-reservation-submit'));
    expect(mutate).toHaveBeenCalledTimes(1);
    const firstKey = mutate.mock.calls[0][0].idempotencyKey;
    await user.press(screen.getByTestId('v2-reservation-submit'));
    expect(mutate).toHaveBeenCalledTimes(2);
    expect(mutate.mock.calls[1][0].idempotencyKey).toBe(firstKey);
  });

  test('서버 재고 충돌은 구체적으로 안내하고 availability를 갱신한다', async () => {
    mockPlace();
    const refetch = jest.fn();
    const capacityError = new ApiError('예약 가능한 인원이 부족합니다.', {
      code: 'AVAILABILITY_CAPACITY_EXCEEDED',
      status: 409,
    });
    const mutate = jest.fn((_body, options) => {
      options?.onError?.(capacityError, undefined, undefined);
    });
    jest.mocked(useCreateReservation).mockReturnValue({
      error: capacityError,
      isError: true,
      isPending: false,
      isSuccess: false,
      mutate,
    } as unknown as ReturnType<typeof useCreateReservation>);
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [availability(77, new Date(2026, 7, 27, 10, 0, 0))],
      isError: false,
      isPending: false,
      refetch,
    } as unknown as ReturnType<typeof useAvailabilities>);

    const { user } = await renderReservationScreen(createScreen());
    expect(screen.getByText('잔여 인원이 부족합니다. 갱신된 일정을 확인해 주세요.')).toBeVisible();
    await user.press(await screen.findByTestId('v2-availability-77'));
    await fillBooker(user);
    await user.press(screen.getByTestId('v2-reservation-submit'));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  test('서버가 허용하지 않는 연락처 문자는 제출 전에 차단한다', async () => {
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
    await user.type(screen.getByTestId('v2-booker-name'), 'Test User');
    await user.type(screen.getByTestId('v2-booker-phone'), '010.1234.5678');

    await user.press(screen.getByTestId('v2-reservation-submit'));
    expect(screen.getByTestId('v2-booker-phone-error')).toHaveTextContent(
      '숫자와 + ( ) - 공백만 입력할 수 있어요.',
    );
    expect(mutate).not.toHaveBeenCalled();
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
    await fillBooker(user);
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
    await fillBooker(firstAttempt.user);
    await firstAttempt.user.press(screen.getByTestId('v2-reservation-submit'));
    const firstKey = firstMutate.mock.calls[0][0].idempotencyKey;
    firstAttempt.unmount();

    const secondMutate = mockCreateReservation();
    const secondAttempt = await renderReservationScreen(createScreen());
    await secondAttempt.user.press(await screen.findByTestId('v2-availability-77'));
    await fillBooker(secondAttempt.user);
    await secondAttempt.user.press(screen.getByTestId('v2-reservation-submit'));
    expect(secondMutate.mock.calls[0][0].idempotencyKey).not.toBe(firstKey);
  });

  test('예약 성공 화면은 확정 대기 아이콘과 상·하단 복귀 동작을 제공한다', async () => {
    const goBack = jest.fn();
    mockPlace();
    jest.mocked(useCreateReservation).mockReturnValue({
      isError: false,
      isPending: false,
      isSuccess: true,
      mutate: jest.fn(),
    } as unknown as ReturnType<typeof useCreateReservation>);
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    const { user } = await renderReservationScreen(
      <CreateReservationScreen
        navigation={{ goBack }}
        now={FIXED_NOW}
        route={{ params: { placeId: 17, placeName: '대성반점' } } as never}
      />,
    );

    expect(screen.getByTestId('v2-reservation-success-screen')).toBeVisible();
    expect(screen.getByTestId('v2-reservation-success-icon')).toBeVisible();
    expect(screen.getByText('예약 요청이 접수되었습니다')).toBeVisible();
    expect(screen.getByText('예약함에서 확정 상태를 확인할 수 있습니다.')).toBeVisible();
    await user.press(screen.getByRole('button', { name: '돌아가기' }));
    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));
    expect(goBack).toHaveBeenCalledTimes(2);
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
    expect(screen.getByText('No current times can accommodate 2 guests. Review the published schedule and unavailable reasons below.')).toBeVisible();
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

    // Server states reach the screen through the shared status selector, so the
    // raw enum is never shown.
    expect(screen.getByTestId('v2-payment-status-1002')).toHaveTextContent('! 환불 진행 중');
    expect(screen.queryByText('REFUND_PROCESSING')).not.toBeOnTheScreen();
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

  test('잘못된 전화번호 형식은 서버 제약에 맞춰 차단하고 오류를 표시한다', async () => {
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
    await fillBooker(user, { name: '홍길동', phone: '010-abcd-5678' });
    await user.press(screen.getByTestId('v2-reservation-submit'));

    expect(mutate).not.toHaveBeenCalled();
    expect(screen.getByTestId('v2-booker-phone-error')).toHaveTextContent(
      '숫자와 + ( ) - 공백만 입력할 수 있어요.',
    );
  });

  test('요청 사항이 비어 있으면 생성 요청에서 제외한다', async () => {
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
    await fillBooker(user);
    await user.press(screen.getByTestId('v2-reservation-submit'));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).not.toHaveProperty('requestNote');
  });

  test('생성 성공 화면에 선택한 일시와 마스킹된 예약자 이름을 표시한다', async () => {
    mockPlace();
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [availability(77, new Date(2026, 7, 27, 10, 0, 0))],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);
    jest.mocked(useCreateReservation).mockReturnValue({
      data: {
        availabilityId: 77,
        bookerName: '홍길동',
        bookerPhone: '010-1234-5678',
        canceledAt: null,
        confirmedAt: null,
        createdAt: '2026-08-25T04:00:00Z',
        id: 902,
        productId: null,
        productType: 'GENERAL',
        quantity: 2,
        requestNote: null,
        reservationEndsAt: '2026-08-27T02:00:00Z',
        reservationStartsAt: '2026-08-27T01:00:00Z',
        status: 'PENDING',
        touristUserId: 101,
        updatedAt: '2026-08-25T04:00:00Z',
      },
      isError: false,
      isPending: false,
      isSuccess: true,
      mutate: jest.fn(),
    } as unknown as ReturnType<typeof useCreateReservation>);

    await renderReservationScreen(createScreen());

    expect(screen.getByText('예약 요청이 접수되었습니다')).toBeVisible();
    expect(screen.getByTestId('v2-reservation-success-window')).not.toHaveTextContent(
      '예약 일시는 확정 후 안내됩니다.',
    );
    expect(screen.getByText('홍••')).toBeVisible();
  });

  test('생성 오류 종류별로 다른 안내 문구를 표시한다', async () => {
    mockPlace();
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [availability(77, new Date(2026, 7, 27, 10, 0, 0))],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAvailabilities>);

    const cases: Array<[ApiError, string]> = [
      [
        new ApiError('conflict', { code: 'CAPACITY_EXCEEDED', status: 409 }),
        '해당 시간이 방금 마감되었어요. 다른 시간을 선택해 주세요.',
      ],
      [
        new ApiError('offline', { isNetworkError: true }),
        '네트워크 문제예요. 연결을 확인하고 다시 시도해 주세요.',
      ],
      [
        new ApiError('bad input', { code: 'VALIDATION_FAILED', status: 400 }),
        '표시된 항목을 확인하고 다시 시도해 주세요.',
      ],
      [
        new ApiError('boom', { status: 500 }),
        '예약을 접수하지 못했습니다. 다시 시도해 주세요.',
      ],
    ];

    for (const [error, copy] of cases) {
      jest.mocked(useCreateReservation).mockReturnValue({
        error,
        isError: true,
        isPending: false,
        isSuccess: false,
        mutate: jest.fn(),
      } as unknown as ReturnType<typeof useCreateReservation>);

      const view = await renderReservationScreen(createScreen());
      expect(screen.getByText(copy)).toBeVisible();
      view.unmount();
    }
  });

  test('예약 상세에 선택 일시와 마스킹된 예약자 정보를 표시한다', async () => {
    await renderReservationScreen(
      <ReservationDetailScreen onBack={jest.fn()} reservationId={901} />,
    );

    expect(screen.getByTestId('v2-reservation-detail-window')).not.toHaveTextContent('확정 후 안내');
    expect(screen.getByTestId('v2-reservation-detail-booker-name')).toHaveTextContent('김••');
    expect(screen.getByTestId('v2-reservation-detail-booker-phone')).toHaveTextContent(/^•+5678$/);
    expect(screen.getByTestId('v2-reservation-detail-booker-phone')).not.toHaveTextContent(
      '010-1234-5678',
    );
    expect(screen.getByTestId('v2-reservation-detail-request-note')).toHaveTextContent(
      '창가 자리 부탁드려요',
    );
  });
});
