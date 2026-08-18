import { useCallback, useRef } from 'react';

import { getApiErrorUx, toApiError } from '../../../v2/shared/api';
import {
  type CreateCheckInBody,
  useCreateCheckIn,
} from '../../../v2/features/check-ins';
import { useCurrentLocation } from '../../../v2/features/map/hooks/useCurrentLocation';
import type { Coordinate } from '../../../v2/features/map/model/map.types';

export type CheckInFailure =
  | 'authentication'
  | 'duplicate'
  | 'generic'
  | 'network'
  | 'out-of-range';

export function createLocationCheckInBody(
  placeId: number,
  coordinate: Coordinate,
): CreateCheckInBody | null {
  if (
    !Number.isInteger(placeId)
    || placeId < 1
    || !Number.isFinite(coordinate.lat)
    || coordinate.lat < -90
    || coordinate.lat > 90
    || !Number.isFinite(coordinate.lng)
    || coordinate.lng < -180
    || coordinate.lng > 180
    || coordinate.accuracyMeters === undefined
    || !Number.isFinite(coordinate.accuracyMeters)
    || coordinate.accuracyMeters < 0
    || !coordinate.observedAt
    || Number.isNaN(Date.parse(coordinate.observedAt))
  ) {
    return null;
  }

  return {
    accuracyMeters: coordinate.accuracyMeters,
    latitude: coordinate.lat,
    longitude: coordinate.lng,
    observedAt: coordinate.observedAt,
    placeId,
  };
}

export function classifyCheckInError(error: unknown): CheckInFailure {
  const apiError = toApiError(error);

  if (apiError.code === 'CHECK_IN_OUT_OF_RANGE') return 'out-of-range';
  if (apiError.code === 'CHECK_IN_ALREADY_EXISTS') return 'duplicate';
  if (apiError.isNetworkError) return 'network';
  if (getApiErrorUx(apiError).kind === 'authentication') return 'authentication';
  return 'generic';
}

export function useLocationCheckIn(placeId: number) {
  const location = useCurrentLocation();
  const createCheckIn = useCreateCheckIn();
  const submissionLock = useRef(false);

  const submit = useCallback(async () => {
    if (submissionLock.current || location.status !== 'granted') return null;

    const body = createLocationCheckInBody(placeId, location.coordinate);
    if (!body) return null;

    submissionLock.current = true;
    try {
      return await createCheckIn.mutateAsync(body);
    } finally {
      submissionLock.current = false;
    }
  }, [createCheckIn.mutateAsync, location.coordinate, location.status, placeId]);

  return {
    checkInError: createCheckIn.error,
    checkInFailure: createCheckIn.error ? classifyCheckInError(createCheckIn.error) : null,
    isCheckingIn: createCheckIn.isPending,
    location,
    submit,
    successfulCheckIn: createCheckIn.data ?? null,
  };
}
