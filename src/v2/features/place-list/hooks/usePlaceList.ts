import { useMemo } from 'react';
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

export function usePlaceList(params: GetPlaceListParams = {}) {
  const normalizedParams = useMemo(
    () => ({
      limit: params.limit ?? 10,
      page: params.page ?? 1,
    }),
    [params.limit, params.page],
  );

  return useQuery(createPlaceListQueryOptions(normalizedParams));
}
