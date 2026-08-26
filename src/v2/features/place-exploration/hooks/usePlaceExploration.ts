import { useMutation, useQueries, useQuery } from '@tanstack/react-query';

import { placeQueryKeys } from '../../../shared/query/placeQueryKeys';
import { placeExplorationApi } from '../api/placeExplorationApi';
import type {
  MapLinkConversionVariables,
  MapViewportParams,
  PlaceAutocompleteParams,
  PlaceListParams,
} from '../model/placeExploration.types';
import {
  selectMapViewportParams,
  selectPlaceAutocompleteParams,
  selectPlaceListParams,
} from '../model/placeExploration.types';

type PlaceExplorationApi = typeof placeExplorationApi;

export { placeQueryKeys } from '../../../shared/query/placeQueryKeys';

export function createPlaceListQueryOptions(
  params: PlaceListParams,
  api: Pick<PlaceExplorationApi, 'getPlaces'> = placeExplorationApi,
) {
  const contractParams = selectPlaceListParams(params);

  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.getPlaces(contractParams, signal),
    queryKey: placeQueryKeys.list(contractParams),
    staleTime: 15_000,
  };
}

export function createPlaceAutocompleteQueryOptions(
  params: PlaceAutocompleteParams,
  api: Pick<PlaceExplorationApi, 'autocompletePlaces'> = placeExplorationApi,
) {
  const contractParams = selectPlaceAutocompleteParams(params);

  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      api.autocompletePlaces(contractParams, signal),
    queryKey: placeQueryKeys.autocomplete(contractParams),
    staleTime: 30_000,
  };
}

export function createPlaceMapQueryOptions(
  params: MapViewportParams,
  api: Pick<PlaceExplorationApi, 'getMapViewport'> = placeExplorationApi,
) {
  const contractParams = selectMapViewportParams(params);

  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      api.getMapViewport(contractParams, signal),
    queryKey: placeQueryKeys.map(contractParams),
    staleTime: 15_000,
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

export function createPlaceExplorationMediaQueryOptions(
  id: number,
  api: Pick<PlaceExplorationApi, 'getPlaceExplorationMedia'> = placeExplorationApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      api.getPlaceExplorationMedia(id, signal),
    queryKey: placeQueryKeys.explorationMedia(id),
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

type PlaceExplorationQueryConfig = {
  enabled?: boolean;
};

export function usePlaceMap(
  params: MapViewportParams,
  { enabled = true }: PlaceExplorationQueryConfig = {},
) {
  return useQuery({ ...createPlaceMapQueryOptions(params), enabled });
}

export function usePlaceList(
  params: PlaceListParams,
  { enabled = true }: PlaceExplorationQueryConfig = {},
) {
  return useQuery({ ...createPlaceListQueryOptions(params), enabled });
}

export function usePlaceAutocomplete(
  params: PlaceAutocompleteParams,
  { enabled = true }: PlaceExplorationQueryConfig = {},
) {
  return useQuery({ ...createPlaceAutocompleteQueryOptions(params), enabled });
}

export function usePlaceCard(
  placeId: number,
  { enabled = true }: PlaceExplorationQueryConfig = {},
) {
  return useQuery({ ...createPlaceCardQueryOptions(placeId), enabled });
}

export function usePlaceVisitDecision(
  placeId: number,
  { enabled = true }: PlaceExplorationQueryConfig = {},
) {
  return useQuery({ ...createPlaceVisitDecisionQueryOptions(placeId), enabled });
}

export function usePlaceOperatingNotices(
  placeId: number,
  { enabled = true }: PlaceExplorationQueryConfig = {},
) {
  return useQuery({ ...createPlaceOperatingNoticesQueryOptions(placeId), enabled });
}

export function usePlaceVerificationMedia(
  id: number,
  { enabled = true }: PlaceExplorationQueryConfig = {},
) {
  return useQuery({ ...createPlaceVerificationMediaQueryOptions(id), enabled });
}

export function usePlaceExplorationMedia(
  id: number,
  { enabled = true }: PlaceExplorationQueryConfig = {},
) {
  return useQuery({ ...createPlaceExplorationMediaQueryOptions(id), enabled });
}

export function useRecommendationExplanation(
  requestId: string,
  { enabled = true }: PlaceExplorationQueryConfig = {},
) {
  return useQuery({ ...createRecommendationExplanationQueryOptions(requestId), enabled });
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
