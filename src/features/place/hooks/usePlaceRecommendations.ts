import { useQuery } from '@tanstack/react-query';
import { placeApi, type GetPlaceRecommendationsRequest } from '../api/placeApi';

export const placeRecommendationQueryKeys = {
  all: ['placeRecommendations'] as const,
  list: (params: GetPlaceRecommendationsRequest) => [
    ...placeRecommendationQueryKeys.all,
    'list',
    params,
  ] as const,
};

export const usePlaceRecommendations = (params: GetPlaceRecommendationsRequest) => {
  const queryParams = {
    latitude: params.latitude,
    limit: params.limit ?? 10,
    longitude: params.longitude,
    radiusKm: params.radiusKm ?? 5,
    ...(params.recommendationVersion ? { recommendationVersion: params.recommendationVersion } : {}),
  };
  const recommendationsQuery = useQuery({
    enabled: Number.isFinite(queryParams.latitude) && Number.isFinite(queryParams.longitude),
    queryKey: placeRecommendationQueryKeys.list(queryParams),
    queryFn: () => placeApi.getRecommendations(queryParams),
  });

  return {
    error: recommendationsQuery.error,
    isError: recommendationsQuery.isError,
    isLoading: recommendationsQuery.isLoading,
    places: recommendationsQuery.data?.places ?? [],
    recommendationRequestId: recommendationsQuery.data?.recommendationRequestId,
    recommendationVersion: recommendationsQuery.data?.recommendationVersion,
    refetch: recommendationsQuery.refetch,
  };
};

export default usePlaceRecommendations;
