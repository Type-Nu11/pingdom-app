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

export function releaseRecommendationClick(
  payload: RecordRecommendationClickRequest,
  sentClickKeys: Set<string>,
) {
  const clickKey = `${payload.requestId}:${payload.recommendationVersion}:${payload.placeId}`;
  sentClickKeys.delete(clickKey);
}

export async function recordRecommendationClickOnce<T>(
  payload: RecordRecommendationClickRequest,
  sentClickKeys: Set<string>,
  send: (value: RecordRecommendationClickRequest) => Promise<T>,
) {
  if (!claimRecommendationClick(payload, sentClickKeys)) return undefined;

  try {
    return await send(payload);
  } catch (error) {
    releaseRecommendationClick(payload, sentClickKeys);
    throw error;
  }
}
