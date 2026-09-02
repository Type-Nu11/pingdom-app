import { useQuery } from '@tanstack/react-query';

import { placeQueryKeys } from '../../../shared/query/placeQueryKeys';
import { placeMenuApi } from '../api/placeMenuApi';

type PlaceMenuApi = Pick<typeof placeMenuApi, 'listPlaceMenus'>;

export const placeMenuQueryKeys = {
  all: () => [...placeQueryKeys.all, 'menus'] as const,
  list: placeQueryKeys.menus,
};

export const isValidPlaceMenuId = (placeId: number) =>
  Number.isSafeInteger(placeId) && placeId > 0;

export function createPlaceMenusQueryOptions(
  placeId: number,
  api: PlaceMenuApi = placeMenuApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.listPlaceMenus(placeId, signal),
    queryKey: placeMenuQueryKeys.list(placeId),
  };
}

export function usePlaceMenus(placeId: number, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    ...createPlaceMenusQueryOptions(placeId),
    enabled: enabled && isValidPlaceMenuId(placeId),
  });
}
