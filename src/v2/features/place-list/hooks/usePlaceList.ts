import { useQuery } from '@tanstack/react-query';

import { placeListApi } from '../api/placeListApi';
import type { GetPlaceListParams } from '../model/placeList.types';

type PlaceListApi = Pick<typeof placeListApi, 'getPlaceList'>;

export const placeListQueryKeys = {
  all: ['v2', 'place-list'] as const,
  list: (params: GetPlaceListParams) => [...placeListQueryKeys.all, params] as const,
};

export function createPlaceListQueryOptions(
  params: Required<Pick<GetPlaceListParams, 'limit' | 'page'>> & GetPlaceListParams,
  api: PlaceListApi = placeListApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.getPlaceList(params, signal),
    queryKey: placeListQueryKeys.list(params),
  };
}

export function normalizePlaceListParams(
  params: GetPlaceListParams = {},
): Required<Pick<GetPlaceListParams, 'limit' | 'page'>> & GetPlaceListParams {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const locationParamCount = [
    params.latitude,
    params.longitude,
    params.radiusKm,
  ].filter((value) => value !== undefined).length;

  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError('[place-list] page must be a positive integer.');
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError('[place-list] limit must be an integer between 1 and 100.');
  }

  if (locationParamCount !== 0 && locationParamCount !== 3) {
    throw new TypeError(
      '[place-list] latitude, longitude, and radiusKm must be provided together.',
    );
  }

  return {
    ...params,
    limit,
    page,
  };
}

export function usePlaceList(params: GetPlaceListParams = {}) {
  return useQuery(createPlaceListQueryOptions(normalizePlaceListParams(params)));
}
