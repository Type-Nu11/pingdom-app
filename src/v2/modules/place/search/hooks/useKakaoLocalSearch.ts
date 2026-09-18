import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAddressFromCoordinate,
  type KakaoLocalSearchItem,
  searchKakaoLocalPlaces,
} from '../api/kakaoLocalApi';

type SearchPlacesOptions = {
  centerLat: number;
  centerLng: number;
};

const formatCoordinateAddress = (lat: number, lng: number) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

export const useKakaoLocalSearch = () => {
  const { t } = useTranslation();
  const [searchResults, setSearchResults] = useState<KakaoLocalSearchItem[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [searchStatusMessage, setSearchStatusMessage] = useState('');
  const addressRequestIdRef = useRef(0);
  const searchRequestIdRef = useRef(0);

  const clearSearchResults = () => {
    setSearchResults([]);
    setSearchStatusMessage('');
  };

  const resolveAddressFromCoordinate = async (lat: number, lng: number) => {
    const requestId = ++addressRequestIdRef.current;

    try {
      const nextAddress = await getAddressFromCoordinate(lat, lng);

      if (requestId !== addressRequestIdRef.current) {
        return null;
      }

      return nextAddress || formatCoordinateAddress(lat, lng);
    } catch {
      if (requestId !== addressRequestIdRef.current) {
        return null;
      }

      return formatCoordinateAddress(lat, lng);
    }
  };

  const searchPlaces = async (query: string, options: SearchPlacesOptions) => {
    const trimmedQuery = query.trim();

    if (isSearchingAddress) {
      return;
    }

    if (!trimmedQuery) {
      setSearchStatusMessage(t('map.search.statusPlaceholder'));
      return;
    }

    const requestId = ++searchRequestIdRef.current;
    setIsSearchingAddress(true);
    setSearchResults([]);
    setSearchStatusMessage('');

    try {
      const places = await searchKakaoLocalPlaces(trimmedQuery, {
        centerLat: options.centerLat,
        centerLng: options.centerLng,
      });

      if (requestId !== searchRequestIdRef.current) {
        return;
      }

      if (places.length === 0) {
        setSearchStatusMessage(t('map.search.empty'));
        return;
      }

      setSearchResults(places);
      setSearchStatusMessage('');
    } catch {
      if (requestId === searchRequestIdRef.current) {
        setSearchStatusMessage(t('map.search.failed'));
      }
    } finally {
      if (requestId === searchRequestIdRef.current) {
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
