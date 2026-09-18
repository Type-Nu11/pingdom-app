import type {
  PlaceExplorationOperationPath,
  PlaceExplorationOperationQuery,
  PlaceExplorationOperationRequestBody,
  PlaceExplorationOperationResponse,
} from '../../../../shared/api';

export type { MapViewportParams, MapViewport, PlaceListParams, PlaceList, PlaceAutocompleteParams, PlaceAutocomplete } from '../../search/model/placeSearch';
export { selectPlaceListParams, selectPlaceAutocompleteParams, selectMapViewportParams } from '../../search/model/placeSearch';

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

export type PlaceExplorationMedia =
  PlaceExplorationOperationResponse<'getExplorationMedia', 200>;

export type RecommendationExplanationPath =
  PlaceExplorationOperationPath<'getRecommendationExplanation'>;
export type RecommendationExplanation =
  PlaceExplorationOperationResponse<'getRecommendationExplanation', 200>;
export type RecommendationExplanationItem =
  NonNullable<RecommendationExplanation['items']>[number];

export type PlaceRecommendationsParams =
  PlaceExplorationOperationQuery<'recommendPlaces'>;
export type PlaceRecommendations =
  PlaceExplorationOperationResponse<'recommendPlaces', 200>;
export type PlaceRecommendationItem =
  NonNullable<PlaceRecommendations['places']>[number];

export function selectPlaceRecommendationsParams(
  params: PlaceRecommendationsParams,
): PlaceRecommendationsParams {
  return {
    latitude: params.latitude,
    limit: params.limit ?? 10,
    longitude: params.longitude,
    radiusKm: params.radiusKm ?? 5,
    ...(params.recommendationVersion
      ? { recommendationVersion: params.recommendationVersion }
      : {}),
  };
}

export type RecommendationClickBody =
  PlaceExplorationOperationRequestBody<'recordRecommendationClick'>;
export type RecommendationClickResult =
  PlaceExplorationOperationResponse<'recordRecommendationClick', 201>;

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
