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
 * Dates are derived from the runtime clock so the mock GENERAL flow does not
 * silently expire as a checked-in calendar date passes.
 */
function futureUtcTime(now: Date, daysAhead: number, hour: number) {
  const value = new Date(now);
  value.setUTCDate(value.getUTCDate() + daysAhead);
  value.setUTCHours(hour, 0, 0, 0);
  return value.toISOString();
}

export function createAvailabilityListFixture(
  now: Date = new Date(),
): ApiSchema<'Availability'>[] {
  return [
    {
      id: 8801,
      placeId: 17,
      productId: 601,
      productType: 'GENERAL',
      startsAt: futureUtcTime(now, 7, 10),
      endsAt: futureUtcTime(now, 7, 11),
      totalCapacity: 10,
      remainingCapacity: 6,
      status: 'ACTIVE',
    },
    {
      id: 8802,
      placeId: 17,
      productId: 601,
      productType: 'GENERAL',
      startsAt: futureUtcTime(now, 7, 14),
      endsAt: futureUtcTime(now, 7, 15),
      totalCapacity: 8,
      remainingCapacity: 2,
      status: 'ACTIVE',
    },
    {
      id: 8803,
      placeId: 17,
      productId: 705,
      productType: 'TICKET',
      startsAt: futureUtcTime(now, 7, 13),
      endsAt: futureUtcTime(now, 7, 14),
      totalCapacity: 20,
      remainingCapacity: 12,
      status: 'ACTIVE',
    },
    {
      id: 8804,
      placeId: 17,
      productId: 812,
      productType: 'CLASS',
      startsAt: futureUtcTime(now, 8, 15),
      endsAt: futureUtcTime(now, 8, 17),
      totalCapacity: 6,
      remainingCapacity: 3,
      status: 'ACTIVE',
    },
  ];
}

export const emptyAvailabilityListFixture = [] satisfies ApiSchema<'Availability'>[];
