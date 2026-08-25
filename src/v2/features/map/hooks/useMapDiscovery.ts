import { useEffect, useMemo, useState } from 'react';

import {
  usePlaceAutocomplete,
  usePlaceCard,
  usePlaceList,
  usePlaceMap,
  usePlaceOperatingNotices,
  usePlaceVerificationMedia,
  usePlaceVisitDecision,
} from '../../place-exploration';
import { usePlaceDetail } from '../../place-detail/hooks/usePlaceDetail';
import { env } from '../../../shared/config';
import {
  createViewport,
  toAutocompleteResults,
  toPlaceCardViewModel,
  toPlaceResults,
  toResultMarkers,
  toViewportMarkers,
} from '../model/mapDiscovery';
import type { MapPlaceSelection } from '../model/mapDiscovery';
import type { Coordinate } from '../model/map.types';

type MapDiscoveryParams = {
  apiZoom?: number;
  category: string | null;
  center: Coordinate;
  keyword: string;
  radiusKm: number;
  selectedPlace: MapPlaceSelection | null;
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timeoutId);
  }, [delayMs, value]);

  return debouncedValue;
}

export function useMapDiscovery({
  apiZoom = 15,
  category,
  center,
  keyword,
  radiusKm,
  selectedPlace: selectedPlaceSelection,
}: MapDiscoveryParams) {
  const normalizedKeyword = keyword.trim();
  const debouncedKeyword = useDebouncedValue(normalizedKeyword, 250);
  const isFiltered = Boolean(debouncedKeyword || category);
  const viewportParams = useMemo(
    () => createViewport(center, radiusKm, apiZoom),
    [apiZoom, center.lat, center.lng, radiusKm],
  );
  const listParams = useMemo(() => ({
    category: category ?? undefined,
    keyword: debouncedKeyword || undefined,
    latitude: center.lat,
    limit: 100,
    longitude: center.lng,
    page: 1,
    radiusKm,
    sort: 'NEAREST',
  }), [category, center.lat, center.lng, debouncedKeyword, radiusKm]);
  const autocompleteParams = useMemo(() => ({
    keyword: debouncedKeyword,
    latitude: center.lat,
    limit: 10,
    longitude: center.lng,
  }), [center.lat, center.lng, debouncedKeyword]);

  const discoveryEnabled = env.featureFlags.placeList;
  const mapQuery = usePlaceMap(viewportParams, { enabled: discoveryEnabled && !isFiltered });
  const listQuery = usePlaceList(listParams, { enabled: discoveryEnabled && isFiltered });
  const autocompleteQuery = usePlaceAutocomplete(autocompleteParams, {
    enabled: discoveryEnabled && debouncedKeyword.length >= 2,
  });
  const detailId = selectedPlaceSelection?.id ?? 0;
  const detailEnabled = discoveryEnabled && selectedPlaceSelection !== null;
  const cardQuery = usePlaceCard(detailId, { enabled: detailEnabled });
  const decisionQuery = usePlaceVisitDecision(detailId, { enabled: detailEnabled });
  const noticesQuery = usePlaceOperatingNotices(detailId, { enabled: detailEnabled });
  const mediaQuery = usePlaceVerificationMedia(detailId, { enabled: detailEnabled });
  const detailQuery = usePlaceDetail(detailId, { enabled: detailEnabled });

  const results = useMemo(() => toPlaceResults(listQuery.data), [listQuery.data]);
  const markers = useMemo(
    () => isFiltered ? toResultMarkers(results) : toViewportMarkers(mapQuery.data),
    [isFiltered, mapQuery.data, results],
  );
  const selectedPlace = useMemo(
    () => selectedPlaceSelection && cardQuery.data?.id === selectedPlaceSelection.id
      ? toPlaceCardViewModel(
        cardQuery.data,
        decisionQuery.data,
        noticesQuery.data,
        selectedPlaceSelection.distanceMeters,
        detailQuery.data,
        mediaQuery.data,
      )
      : null,
    [
      cardQuery.data,
      decisionQuery.data,
      detailQuery.data,
      mediaQuery.data,
      noticesQuery.data,
      selectedPlaceSelection,
    ],
  );
  const activeQuery = isFiltered ? listQuery : mapQuery;

  return {
    autocomplete: toAutocompleteResults(autocompleteQuery.data),
    autocompleteError: autocompleteQuery.error,
    dataSource: env.apiMode,
    hasResolvedMarkers: activeQuery.isSuccess && !activeQuery.isFetching,
    isAutocompleteLoading: autocompleteQuery.isFetching,
    isDisabled: !discoveryEnabled,
    isEmpty: !activeQuery.isLoading && !activeQuery.error && markers.length === 0,
    isLoading: activeQuery.isLoading,
    isRefreshing: activeQuery.isFetching && !activeQuery.isLoading,
    markers,
    queryError: activeQuery.error,
    refetch: activeQuery.refetch,
    results,
    selectedPlace,
    selectedPlaceError: cardQuery.error,
    selectedPlaceLoading: cardQuery.isLoading,
    selectedPlaceRefetch: cardQuery.refetch,
  };
}
