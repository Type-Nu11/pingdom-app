import { useQuery } from '@tanstack/react-query';

import { placeQueryKeys } from '../../../shared/query/placeQueryKeys';
import { placeDetailApi } from '../api/placeDetailApi';

type PlaceDetailApi = Pick<typeof placeDetailApi, 'getPlaceDetail'>;

export const placeDetailQueryKeys = {
  all: placeQueryKeys.entities(),
  detail: placeQueryKeys.detail,
};

export function createPlaceDetailQueryOptions(
  placeId: number,
  api: PlaceDetailApi = placeDetailApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.getPlaceDetail(placeId, signal),
    queryKey: placeDetailQueryKeys.detail(placeId),
  };
}

export function usePlaceDetail(placeId: number) {
  return useQuery(createPlaceDetailQueryOptions(placeId));
}
