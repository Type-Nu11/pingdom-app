import { useQuery } from '@tanstack/react-query';
import { placeAvailabilityApi } from '../api/placeAvailabilityApi';
import { placeAvailabilityQueryKeys } from '../model/placeAvailabilityQueryKeys';

type PlaceAvailabilityApi = Pick<typeof placeAvailabilityApi, 'getPlaceAvailabilities'>;

export function createPlaceAvailabilitiesQueryOptions(
  placeId: number,
  api: PlaceAvailabilityApi = placeAvailabilityApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      api.getPlaceAvailabilities(placeId, signal),
    queryKey: placeAvailabilityQueryKeys.availabilities(placeId),
  };
}

export function usePlaceAvailabilities(
  placeId: number,
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useQuery({ ...createPlaceAvailabilitiesQueryOptions(placeId), enabled });
}
