import type { MockHandler } from '../../handlers';
import { availabilityListFixture, emptyAvailabilityListFixture } from './fixtures';

/**
 * Reservation availabilities for `GET /places/{placeId}/availabilities`. This is
 * registered ahead of the place-exploration handler for the same path so the
 * reservation create flow gets the mixed GENERAL/TICKET/CLASS list it needs.
 */
export const reservationMockHandlers = [
  {
    method: 'GET',
    path: /^\/places\/\d+\/availabilities$/,
    resolve: ({ scenario }) =>
      scenario === 'empty' ? emptyAvailabilityListFixture : availabilityListFixture,
  },
] satisfies readonly MockHandler[];
