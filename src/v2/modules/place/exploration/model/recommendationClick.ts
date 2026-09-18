import type { RecommendationClickBody } from './placeExploration.types';

export function selectRecommendationClickPayload({
  placeId,
  recommendationPlaceIds,
  recommendationRequestId,
  recommendationVersion,
}: {
  placeId: number;
  recommendationPlaceIds: readonly number[];
  recommendationRequestId?: string | null;
  recommendationVersion?: string | null;
}): RecommendationClickBody | null {
  if (
    !recommendationRequestId
    || !recommendationVersion
    || !recommendationPlaceIds.includes(placeId)
  ) {
    return null;
  }

  return {
    placeId,
    recommendationVersion,
    requestId: recommendationRequestId,
  };
}

export function claimRecommendationClick(
  payload: RecommendationClickBody,
  sentClickKeys: Set<string>,
) {
  const clickKey = `${payload.requestId}:${payload.recommendationVersion}:${payload.placeId}`;
  if (sentClickKeys.has(clickKey)) return false;
  sentClickKeys.add(clickKey);
  return true;
}

export function releaseRecommendationClick(
  payload: RecommendationClickBody,
  sentClickKeys: Set<string>,
) {
  const clickKey = `${payload.requestId}:${payload.recommendationVersion}:${payload.placeId}`;
  sentClickKeys.delete(clickKey);
}

export async function recordRecommendationClickOnce<T>(
  payload: RecommendationClickBody,
  sentClickKeys: Set<string>,
  send: (value: RecommendationClickBody) => Promise<T>,
) {
  if (!claimRecommendationClick(payload, sentClickKeys)) return undefined;

  try {
    return await send(payload);
  } catch (error) {
    releaseRecommendationClick(payload, sentClickKeys);
    throw error;
  }
}
