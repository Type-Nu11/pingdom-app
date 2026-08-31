import { useEffect, useMemo } from 'react';
import {
  getPlaceListRuntimeState,
  usePlaceList,
} from '../../place-exploration';
import { toPlaceResults } from '../model/mapDiscovery';
import { env } from '../../../shared/config';
import type { GetPlacesRequest } from '../api/placeApi';
import type { MapMarker } from '../model/place.types';
import { normalizePlaceCategory } from '../utils/placeCategory';

export { placeQueryKeys } from '../../place-exploration';

function toMapMarker(place: {
  category?: string;
  id: number;
  latitude: number;
  longitude: number;
}): MapMarker {
  return {
    category: normalizePlaceCategory(place.category),
    id: String(place.id),
    lat: place.latitude,
    lng: place.longitude,
    markerType: 'default',
  };
}

export const usePlaces = (
  params: GetPlacesRequest = {},
  enabled = env.featureFlags.placeList,
) => {
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
  const placesQuery = usePlaceList(queryParams, { enabled });
  const places = useMemo(() => toPlaceResults(placesQuery.data).map((place) => ({
    address: place.address,
    category: place.category,
    distanceMeters: place.distanceMeters ?? undefined,
    id: place.id,
    latitude: place.coordinate.lat,
    longitude: place.coordinate.lng,
    name: place.name,
  })), [placesQuery.data]);

  useEffect(() => {
    if (!placesQuery.isError) {
      return;
    }

    console.warn('[places]', 'failed to load place list', {
      enabled,
      message: placesQuery.error instanceof Error ? placesQuery.error.message : 'Unknown error',
    });
  }, [enabled, placesQuery.error, placesQuery.isError]);

  const markers = useMemo(() => places.map(toMapMarker), [places]);
  const status = getPlaceListRuntimeState({
    enabled,
    isError: placesQuery.isError,
    isLoading: placesQuery.isLoading,
    placeCount: places.length,
  });

  return {
    dataSource: env.apiMode,
    enabled,
    error: placesQuery.error,
    isError: placesQuery.isError,
    isLoading: placesQuery.isLoading,
    markers,
    places,
    refetch: placesQuery.refetch,
    status,
  };
};

export default usePlaces;
