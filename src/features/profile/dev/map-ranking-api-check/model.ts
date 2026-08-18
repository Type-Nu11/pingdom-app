export const TEMPORARY_MAP_RANKING_ENDPOINTS = [
  'GET /map/place-rankings (LOCAL)',
  'GET /map/place-rankings (NATIONAL)',
] as const;

export type TemporaryMapRankingEndpoint = (typeof TEMPORARY_MAP_RANKING_ENDPOINTS)[number];

export const isLocalRankingEndpoint = (endpoint: TemporaryMapRankingEndpoint) => (
  endpoint === 'GET /map/place-rankings (LOCAL)'
);
