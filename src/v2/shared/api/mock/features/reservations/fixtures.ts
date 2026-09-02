import type { ApiSchema } from '../../../contract';

/**
 * Availabilities for the reservation create flow. The list deliberately mixes
 * every `productType` the live `AvailabilityResponse` contract can carry so the
 * running app exercises the #296 branching end to end:
 *
 * - two bookable `GENERAL` place slots (different times, one near capacity)
 * - a `TICKET` slot and a `CLASS` slot, which have no product name in the
 *   current contract and must render as disabled "cannot reserve yet" rows
 *
 * Dates sit a few days ahead of the mock "now" so the GENERAL slots pass the
 * capacity and future-time checks.
 */
export const availabilityListFixture = [
  {
    id: 8801,
    placeId: 17,
    productId: 601,
    productType: 'GENERAL',
    startsAt: '2026-09-05T10:00:00Z',
    endsAt: '2026-09-05T11:00:00Z',
    totalCapacity: 10,
    remainingCapacity: 6,
    status: 'ACTIVE',
  },
  {
    id: 8802,
    placeId: 17,
    productId: 601,
    productType: 'GENERAL',
    startsAt: '2026-09-05T14:00:00Z',
    endsAt: '2026-09-05T15:00:00Z',
    totalCapacity: 8,
    remainingCapacity: 2,
    status: 'ACTIVE',
  },
  {
    id: 8803,
    placeId: 17,
    productId: 705,
    productType: 'TICKET',
    startsAt: '2026-09-05T13:00:00Z',
    endsAt: '2026-09-05T14:00:00Z',
    totalCapacity: 20,
    remainingCapacity: 12,
    status: 'ACTIVE',
  },
  {
    id: 8804,
    placeId: 17,
    productId: 812,
    productType: 'CLASS',
    startsAt: '2026-09-06T15:00:00Z',
    endsAt: '2026-09-06T17:00:00Z',
    totalCapacity: 6,
    remainingCapacity: 3,
    status: 'ACTIVE',
  },
] satisfies ApiSchema<'Availability'>[];

export const emptyAvailabilityListFixture = [] satisfies ApiSchema<'Availability'>[];
