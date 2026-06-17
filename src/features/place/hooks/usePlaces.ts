import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { placeApi, type GetPlacesRequest } from '../api/placeApi';
import type { MapMarker } from '../model/place.types';

const DEFAULT_PLACE_CATEGORY: MapMarker['category'] = 'food';

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

export const usePlaces = (params: GetPlacesRequest = {}) => {
  const queryParams = {
    limit: params.limit ?? 100,
    page: params.page ?? 1,
    ...(params.keyword ? { keyword: params.keyword } : {}),
  };
  const placesQuery = useQuery({
    queryKey: placeQueryKeys.list(queryParams),
    queryFn: () => placeApi.getPlaces(queryParams),
  });

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
