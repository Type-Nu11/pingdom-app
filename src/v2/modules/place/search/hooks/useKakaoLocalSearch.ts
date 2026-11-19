import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAddressFromCoordinate,
  type KakaoLocalSearchItem,
  searchKakaoLocalPlaces,
} from '../api/kakaoLocalApi';

type SearchPlacesOptions = {
  centerLat?: number;
  centerLng?: number;
};

const formatCoordinateAddress = (lat: number, lng: number) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

export const useKakaoLocalSearch = () => {
  const { t } = useTranslation();
  const [searchResults, setSearchResults] = useState<KakaoLocalSearchItem[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [searchStatusMessage, setSearchStatusMessage] = useState('');
  const addressRequest = useRef<AbortController | null>(null);
  const searchRequest = useRef<AbortController | null>(null);

  useEffect(() => () => {
    addressRequest.current?.abort();
    searchRequest.current?.abort();
  }, []);

  const clearSearchResults = () => {
    searchRequest.current?.abort();
    searchRequest.current = null;
    setIsSearchingAddress(false);
    setSearchResults([]);
    setSearchStatusMessage('');
  };

  const resolveAddressFromCoordinate = async (lat: number, lng: number) => {
    addressRequest.current?.abort();
    const request = new AbortController();
    addressRequest.current = request;

    try {
      const address = await getAddressFromCoordinate(lat, lng, request.signal);
      return request.signal.aborted ? null : address || formatCoordinateAddress(lat, lng);
    } finally {
      if (addressRequest.current === request) addressRequest.current = null;
    }
  };

  const searchPlaces = async (query: string, options: SearchPlacesOptions) => {
    clearSearchResults();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSearchStatusMessage(t('map.search.statusPlaceholder'));
      return;
    }

    const request = new AbortController();
    searchRequest.current = request;
    setIsSearchingAddress(true);

    try {
      const places = await searchKakaoLocalPlaces(trimmedQuery, { ...options, signal: request.signal });
      if (request.signal.aborted) return;
      if (places.length === 0) {
        setSearchStatusMessage(t('map.search.empty'));
        return;
      }

      setSearchResults(places);
    } catch {
      if (!request.signal.aborted) setSearchStatusMessage(t('map.search.failed'));
    } finally {
      if (!request.signal.aborted) {
        searchRequest.current = null;
        setIsSearchingAddress(false);
      }
    }
  };

  return {
    clearSearchResults,
    isSearchingAddress,
    resolveAddressFromCoordinate,
    searchPlaces,
    searchResults,
    searchStatusMessage,
  };
};
