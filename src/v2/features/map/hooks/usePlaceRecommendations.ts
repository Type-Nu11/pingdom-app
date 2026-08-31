import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recommendationQueryKeys } from '../../travel-purposes/model/travelPurposeQueryKeys';
import { placeApi, type GetPlaceRecommendationsRequest } from '../api/placeApi';

export const placeRecommendationQueryKeys = {
  all: recommendationQueryKeys.all,
  list: (params: GetPlaceRecommendationsRequest) => recommendationQueryKeys.list(params),
};

export const usePlaceRecommendations = (params: GetPlaceRecommendationsRequest) => {
  const queryParams = useMemo(() => ({
    latitude: params.latitude,
    limit: params.limit ?? 10,
    longitude: params.longitude,
    radiusKm: params.radiusKm ?? 5,
    ...(params.recommendationVersion ? { recommendationVersion: params.recommendationVersion } : {}),
  }), [
    params.latitude,
    params.limit,
    params.longitude,
    params.radiusKm,
    params.recommendationVersion,
  ]);
  const recommendationsQuery = useQuery({
    enabled: Number.isFinite(queryParams.latitude) && Number.isFinite(queryParams.longitude),
    queryKey: placeRecommendationQueryKeys.list(queryParams),
    queryFn: () => placeApi.getRecommendations(queryParams),
  });

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    console.log('[usePlaceRecommendations]', {
      enabled: Number.isFinite(queryParams.latitude) && Number.isFinite(queryParams.longitude),
      isError: recommendationsQuery.isError,
      isLoading: recommendationsQuery.isLoading,
      params: queryParams,
      placesCount: recommendationsQuery.data?.places?.length ?? 0,
      recommendedCount: recommendationsQuery.data?.recommendedCount,
    });
  }, [
    queryParams,
    recommendationsQuery.data?.places?.length,
    recommendationsQuery.data?.recommendedCount,
    recommendationsQuery.isError,
    recommendationsQuery.isLoading,
  ]);

  return {
    appliedActivityIntent: recommendationsQuery.data?.appliedActivityIntent ?? null,
    appliedRadiusKm: recommendationsQuery.data?.appliedRadiusKm,
    appliedTravelPurposes: recommendationsQuery.data?.appliedTravelPurposes ?? [],
    data: recommendationsQuery.data,
    error: recommendationsQuery.error,
    isError: recommendationsQuery.isError,
    isFetching: recommendationsQuery.isFetching,
    isLoading: recommendationsQuery.isLoading,
    limitReasons: recommendationsQuery.data?.limitReasons ?? [],
    places: recommendationsQuery.data?.places ?? [],
    recommendationRequestId: recommendationsQuery.data?.recommendationRequestId,
    recommendationVersion: recommendationsQuery.data?.recommendationVersion,
    requestedRadiusKm: recommendationsQuery.data?.requestedRadiusKm,
    refetch: recommendationsQuery.refetch,
  };
};

export default usePlaceRecommendations;
