import type { MockHandler } from '../../../../shared/api/mock/handlers';
import { emptyPaymentPageFixture, paymentFixtures, paymentPageFixture } from './fixtures';

function pathId(path: string): number {
  return Number(path.slice(path.lastIndexOf('/') + 1));
}

export const paymentMockHandlers = [
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
