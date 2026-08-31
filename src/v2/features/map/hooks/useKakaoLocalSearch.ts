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

    console.log('[KakaoLocalSearch] search start', {
      centerLat: options.centerLat,
      centerLng: options.centerLng,
      query: trimmedQuery,
    });

    if (isSearchingAddress) {
      console.log('[KakaoLocalSearch] search skipped: already searching');
      return;
    }

    if (!trimmedQuery) {
      console.log('[KakaoLocalSearch] search skipped: empty query');
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
        console.log('[KakaoLocalSearch] search ignored: stale request', { requestId });
        return;
      }

      if (places.length === 0) {
        console.log('[KakaoLocalSearch] search empty result', {
          centerLat: options.centerLat,
          centerLng: options.centerLng,
          query: trimmedQuery,
        });
        setSearchStatusMessage(t('map.search.empty'));
        return;
      }

      console.log('[KakaoLocalSearch] search success', {
        count: places.length,
        query: trimmedQuery,
        sample: places.slice(0, 3).map((place) => ({
          kakaoPlaceId: place.kakaoPlaceId,
          lat: place.lat,
          lng: place.lng,
          name: place.name,
        })),
      });
      setSearchResults(places);
      setSearchStatusMessage('');
    } catch (error) {
      console.error('[KakaoLocalSearch] search failed', {
        centerLat: options.centerLat,
        centerLng: options.centerLng,
        error,
        query: trimmedQuery,
      });
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
