import type {
  ListPaymentsParams,
  Payment,
  PaymentPage,
} from '../../../features/payments/model/payment.types';
import type { ReservationDetail } from '../../../features/reservations/api/reservationApi';

const reservation: ReservationDetail = {
  availabilityId: 801,
  bookerName: '김민수',
  bookerPhone: '010-1234-5678',
  canceledAt: null,
  confirmedAt: null,
  createdAt: '2026-08-25T04:00:00Z',
  id: 901,
  productId: null,
  productType: 'GENERAL',
  quantity: 2,
  requestNote: null,
  reservationEndsAt: '2026-08-27T07:00:00Z',
  reservationStartsAt: '2026-08-27T06:00:00Z',
  status: 'PENDING',
  touristUserId: 101,
  updatedAt: '2026-08-25T04:00:00Z',
};

const payment: Payment = {
  amountMinor: null,
  createdAt: '2026-08-25T04:01:00Z',
  currency: null,
  failedAt: '2026-08-25T04:02:00Z',
  failureCode: 'PAYMENT_DECLINED',
  id: 1001,
  paidAt: null,
  provider: 'TOSS_PAYMENTS',
  providerPaymentId: null,
  refundedAt: null,
  reservationId: reservation.id,
  status: 'FAILED',
};

const page: PaymentPage = {
  hasNext: false,
  limit: 20,
  page: 1,
  payments: [payment],
  totalElements: 1,
  totalPages: 1,
};

const params: ListPaymentsParams = { limit: 100, page: 1 };

void page;
void params;
