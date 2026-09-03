import type { ReservationPaymentSchema } from '../../../reservationPaymentContract';
import type { MockHandler } from '../../handlers';
import {
  createdReservationFixture,
  emptyPaymentPageFixture,
  emptyReservationListPageFixture,
  paymentFixtures,
  paymentPageFixture,
  reservationDetailFixture,
  reservationListPageFixture,
} from './fixtures';

function pathId(path: string): number {
  return Number(path.slice(path.lastIndexOf('/') + 1));
}

export const reservationPaymentMockHandlers = [
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
  {
    method: 'GET',
    path: '/payments',
    resolve: ({ scenario }) => scenario === 'empty'
      ? emptyPaymentPageFixture
      : paymentPageFixture,
  },
  {
    method: 'GET',
    path: /^\/payments\/\d+$/,
    resolve: ({ path }) =>
      paymentFixtures.find((payment) => payment.id === pathId(path)) ?? paymentFixtures[1],
  },
] satisfies readonly MockHandler[];
