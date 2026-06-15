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

type KakaoKeywordSearchResponse = {
  documents?: Array<{
    address_name?: string;
    category_name?: string;
    id?: string;
    place_name?: string;
    road_address_name?: string;
    x?: string;
    y?: string;
  }>;
};

type KakaoAddressSearchResponse = {
  documents?: Array<{
    address?: {
      address_name?: string;
    };
    address_name?: string;
    road_address?: {
      address_name?: string;
      building_name?: string;
    };
    x?: string;
    y?: string;
  }>;
};

export type KakaoLocalSearchItem = {
  address: string;
  category?: string;
  id: string;
  lat: number;
  lng: number;
  name: string;
  roadAddress: string;
};

type SearchKakaoLocalPlacesOptions = {
  centerLat?: number;
  centerLng?: number;
};

const KAKAO_LOCAL_BASE_URL = 'https://dapi.kakao.com/v2/local';

const kakaoHeaders = {
  Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
};

const parseCoordinate = (value?: string) => {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
};

const hasKakaoRestApiKey = () => Boolean(KAKAO_REST_API_KEY);

const uniqueByCoordinateAndName = (items: KakaoLocalSearchItem[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.name}-${item.lat}-${item.lng}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

export const getAddressFromCoordinate = async (lat: number, lng: number) => {
  if (!hasKakaoRestApiKey()) {
    return '';
  }

  const params = new URLSearchParams({
    input_coord: 'WGS84',
    x: String(lng),
    y: String(lat),
  });

  try {
    const response = await fetch(`${KAKAO_LOCAL_BASE_URL}/geo/coord2address.json?${params}`, {
      headers: kakaoHeaders,
    });

    if (!response.ok) {
      return '';
    }

    const data = await response.json() as KakaoCoordToAddressResponse;
    const address = data.documents?.[0];

    return address?.road_address?.address_name ?? address?.address?.address_name ?? '';
  } catch (error) {
    console.error('좌표 → 주소 변환 실패', error);
    return '';
  }
};

const searchKakaoKeywordPlaces = async (
  query: string,
  options?: SearchKakaoLocalPlacesOptions
) => {
  const params = new URLSearchParams({
    query,
    size: '10',
  });

  if (options?.centerLat !== undefined && options.centerLng !== undefined) {
    params.set('x', String(options.centerLng));
    params.set('y', String(options.centerLat));
    params.set('radius', '20000');
    params.set('sort', 'distance');
  }

  const response = await fetch(`${KAKAO_LOCAL_BASE_URL}/search/keyword.json?${params}`, {
    headers: kakaoHeaders,
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json() as KakaoKeywordSearchResponse;

  return data.documents?.flatMap<KakaoLocalSearchItem>((document) => {
    const lng = parseCoordinate(document.x);
    const lat = parseCoordinate(document.y);

    if (lat === null || lng === null) {
      return [];
    }

    const address = document.address_name ?? '';
    const roadAddress = document.road_address_name ?? '';
    const name = document.place_name ?? (roadAddress || address);

    if (!name || (!address && !roadAddress)) {
      return [];
    }

    return [{
      address,
      category: document.category_name,
      id: document.id ?? `keyword-${lat}-${lng}-${name}`,
      lat,
      lng,
      name,
      roadAddress,
    }];
  }) ?? [];
};

const searchKakaoAddresses = async (query: string) => {
  const params = new URLSearchParams({
    query,
    size: '10',
  });

  const response = await fetch(`${KAKAO_LOCAL_BASE_URL}/search/address.json?${params}`, {
    headers: kakaoHeaders,
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json() as KakaoAddressSearchResponse;

  return data.documents?.flatMap<KakaoLocalSearchItem>((document, index) => {
    const lng = parseCoordinate(document.x);
    const lat = parseCoordinate(document.y);

    if (lat === null || lng === null) {
      return [];
    }

    const address = document.address?.address_name ?? document.address_name ?? '';
    const roadAddress = document.road_address?.address_name ?? '';
    const buildingName = document.road_address?.building_name;
    const name = buildingName || roadAddress || address;

    if (!name || (!address && !roadAddress)) {
      return [];
    }

    return [{
      address,
      id: `address-${lat}-${lng}-${index}`,
      lat,
      lng,
      name,
      roadAddress,
    }];
  }) ?? [];
};

export const searchKakaoLocalPlaces = async (
  query: string,
  options?: SearchKakaoLocalPlacesOptions
) => {
  const trimmedQuery = query.trim();

  if (!trimmedQuery || !hasKakaoRestApiKey()) {
    return [];
  }

  try {
    const [keywordResults, addressResults] = await Promise.all([
      searchKakaoKeywordPlaces(trimmedQuery, options),
      searchKakaoAddresses(trimmedQuery),
    ]);

    return uniqueByCoordinateAndName([...keywordResults, ...addressResults]);
  } catch (error) {
    console.error('카카오 장소 검색 실패', error);
    return [];
  }
};
