import type { PlaceExplorationOperationQuery, PlaceExplorationOperationResponse } from '../../../../shared/api/placeExplorationContract';

export type MapViewportParams = PlaceExplorationOperationQuery<'mapViewport'>;
export type MapViewport = PlaceExplorationOperationResponse<'mapViewport', 200>;

export type PlaceListParams = PlaceExplorationOperationQuery<'listPlaces'>;
export type PlaceList = PlaceExplorationOperationResponse<'listPlaces', 200>;
export type PlaceAutocompleteParams =
  PlaceExplorationOperationQuery<'autocompletePlaces'>;
export type PlaceAutocomplete =
  PlaceExplorationOperationResponse<'autocompletePlaces', 200>;

export function selectPlaceListParams(params: PlaceListParams): PlaceListParams {
  const keyword = params.keyword?.trim();
  const category = params.category?.trim();
  const touristCategory = params.touristCategory?.trim();

  return {
    page: params.page ?? 1,
    limit: params.limit ?? 100,
    ...(keyword ? { keyword } : {}),
    ...(category ? { category } : {}),
    ...(touristCategory ? { touristCategory } : {}),
    ...(params.latitude !== undefined ? { latitude: params.latitude } : {}),
    ...(params.longitude !== undefined ? { longitude: params.longitude } : {}),
    ...(params.radiusKm !== undefined ? { radiusKm: params.radiusKm } : {}),
    ...(params.sort ? { sort: params.sort } : {}),
  };
}

export function selectPlaceAutocompleteParams(
  params: PlaceAutocompleteParams,
): PlaceAutocompleteParams {
  return {
    keyword: params.keyword.trim(),
    limit: params.limit ?? 10,
    ...(params.latitude !== undefined ? { latitude: params.latitude } : {}),
    ...(params.longitude !== undefined ? { longitude: params.longitude } : {}),
  };
}

export function selectMapViewportParams(params: MapViewportParams): MapViewportParams {
  return {
    west: params.west,
    south: params.south,
    east: params.east,
    north: params.north,
    zoom: params.zoom,
  };
}
