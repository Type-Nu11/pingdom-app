import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { placeListApi } from '../api/placeListApi';
import type { GetPlaceListParams } from '../model/placeList.types';

export const placeListQueryKeys = {
  all: ['v2', 'place-list'] as const,
  list: (params: Required<GetPlaceListParams>) => [...placeListQueryKeys.all, params] as const,
};

export function usePlaceList(params: GetPlaceListParams = {}) {
  const normalizedParams = useMemo(
    () => ({
      limit: params.limit ?? 10,
      page: params.page ?? 1,
    }),
    [params.limit, params.page],
  );

  return useQuery({
    queryKey: placeListQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) => placeListApi.getPlaceList(normalizedParams, signal),
  });
}
