import type { ReservationPaymentSchema } from '../../../../../shared/api/reservationPaymentContract';
import type { MockHandler } from '../../../../../shared/api/mock/handlers';
import {
  createdReservationFixture,
  emptyReservationListPageFixture,
  reservationDetailFixture,
  reservationListPageFixture,
} from './fixtures';

export const reservationRecordMockHandlers = [
  {
    method: 'GET',
    path: '/reservations',
    resolve: ({ scenario }) => scenario === 'empty'
      ? emptyReservationListPageFixture
      : reservationListPageFixture,
  },
  {
    method: 'POST',
    path: '/reservations',
    resolve: ({ body }) =>
      createdReservationFixture(
        (body ?? {}) as Partial<ReservationPaymentSchema<'ReservationCreateRequest'>>,
      ),
  },
  {
    method: 'GET',
    path: /^\/reservations\/\d+$/,
    resolve: () => reservationDetailFixture,
  },
  {
    method: 'POST',
    path: /^\/reservations\/\d+\/cancel$/,
    resolve: () => ({
      ...reservationDetailFixture,
      canceledAt: '2026-08-25T05:00:00Z',
      status: 'CANCELED',
    }),
  },
] satisfies readonly MockHandler[];
