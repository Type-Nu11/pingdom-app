import type { MockHandler } from '../../handlers';
import {
  emptyPaymentPageFixture,
  paymentFixtures,
  paymentPageFixture,
  reservationDetailFixture,
} from './fixtures';

function pathId(path: string): number {
  return Number(path.slice(path.lastIndexOf('/') + 1));
}

export const reservationPaymentMockHandlers = [
  {
    method: 'GET',
    path: /^\/reservations\/\d+$/,
    resolve: () => reservationDetailFixture,
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
