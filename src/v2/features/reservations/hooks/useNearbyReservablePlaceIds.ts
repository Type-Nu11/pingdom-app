import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import type { AvailabilityList } from '../api/reservationApi';
import { createAvailabilitiesQueryOptions } from './useReservations';

export const NEARBY_RESERVATION_CANDIDATE_LIMIT = 12;

export function hasReservableAvailability(
  availabilities: AvailabilityList | undefined,
  nowMs = Date.now(),
) {
  return Array.isArray(availabilities) && availabilities.some((availability) => (
    availability.status === 'ACTIVE'
    && typeof availability.endsAt === 'string'
    && Number.isFinite(Date.parse(availability.endsAt))
    && Date.parse(availability.endsAt) > nowMs
    && (availability.remainingCapacity ?? 0) > 0
  ));
}

export function useNearbyReservablePlaceIds(
  candidatePlaceIds: readonly number[],
  { enabled = true }: { enabled?: boolean } = {},
) {
  const placeIds = useMemo(
    () => [...new Set(candidatePlaceIds)]
      .filter((placeId) => Number.isSafeInteger(placeId) && placeId > 0)
      .slice(0, NEARBY_RESERVATION_CANDIDATE_LIMIT),
    [candidatePlaceIds],
  );
  const queries = useQueries({
    queries: placeIds.map((placeId) => ({
      ...createAvailabilitiesQueryOptions(placeId),
      enabled,
      staleTime: 30_000,
    })),
  });
  const reservablePlaceIds = useMemo(() => new Set(
    placeIds.filter((_placeId, index) => hasReservableAvailability(queries[index]?.data)),
  ), [placeIds, queries]);
  const placeIdByAvailabilityId = useMemo(() => placeIds.reduce<Record<string, number>>(
    (result, placeId, index) => {
      for (const availability of queries[index]?.data ?? []) {
        result[String(availability.id)] = placeId;
      }
      return result;
    },
    {},
  ), [placeIds, queries]);

  return {
    isLoading: enabled && queries.some((query) => query.isPending),
    placeIdByAvailabilityId,
    reservablePlaceIds,
  };
}
