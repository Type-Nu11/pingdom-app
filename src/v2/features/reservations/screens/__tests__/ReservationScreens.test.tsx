import type { ReactElement } from 'react';
import { screen } from '@testing-library/react-native';

import {
  createTestI18n,
  renderWithProviders,
} from '../../../../shared/testing/testProviders';
import { registerReservationResources } from '../../i18n/reservationResources';
import CreateReservationScreen from '../CreateReservationScreen';
import ReservationDetailScreen from '../ReservationDetailScreen';
import VerificationReviewScreen from '../VerificationReviewScreen';
import VerificationScreen from '../VerificationScreen';
import { usePlaceDetail } from '../../../place-detail/hooks/usePlaceDetail';
import { useAvailabilities, useCreateReservation } from '../../hooks/useReservations';
import { useReservationDetail } from '../../hooks/useReservations';
import { useAllPayments } from '../../../payments/hooks/usePayments';

jest.mock('../../../place-detail/hooks/usePlaceDetail', () => ({ usePlaceDetail: jest.fn() }));
jest.mock('../../hooks/useReservations', () => ({
  useAvailabilities: jest.fn(),
  useCreateReservation: jest.fn(),
  useReservationDetail: jest.fn(),
}));
jest.mock('../../../payments/hooks/usePayments', () => ({ useAllPayments: jest.fn() }));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

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

  test('예약 생성 화면은 장소, 인원, 날짜, 시간, 예약자 입력을 한 흐름으로 표시한다', async () => {
    const startsAt = new Date();
    startsAt.setHours(12, 0, 0, 0);
    jest.mocked(usePlaceDetail).mockReturnValue({
      data: { name: '대성반점', thumbnailUrl: null },
    } as ReturnType<typeof usePlaceDetail>);
    jest.mocked(useAvailabilities).mockReturnValue({
      data: [{
        id: 77,
        placeId: 17,
        productId: 9,
        productType: 'TABLE',
        startsAt: startsAt.toISOString(),
        endsAt: new Date(startsAt.getTime() + 30 * 60_000).toISOString(),
        totalCapacity: 8,
        remainingCapacity: 8,
        status: 'ACTIVE',
      }],
      isPending: false,
    } as ReturnType<typeof useAvailabilities>);
    jest.mocked(useCreateReservation).mockReturnValue({
      isError: false,
      isPending: false,
      isSuccess: false,
      mutate: jest.fn(),
    } as unknown as ReturnType<typeof useCreateReservation>);

    await renderReservationScreen(
      <CreateReservationScreen
        navigation={{ goBack: jest.fn() } as never}
        route={{ key: 'create', name: 'CreateReservation', params: {
          category: '음식점',
          imageUrl: 'https://example.com/daeseong.jpg',
          placeId: 17,
          placeName: '대성반점',
        } } as never}
      />,
    );

    expect(screen.getByTestId('v2-create-reservation-screen')).toBeVisible();
    expect(screen.getByText('대성반점')).toBeVisible();
    expect(screen.getByText('예약인원: 2~12명 · 음식점')).toBeVisible();
    expect(screen.getByTestId('v2-reservation-place-image')).toBeVisible();
    expect(screen.getByPlaceholderText('이름을 입력하세요')).toBeVisible();
    expect(screen.getByTestId('v2-reservation-submit').props.accessibilityState.disabled).toBe(true);
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

  test('최근 방문 장소를 누르면 실제 장소 정보로 작성 화면을 연다', async () => {
    const onOpenPlace = jest.fn();
    const { user } = await renderReservationScreen(
      <VerificationScreen onBack={jest.fn()} onOpenPlace={onOpenPlace} />,
    );

    await user.press(screen.getAllByRole('button', { name: /대성반점, 123m/ })[0]);

    expect(onOpenPlace).toHaveBeenCalledWith(expect.objectContaining({
      category: '음식점',
      placeName: '대성반점',
    }));
  });

  test('추천 이유 선택과 후기 입력을 사용자가 직접 변경할 수 있다', async () => {
    const { user } = await renderReservationScreen(
      <VerificationReviewScreen
        category="음식점"
        imageUrl="https://example.com/place.jpg"
        onBack={jest.fn()}
        placeName="대성반점"
      />,
    );

    const delicious = screen.getByRole('checkbox', { name: '맛있어요' });
    expect(delicious.props.accessibilityState).toEqual({ checked: true });
    await user.press(delicious);
    expect(delicious.props.accessibilityState).toEqual({ checked: false });

    const reviewInput = screen.getByLabelText('후기 작성');
    await user.type(reviewInput, '직접 작성한 후기입니다.');
    expect(reviewInput.props.value).toBe('직접 작성한 후기입니다.');
    expect(screen.getByText('1/5개 선택됨')).toBeVisible();
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
