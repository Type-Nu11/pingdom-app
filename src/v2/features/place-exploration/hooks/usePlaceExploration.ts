import { useMutation, useQueries, useQuery } from '@tanstack/react-query';

import { placeQueryKeys } from '../../../shared/query/placeQueryKeys';
import { placeExplorationApi } from '../api/placeExplorationApi';
import type {
  MapLinkConversionVariables,
  MapViewportParams,
} from '../model/placeExploration.types';
import { selectMapViewportParams } from '../model/placeExploration.types';

type PlaceExplorationApi = typeof placeExplorationApi;

export { placeQueryKeys } from '../../../shared/query/placeQueryKeys';

export function createPlaceMapQueryOptions(
  params: MapViewportParams,
  api: Pick<PlaceExplorationApi, 'getMapViewport'> = placeExplorationApi,
) {
  const contractParams = selectMapViewportParams(params);

  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      api.getMapViewport(contractParams, signal),
    queryKey: placeQueryKeys.map(contractParams),
  };
}

export function createPlaceCardQueryOptions(
  placeId: number,
  api: Pick<PlaceExplorationApi, 'getPlaceCard'> = placeExplorationApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.getPlaceCard(placeId, signal),
    queryKey: placeQueryKeys.card(placeId),
  };
}

export function createPlaceVisitDecisionQueryOptions(
  placeId: number,
  api: Pick<PlaceExplorationApi, 'getPlaceVisitDecision'> = placeExplorationApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      api.getPlaceVisitDecision(placeId, signal),
    queryKey: placeQueryKeys.visitDecision(placeId),
  };
}

export function createPlaceOperatingNoticesQueryOptions(
  placeId: number,
  api: Pick<PlaceExplorationApi, 'getPlaceOperatingNotices'> = placeExplorationApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      api.getPlaceOperatingNotices(placeId, signal),
    queryKey: placeQueryKeys.operatingNotices(placeId),
  };
}

export function createPlaceVerificationMediaQueryOptions(
  id: number,
  api: Pick<PlaceExplorationApi, 'getPlaceVerificationMedia'> = placeExplorationApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      api.getPlaceVerificationMedia(id, signal),
    queryKey: placeQueryKeys.verificationMedia(id),
  };
}

export function createRecommendationExplanationQueryOptions(
  requestId: string,
  api: Pick<PlaceExplorationApi, 'getRecommendationExplanation'> = placeExplorationApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      api.getRecommendationExplanation(requestId, signal),
    queryKey: placeQueryKeys.recommendationExplanation(requestId),
  };
}

export function createMapLinkConversionMutationOptions(
  api: Pick<PlaceExplorationApi, 'recordMapLinkConversion'> = placeExplorationApi,
) {
  return {
    mutationFn: ({ body, placeId, signal }: MapLinkConversionVariables) =>
      api.recordMapLinkConversion(placeId, body, signal),
    // The server contract has no idempotency key or duplicate result for this endpoint.
    retry: false as const,
  };
}

export function usePlaceMap(params: MapViewportParams) {
  return useQuery(createPlaceMapQueryOptions(params));
}

export function usePlaceCard(placeId: number) {
  return useQuery(createPlaceCardQueryOptions(placeId));
}

export function usePlaceVisitDecision(placeId: number) {
  return useQuery(createPlaceVisitDecisionQueryOptions(placeId));
}

export function usePlaceOperatingNotices(placeId: number) {
  return useQuery(createPlaceOperatingNoticesQueryOptions(placeId));
}

export function usePlaceVerificationMedia(id: number) {
  return useQuery(createPlaceVerificationMediaQueryOptions(id));
}

export function useRecommendationExplanation(requestId: string) {
  return useQuery(createRecommendationExplanationQueryOptions(requestId));
}

export function usePlaceCardResources(placeId: number) {
  return useQueries({
    queries: [
      createPlaceCardQueryOptions(placeId),
      createPlaceOperatingNoticesQueryOptions(placeId),
      createPlaceVerificationMediaQueryOptions(placeId),
    ],
  });
}

export function usePlaceVisitDecisionResources(placeId: number) {
  return useQueries({
    queries: [
      createPlaceVisitDecisionQueryOptions(placeId),
      createPlaceOperatingNoticesQueryOptions(placeId),
      createPlaceVerificationMediaQueryOptions(placeId),
    ],
  });
}

export function useRecordMapLinkConversion() {
  return useMutation(createMapLinkConversionMutationOptions());
}
