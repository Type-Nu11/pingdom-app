import type {
  PlaceExplorationOperationPath,
  PlaceExplorationOperationQuery,
  PlaceExplorationOperationRequestBody,
  PlaceExplorationOperationResponse,
} from '../../../shared/api';

export type MapViewportParams = PlaceExplorationOperationQuery<'mapViewport'>;
export type MapViewport = PlaceExplorationOperationResponse<'mapViewport', 200>;

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
  PlaceExplorationOperationResponse<'record', 200>;

export type MapLinkConversionVariables = {
  body: MapLinkConversionBody;
  placeId: MapLinkConversionPath['placeId'];
  signal?: AbortSignal;
};
