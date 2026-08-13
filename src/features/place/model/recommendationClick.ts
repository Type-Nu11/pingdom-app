import type { RecordRecommendationClickRequest } from '../api/placeApi';

export function claimRecommendationClick(
  payload: RecordRecommendationClickRequest,
  sentClickKeys: Set<string>,
) {
  const clickKey = `${payload.requestId}:${payload.recommendationVersion}:${payload.placeId}`;
  if (sentClickKeys.has(clickKey)) return false;
  sentClickKeys.add(clickKey);
  return true;
}
