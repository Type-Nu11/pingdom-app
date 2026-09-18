import { useQuery } from '@tanstack/react-query';
import { placeQueryKeys } from '../../core';
import { placeExplorationApi } from '../../exploration/api/placeExplorationApi';
import { selectPlaceListParams, selectPlaceAutocompleteParams, selectMapViewportParams } from '../model/placeSearch';
import type { PlaceListParams, PlaceAutocompleteParams, MapViewportParams } from '../model/placeSearch';

type PlaceExplorationApi = typeof placeExplorationApi;
type PlaceExplorationQueryConfig = { enabled?: boolean };


export function createPlaceListQueryOptions(
  params: PlaceListParams,
  api: Pick<PlaceExplorationApi, 'getPlaces'> = placeExplorationApi,
) {
  const contractParams = selectPlaceListParams(params);

  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.getPlaces(contractParams, signal),
    queryKey: placeQueryKeys.list(contractParams),
    staleTime: 15_000,
  };
}

export function createPlaceAutocompleteQueryOptions(
  params: PlaceAutocompleteParams,
  api: Pick<PlaceExplorationApi, 'autocompletePlaces'> = placeExplorationApi,
) {
  const contractParams = selectPlaceAutocompleteParams(params);

  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      api.autocompletePlaces(contractParams, signal),
    queryKey: placeQueryKeys.autocomplete(contractParams),
    staleTime: 30_000,
  };
}

export function createPlaceMapQueryOptions(
  params: MapViewportParams,
  api: Pick<PlaceExplorationApi, 'getMapViewport'> = placeExplorationApi,
) {
  const contractParams = selectMapViewportParams(params);

  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      api.getMapViewport(contractParams, signal),
    queryKey: placeQueryKeys.map(contractParams),
    staleTime: 15_000,
  };
}

export function usePlaceMap(
  params: MapViewportParams,
  { enabled = true }: PlaceExplorationQueryConfig = {},
) {
  return useQuery({ ...createPlaceMapQueryOptions(params), enabled });
}

export function usePlaceList(
  params: PlaceListParams,
  { enabled = true }: PlaceExplorationQueryConfig = {},
) {
  return useQuery({ ...createPlaceListQueryOptions(params), enabled });
}

export function usePlaceAutocomplete(
  params: PlaceAutocompleteParams,
  { enabled = true }: PlaceExplorationQueryConfig = {},
) {
  return useQuery({ ...createPlaceAutocompleteQueryOptions(params), enabled });
}
