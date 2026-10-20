import type { MockHandler } from '../../../../shared/api/mock/handlers';
import { emptyOwnedReservationPageFixture, reservationFixture, reservationPageFixture } from './merchantFixtures';

export const merchantReservationMockHandlers = [
  { method: 'GET', path: '/merchant-owner/reservations', resolve: ({ scenario }) => scenario === 'empty' ? emptyOwnedReservationPageFixture : reservationPageFixture },
  { method: 'POST', path: /\/reservations\/\d+\/confirm$/, resolve: () => ({ ...reservationFixture, status: 'CONFIRMED', confirmedAt: '2026-07-23T05:35:00Z' }) },
  { method: 'POST', path: /\/reservations\/\d+\/cancel$/, resolve: () => ({ ...reservationFixture, status: 'CANCELED', canceledAt: '2026-07-23T05:35:00Z' }) },
] satisfies readonly MockHandler[];
