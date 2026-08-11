import { apiClient, type ApiClient } from '../../../shared/api';
import type {
  MapLinkConversionBody,
  MapLinkConversionResult,
  MapViewport,
  MapViewportParams,
  PlaceCard,
  PlaceOperatingNotices,
  PlaceVerificationMedia,
  PlaceVisitDecision,
  RecommendationExplanation,
} from '../model/placeExploration.types';
import { selectMapViewportParams } from '../model/placeExploration.types';

export function createPlaceExplorationApi(client: ApiClient = apiClient) {
  return {
    getMapViewport: (
      params: MapViewportParams,
      signal?: AbortSignal,
    ): Promise<MapViewport> =>
      client.get<MapViewport>('/places/map', {
        params: selectMapViewportParams(params),
        signal,
      }),

    getPlaceCard: (placeId: number, signal?: AbortSignal): Promise<PlaceCard> =>
      client.get<PlaceCard>(`/places/${placeId}/card`, { signal }),

    getPlaceVisitDecision: (
      placeId: number,
      signal?: AbortSignal,
    ): Promise<PlaceVisitDecision> =>
      client.get<PlaceVisitDecision>(`/places/${placeId}/visit-decision`, { signal }),

    getPlaceOperatingNotices: (
      placeId: number,
      signal?: AbortSignal,
    ): Promise<PlaceOperatingNotices> =>
      client.get<PlaceOperatingNotices>(`/places/${placeId}/operating-notices`, { signal }),

    getPlaceVerificationMedia: (
      id: number,
      signal?: AbortSignal,
    ): Promise<PlaceVerificationMedia> =>
      client.get<PlaceVerificationMedia>(`/places/${id}/media/verification`, { signal }),

    getRecommendationExplanation: (
      requestId: string,
      signal?: AbortSignal,
    ): Promise<RecommendationExplanation> =>
      client.get<RecommendationExplanation>(
        `/places/recommendations/${encodeURIComponent(requestId)}/explanation`,
        { signal },
      ),

    recordMapLinkConversion: (
      placeId: number,
      body: MapLinkConversionBody,
      signal?: AbortSignal,
    ): Promise<MapLinkConversionResult> =>
      client.post<MapLinkConversionResult, MapLinkConversionBody>(
        `/places/${placeId}/map-link-conversions`,
        body,
        { signal },
      ),
  };
}

export const placeExplorationApi = createPlaceExplorationApi();
