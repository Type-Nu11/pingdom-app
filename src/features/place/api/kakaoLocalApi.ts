import Constants from 'expo-constants';

const KAKAO_REST_API_KEY =
  process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY
  ?? process.env.KAKAO_REST_API_KEY
  ?? Constants.expoConfig?.extra?.kakaoRestApiKey;

type KakaoCoordToAddressResponse = {
  documents?: Array<{
    address?: {
      address_name?: string;
    };
    road_address?: {
      address_name?: string;
    };
  }>;
};

type KakaoAddressSearchResponse = {
  documents?: Array<{
    address_name?: string;
    x?: string;
    y?: string;
    address?: {
      address_name?: string;
      x?: string;
      y?: string;
    };
    road_address?: {
      address_name?: string;
      x?: string;
      y?: string;
    };
  }>;
};

type KakaoKeywordSearchResponse = {
  documents?: Array<{
    address_name?: string;
    place_name?: string;
    road_address_name?: string;
    x?: string;
    y?: string;
  }>;
};

export type KakaoAddressSearchResult = {
  address: string;
  lat: number;
  lng: number;
};

export const getAddressFromCoordinate = async (lat: number, lng: number) => {
  if (!KAKAO_REST_API_KEY) {
    return '';
  }

  const params = new URLSearchParams({
    input_coord: 'WGS84',
    x: String(lng),
    y: String(lat),
  });

  const response = await fetch(`https://dapi.kakao.com/v2/local/geo/coord2address.json?${params}`, {
    headers: {
      Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
    },
  });

  if (!response.ok) {
    return '';
  }

  const data = await response.json() as KakaoCoordToAddressResponse;
  const address = data.documents?.[0];

  return address?.road_address?.address_name ?? address?.address?.address_name ?? '';
};

export const searchAddress = async (query: string): Promise<KakaoAddressSearchResult | null> => {
  const trimmedQuery = query.trim();

  if (!KAKAO_REST_API_KEY || !trimmedQuery) {
    return null;
  }

  const params = new URLSearchParams({
    query: trimmedQuery,
    size: '1',
  });

  const response = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?${params}`, {
    headers: {
      Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json() as KakaoAddressSearchResponse;
  const result = data.documents?.[0];
  const location = result?.road_address ?? result?.address ?? result;
  const lat = Number(location?.y);
  const lng = Number(location?.x);
  const address = result?.road_address?.address_name ?? result?.address?.address_name ?? result?.address_name;

  if (!address || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  return { address, lat, lng };
};

export const searchAddressOrPlace = async (query: string): Promise<KakaoAddressSearchResult | null> => {
  const addressResult = await searchAddress(query);

  if (addressResult) {
    return addressResult;
  }

  const trimmedQuery = query.trim();

  if (!KAKAO_REST_API_KEY || !trimmedQuery) {
    return null;
  }

  const params = new URLSearchParams({
    query: trimmedQuery,
    size: '1',
  });

  const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${params}`, {
    headers: {
      Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json() as KakaoKeywordSearchResponse;
  const result = data.documents?.[0];
  const lat = Number(result?.y);
  const lng = Number(result?.x);
  const address = result?.road_address_name ?? result?.address_name ?? result?.place_name;

  if (!address || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  return { address, lat, lng };
};
