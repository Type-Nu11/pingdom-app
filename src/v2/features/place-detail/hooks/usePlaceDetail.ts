import { useQuery } from '@tanstack/react-query';

import { placeDetailApi } from '../api/placeDetailApi';

type PlaceDetailApi = Pick<typeof placeDetailApi, 'getPlaceDetail'>;

export const placeDetailQueryKeys = {
  all: ['v2', 'place-detail'] as const,
  detail: (placeId: number) => [...placeDetailQueryKeys.all, placeId] as const,
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
