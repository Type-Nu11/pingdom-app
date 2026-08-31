import { useQuery } from '@tanstack/react-query';

import { placeQueryKeys } from '../../../shared/query/placeQueryKeys';
import { placeDetailApi } from '../api/placeDetailApi';

type PlaceDetailApi = Pick<typeof placeDetailApi, 'getPlaceDetail'>;
type PlaceAvailabilityApi = Pick<typeof placeDetailApi, 'getPlaceAvailabilities'>;

export const placeDetailQueryKeys = {
  all: placeQueryKeys.entities(),
  detail: placeQueryKeys.detail,
};

// A place detail is fetched one id at a time, so a list that resolves many of
// them at once (the verified places list) issues one request per row. Holding
// each result well past the global 30s default keeps scrolling back through an
// already-loaded list from re-issuing that whole fan-out.
const PLACE_DETAIL_STALE_TIME_MS = 5 * 60 * 1000;

export function createPlaceDetailQueryOptions(
  placeId: number,
  api: PlaceDetailApi = placeDetailApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.getPlaceDetail(placeId, signal),
    queryKey: placeDetailQueryKeys.detail(placeId),
    staleTime: PLACE_DETAIL_STALE_TIME_MS,
  };
}

export function usePlaceDetail(placeId: number, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ ...createPlaceDetailQueryOptions(placeId), enabled });
}

export function createPlaceAvailabilitiesQueryOptions(
  placeId: number,
  api: PlaceAvailabilityApi = placeDetailApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      api.getPlaceAvailabilities(placeId, signal),
    queryKey: placeQueryKeys.availabilities(placeId),
  };
}

export function usePlaceAvailabilities(
  placeId: number,
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useQuery({ ...createPlaceAvailabilitiesQueryOptions(placeId), enabled });
}
