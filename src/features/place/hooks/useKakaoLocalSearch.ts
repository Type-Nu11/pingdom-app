import { useRef, useState } from 'react';
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
  const [searchResults, setSearchResults] = useState<KakaoLocalSearchItem[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [searchStatusMessage, setSearchStatusMessage] = useState('');
  const requestIdRef = useRef(0);

  const clearSearchResults = () => {
    setSearchResults([]);
    setSearchStatusMessage('');
  };

  const resolveAddressFromCoordinate = async (lat: number, lng: number) => {
    const requestId = ++requestIdRef.current;

    try {
      const nextAddress = await getAddressFromCoordinate(lat, lng);

      if (requestId !== requestIdRef.current) {
        return null;
      }

      return nextAddress || formatCoordinateAddress(lat, lng);
    } catch {
      if (requestId !== requestIdRef.current) {
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
      setSearchStatusMessage('검색어를 입력해 주세요');
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsSearchingAddress(true);
    setSearchResults([]);
    setSearchStatusMessage('');

    try {
      const places = await searchKakaoLocalPlaces(trimmedQuery, {
        centerLat: options.centerLat,
        centerLng: options.centerLng,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (places.length === 0) {
        setSearchStatusMessage('검색 결과가 없습니다');
        return;
      }

      setSearchResults(places);
      setSearchStatusMessage('검색 결과에서 주소를 선택해 주세요');
    } catch {
      if (requestId === requestIdRef.current) {
        setSearchStatusMessage('주소 검색에 실패했습니다');
      }
    } finally {
      if (requestId === requestIdRef.current) {
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
