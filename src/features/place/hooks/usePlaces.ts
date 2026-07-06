import { useEffect, useMemo } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { placeApi, type GetPlacesRequest } from '../api/placeApi';
import type { MapMarker } from '../model/place.types';

const DEFAULT_PLACE_CATEGORY: MapMarker['category'] = 'food';
// GET /places 서버 오류가 해결될 때까지 개발 환경에서 기본 마커 조회만 끌 수 있다.
const isPlaceListEnabled = process.env.EXPO_PUBLIC_ENABLE_PLACE_LIST !== 'false';

export const placeQueryKeys = {
  all: ['places'] as const,
  list: (params: GetPlacesRequest) => [...placeQueryKeys.all, 'list', params] as const,
};

function toMapMarker(place: {
  id: number;
  latitude: number;
  longitude: number;
}): MapMarker {
  return {
    category: DEFAULT_PLACE_CATEGORY,
    id: String(place.id),
    lat: place.latitude,
    lng: place.longitude,
    markerType: 'default',
  };
}

function getPlacesErrorLog(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as {
      code?: unknown;
      message?: unknown;
    } | undefined;

    return {
      code: responseData?.code,
      message: responseData?.message ?? error.message,
      status: error.response?.status,
      url: error.config?.url,
    };
  }

  return {
    message: error instanceof Error ? error.message : String(error),
  };
}

export const usePlaces = (params: GetPlacesRequest = {}) => {
  const queryParams = useMemo(() => ({
    limit: params.limit ?? 100,
    page: params.page ?? 1,
    ...(params.keyword ? { keyword: params.keyword } : {}),
    ...(params.category ? { category: params.category } : {}),
    ...(params.latitude !== undefined ? { latitude: params.latitude } : {}),
    ...(params.longitude !== undefined ? { longitude: params.longitude } : {}),
    ...(params.radiusKm !== undefined ? { radiusKm: params.radiusKm } : {}),
    ...(params.sort ? { sort: params.sort } : {}),
  }), [
    params.category,
    params.keyword,
    params.latitude,
    params.limit,
    params.longitude,
    params.page,
    params.radiusKm,
    params.sort,
  ]);
  const placesQuery = useQuery({
    queryKey: placeQueryKeys.list(queryParams),
    queryFn: () => placeApi.getPlaces(queryParams),
    enabled: isPlaceListEnabled,
  });

  useEffect(() => {
    if (!placesQuery.isError) {
      return;
    }

    console.warn('[places]', 'failed to load place list', {
      enabled: isPlaceListEnabled,
      error: getPlacesErrorLog(placesQuery.error),
      params: queryParams,
    });
  }, [placesQuery.error, placesQuery.isError, queryParams]);

  const places = placesQuery.data?.places ?? [];
  const markers = useMemo(() => places.map(toMapMarker), [places]);

  return {
    error: placesQuery.error,
    isError: placesQuery.isError,
    isLoading: placesQuery.isLoading,
    markers,
    places,
    refetch: placesQuery.refetch,
  };
};

export default usePlaces;
