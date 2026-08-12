export const TEMPORARY_PLACE_EXPLORATION_ENDPOINTS = [
  'GET /places/map',
  'GET /places/{placeId}/card',
  'GET /places/{placeId}/visit-decision',
  'GET /places/{placeId}/operating-notices',
  'GET /places/{id}/media/verification',
  'GET /places/recommendations/{requestId}/explanation',
  'POST /places/{placeId}/map-link-conversions',
] as const;

export type TemporaryPlaceExplorationEndpoint =
  (typeof TEMPORARY_PLACE_EXPLORATION_ENDPOINTS)[number];
