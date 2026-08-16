import type {
  PlaceExplorationOperationPath,
  PlaceExplorationOperationQuery,
  PlaceExplorationOperationRequestBody,
  PlaceExplorationOperationResponse,
} from '../../../shared/api';

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

export type PlaceCardPath = PlaceExplorationOperationPath<'getTouristPlaceCard'>;
export type PlaceCard = PlaceExplorationOperationResponse<'getTouristPlaceCard', 200>;

export type PlaceVisitDecisionPath =
  PlaceExplorationOperationPath<'getPlaceVisitDecision'>;
export type PlaceVisitDecision =
  PlaceExplorationOperationResponse<'getPlaceVisitDecision', 200>;

export type PlaceOperatingNoticesPath =
  PlaceExplorationOperationPath<'listOperatingNotices'>;
export type PlaceOperatingNotices =
  PlaceExplorationOperationResponse<'listOperatingNotices', 200>;

export type PlaceVerificationMediaPath =
  PlaceExplorationOperationPath<'getVerificationMedia'>;
export type PlaceVerificationMedia =
  PlaceExplorationOperationResponse<'getVerificationMedia', 200>;

export type RecommendationExplanationPath =
  PlaceExplorationOperationPath<'getRecommendationExplanation'>;
export type RecommendationExplanation =
  PlaceExplorationOperationResponse<'getRecommendationExplanation', 200>;

export type MapLinkConversionPath = PlaceExplorationOperationPath<'record'>;
export type MapLinkConversionBody =
  PlaceExplorationOperationRequestBody<'record'>;
export type MapLinkConversionResult =
  PlaceExplorationOperationResponse<'record', 204>;

export type MapLinkConversionVariables = {
  body: MapLinkConversionBody;
  placeId: MapLinkConversionPath['placeId'];
  signal?: AbortSignal;
};
