import { env } from '../../../shared/config';

const KAKAO_REST_API_KEY = env.kakaoRestApiKey;

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
  kakaoPlaceId?: string;
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

const KAKAO_FETCH_TIMEOUT_MS = 8000;

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = KAKAO_FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId);
  });
}

const parseCoordinate = (value?: string) => {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
};

const hasKakaoRestApiKey = () => Boolean(KAKAO_REST_API_KEY);

const logKakaoSearch = (label: string, payload: Record<string, unknown>) => {
  console.log(`[KakaoLocal] ${label}`, payload);
};

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
    const response = await fetchWithTimeout(`${KAKAO_LOCAL_BASE_URL}/geo/coord2address.json?${params}`, {
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

  logKakaoSearch('keyword request', {
    centerLat: options?.centerLat,
    centerLng: options?.centerLng,
    query,
    radius: params.get('radius'),
    sort: params.get('sort'),
  });

  const response = await fetchWithTimeout(`${KAKAO_LOCAL_BASE_URL}/search/keyword.json?${params}`, {
    headers: kakaoHeaders,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    logKakaoSearch('keyword response error', {
      body: errorText,
      query,
      status: response.status,
    });
    return [];
  }

  const data = await response.json() as KakaoKeywordSearchResponse;
  const items = data.documents?.flatMap<KakaoLocalSearchItem>((document) => {
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
      kakaoPlaceId: document.id,
      lat,
      lng,
      name,
      roadAddress,
    }];
  }) ?? [];

  logKakaoSearch('keyword response success', {
    count: items.length,
    hasCenter: options?.centerLat !== undefined && options.centerLng !== undefined,
    query,
    sample: items.slice(0, 3).map((item) => ({
      kakaoPlaceId: item.kakaoPlaceId,
      lat: item.lat,
      lng: item.lng,
      name: item.name,
    })),
    status: response.status,
  });

  return items;
};

const shouldRetryKeywordSearchWithoutCenter = (
  results: KakaoLocalSearchItem[],
  options?: SearchKakaoLocalPlacesOptions
) => (
  results.length === 0
  && options?.centerLat !== undefined
  && options.centerLng !== undefined
);

const searchKakaoAddresses = async (query: string) => {
  const params = new URLSearchParams({
    query,
    size: '10',
  });

  logKakaoSearch('address request', { query });

  const response = await fetchWithTimeout(`${KAKAO_LOCAL_BASE_URL}/search/address.json?${params}`, {
    headers: kakaoHeaders,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    logKakaoSearch('address response error', {
      body: errorText,
      query,
      status: response.status,
    });
    return [];
  }

  const data = await response.json() as KakaoAddressSearchResponse;
  const items = data.documents?.flatMap<KakaoLocalSearchItem>((document, index) => {
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

  logKakaoSearch('address response success', {
    count: items.length,
    query,
    sample: items.slice(0, 3).map((item) => ({
      lat: item.lat,
      lng: item.lng,
      name: item.name,
    })),
    status: response.status,
  });

  return items;
};

export const searchKakaoLocalPlaces = async (
  query: string,
  options?: SearchKakaoLocalPlacesOptions
) => {
  const trimmedQuery = query.trim();

  if (!trimmedQuery || !hasKakaoRestApiKey()) {
    logKakaoSearch('search skipped', {
      hasApiKey: hasKakaoRestApiKey(),
      query: trimmedQuery,
    });
    return [];
  }

  try {
    const [nearbyKeywordResults, addressResults] = await Promise.all([
      searchKakaoKeywordPlaces(trimmedQuery, options),
      searchKakaoAddresses(trimmedQuery),
    ]);
    const fallbackKeywordResults = shouldRetryKeywordSearchWithoutCenter(
      nearbyKeywordResults,
      options
    )
      ? await searchKakaoKeywordPlaces(trimmedQuery)
      : [];
    const mergedResults = uniqueByCoordinateAndName([
      ...nearbyKeywordResults,
      ...fallbackKeywordResults,
      ...addressResults,
    ]);

    logKakaoSearch('search merged results', {
      addressCount: addressResults.length,
      fallbackKeywordCount: fallbackKeywordResults.length,
      finalCount: mergedResults.length,
      nearbyKeywordCount: nearbyKeywordResults.length,
      query: trimmedQuery,
    });

    return mergedResults;
  } catch (error) {
    console.error('[KakaoLocal] search failed', {
      centerLat: options?.centerLat,
      centerLng: options?.centerLng,
      error,
      query: trimmedQuery,
    });
    return [];
  }
};
