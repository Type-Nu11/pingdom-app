import { useMemo } from 'react';
import {
  getPlaceListRuntimeState,
  usePlaceList,
  usePlaceMap,
  type MapViewportParams,
} from '../../exploration';
import { toPlaceResults, toViewportMarkers } from '../../map/selection/model/mapDiscovery';
import { env } from '../../../../shared/config';
import type { GetPlacesRequest } from '../../exploration/api/placeApi';
import type { MapMarker } from '../../map/markers/model/placeMarker';
import { normalizePlaceCategory } from '../../core/placeCategory';

export { placeQueryKeys } from '../../exploration';

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
  viewport?: MapViewportParams,
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
  const placesQuery = usePlaceList(queryParams, { enabled: enabled && !viewport });
  // The placeholder is only used by a disabled query for list consumers.
  const mapQuery = usePlaceMap(viewport ?? { west: 0, south: 0, east: 0, north: 0, zoom: 0 }, { enabled: enabled && Boolean(viewport) });
  const viewportMarkers = useMemo(() => toViewportMarkers(mapQuery.data), [mapQuery.data]);
  const places = useMemo(() => viewport
    ? viewportMarkers.flatMap((marker) => marker.placeId === null ? [] : [{
        address: '', category: marker.category, distanceMeters: undefined,
        id: marker.placeId, latitude: marker.lat, longitude: marker.lng, name: marker.name,
      }])
    : toPlaceResults(placesQuery.data).map((place) => ({
    address: place.address,
    category: place.category,
    distanceMeters: place.distanceMeters ?? undefined,
    id: place.id,
    latitude: place.coordinate.lat,
    longitude: place.coordinate.lng,
    name: place.name,
  })), [placesQuery.data, viewport, viewportMarkers]);

  const markers = useMemo(() => viewport ? viewportMarkers.map((marker): MapMarker => ({
    category: normalizePlaceCategory(marker.category),
    id: marker.placeId === null ? marker.id : String(marker.placeId),
    lat: marker.lat, lng: marker.lng, markerType: marker.markerType,
  })) : places.map(toMapMarker), [places, viewport, viewportMarkers]);
  const activeQuery = viewport ? mapQuery : placesQuery;
  const status = getPlaceListRuntimeState({
    enabled,
    isError: activeQuery.isError,
    isLoading: activeQuery.isLoading,
    placeCount: places.length,
  });

  return {
    dataSource: env.apiMode,
    enabled,
    error: activeQuery.error,
    isError: activeQuery.isError,
    isFetching: activeQuery.isFetching,
    isLoading: activeQuery.isLoading,
    markers,
    places,
    refetch: activeQuery.refetch,
    status,
  };
};

export default usePlaces;
