import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import { env } from '../../../../shared/config';
import { getPlaceListRuntimeState, usePlaceAutocomplete } from '../../exploration';
import type { MapSearchSelection } from '../../map/selection/model/externalPlace';
import { toAutocompleteResults, type MapPlaceResult } from '../../map/selection/model/mapDiscovery';
import type { KakaoLocalSearchItem } from '../api/kakaoLocalApi';
import type { RecentSearchCategory } from '../model/recentSearch';
import { getRecentSearchOwnerKey, type RecentSearchOwner } from '../services/recentSearchStorage';
import { useRecentSearchStore } from '../store/recentSearchStore';
import { useKakaoLocalSearch } from './useKakaoLocalSearch';

export type SearchCategory = 'all' | RecentSearchCategory;

type Options = {
  centerLat?: number;
  centerLng?: number;
  recentSearchOwner?: RecentSearchOwner;
};

const toKakaoSelection = (item: KakaoLocalSearchItem): MapSearchSelection => ({
  address: item.address,
  id: item.id,
  isRegisteredPlace: false,
  lat: item.lat,
  lng: item.lng,
  name: item.name,
  roadAddress: item.roadAddress,
});

const toRegisteredSelection = (item: MapPlaceResult): MapSearchSelection => ({
  address: item.address,
  id: String(item.id),
  isRegisteredPlace: true,
  lat: item.coordinate.lat,
  lng: item.coordinate.lng,
  name: item.name,
  roadAddress: item.address,
});

export function useMapSearchFlow({ centerLat, centerLng, recentSearchOwner }: Options) {
  const searchRequestInFlight = useRef<{ query: string } | null>(null);
  const [query, setQuery] = useState('');
  const [registeredQuery, setRegisteredQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const activeRecentSearchOwnerKey = useRecentSearchStore((state) => state.activeOwnerKey);
  const recentSearchHydrationStatus = useRecentSearchStore((state) => state.hydrationStatus);
  const storedRecentQueries = useRecentSearchStore((state) => state.items);
  const activateRecentSearchOwner = useRecentSearchStore((state) => state.activateOwner);
  const clearRecentSearches = useRecentSearchStore((state) => state.clearSearches);
  const recordRecentSearch = useRecentSearchStore((state) => state.recordSearch);
  const removeRecentSearch = useRecentSearchStore((state) => state.removeSearch);
  const recentSearchOwnerKey = useMemo(
    () => recentSearchOwner ? getRecentSearchOwnerKey(recentSearchOwner) : null,
    [recentSearchOwner],
  );
  const isRecentSearchHydrating = recentSearchOwnerKey !== null
    && (
      activeRecentSearchOwnerKey !== recentSearchOwnerKey
      || recentSearchHydrationStatus === 'loading'
    );
  const recentQueries = activeRecentSearchOwnerKey === recentSearchOwnerKey
    ? storedRecentQueries
    : [];

  useEffect(() => {
    if (recentSearchOwner) void activateRecentSearchOwner(recentSearchOwner);
  }, [activateRecentSearchOwner, recentSearchOwner, recentSearchOwnerKey]);
  const searchCoordinates = centerLat !== undefined && centerLng !== undefined ? { centerLat, centerLng } : {};
  const registeredSearch = usePlaceAutocomplete({
    keyword: registeredQuery,
    ...(centerLat !== undefined && centerLng !== undefined ? { latitude: centerLat, longitude: centerLng } : {}),
  }, {
    enabled: env.featureFlags.placeList && registeredQuery.length > 0,
  });
  const registeredResults = toAutocompleteResults(registeredSearch.data);
  const {
    clearSearchResults,
    isSearchingAddress,
    searchPlaces,
    searchResults,
    searchStatusMessage,
  } = useKakaoLocalSearch();
  const isSearching = isSearchingAddress || registeredSearch.isFetching;
  const trimmedQuery = query.trim();
  const hasResults = registeredResults.length > 0 || searchResults.length > 0;
  const isResultMode = hasSearched || trimmedQuery.length > 0;
  const shouldShowEmptyState = hasSearched && !isSearching && !hasResults;
  const registeredStatus = getPlaceListRuntimeState({
    enabled: env.featureFlags.placeList,
    isError: registeredSearch.isError,
    isLoading: registeredSearch.isFetching,
    placeCount: registeredResults.length,
  });

  const handleQueryChange = (nextQuery: string) => {
    searchRequestInFlight.current = null;
    setQuery(nextQuery);
    setHasSearched(false);
    setRegisteredQuery('');
    clearSearchResults();
  };

  const runSearch = async (
    nextQuery = query,
    searchCategory: SearchCategory = activeCategory,
  ) => {
    const normalizedQuery = nextQuery.trim();
    if (searchRequestInFlight.current?.query === normalizedQuery) return;

    if (normalizedQuery) {
      Keyboard.dismiss();
      setQuery(normalizedQuery);
      if (recentSearchOwner) {
        void recordRecentSearch({
          category: searchCategory === 'all' ? 'art' : searchCategory,
          query: normalizedQuery,
        }, recentSearchOwner);
      }
    }

    setHasSearched(Boolean(normalizedQuery));
    setRegisteredQuery(normalizedQuery);
    const request = { query: normalizedQuery };
    searchRequestInFlight.current = request;
    try {
      await searchPlaces(normalizedQuery, searchCoordinates);
    } finally {
      if (searchRequestInFlight.current === request) searchRequestInFlight.current = null;
    }
  };

  return {
    activeCategory,
    setActiveCategory,
    query,
    trimmedQuery,
    handleQueryChange,
    runSearch,
    recentQueries,
    isRecentSearchHydrating,
    clearRecentSearches,
    removeRecentSearch,
    hasSearched,
    isSearching,
    hasResults,
    isResultMode,
    shouldShowEmptyState,
    registeredStatus,
    registeredResults: registeredResults.slice(0, 5).map(toRegisteredSelection),
    externalResults: searchResults.slice(0, 8).map((item) => ({
      ...toKakaoSelection(item),
      category: item.category,
    })),
    searchStatusMessage,
  };
}
