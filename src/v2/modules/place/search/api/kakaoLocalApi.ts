import { env } from '../../../../shared/config';

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
  signal?: AbortSignal;
};

const KAKAO_LOCAL_BASE_URL = 'https://dapi.kakao.com/v2/local';

const kakaoHeaders = {
  Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
};

const KAKAO_FETCH_TIMEOUT_MS = 8000;

async function fetchKakaoJson<T>(url: string, signal?: AbortSignal): Promise<T | undefined> {
  if (signal?.aborted) return undefined;

  const controller = new AbortController();
  const abort = () => controller.abort();
  const timeoutId = setTimeout(abort, KAKAO_FETCH_TIMEOUT_MS);
  signal?.addEventListener('abort', abort, { once: true });

  try {
    const response = await fetch(url, { headers: kakaoHeaders, signal: controller.signal });
    if (!response.ok || controller.signal.aborted) return undefined;
    const data = await response.json() as T;
    return controller.signal.aborted ? undefined : data;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abort);
  }
}

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

export const getAddressFromCoordinate = async (lat: number, lng: number, signal?: AbortSignal) => {
  if (!hasKakaoRestApiKey()) {
    return '';
  }

  const params = new URLSearchParams({
    input_coord: 'WGS84',
    x: String(lng),
    y: String(lat),
  });

  try {
    const data = await fetchKakaoJson<KakaoCoordToAddressResponse>(
      `${KAKAO_LOCAL_BASE_URL}/geo/coord2address.json?${params}`, signal,
    );
    const address = data?.documents?.[0];

    return address?.road_address?.address_name ?? address?.address?.address_name ?? '';
  } catch {
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

  const data = await fetchKakaoJson<KakaoKeywordSearchResponse>(
    `${KAKAO_LOCAL_BASE_URL}/search/keyword.json?${params}`, options?.signal,
  );
  const items = data?.documents?.flatMap<KakaoLocalSearchItem>((document) => {
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

const searchKakaoAddresses = async (query: string, signal?: AbortSignal) => {
  const params = new URLSearchParams({
    query,
    size: '10',
  });

  const data = await fetchKakaoJson<KakaoAddressSearchResponse>(
    `${KAKAO_LOCAL_BASE_URL}/search/address.json?${params}`, signal,
  );
  const items = data?.documents?.flatMap<KakaoLocalSearchItem>((document, index) => {
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

  return items;
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
    const [nearbyKeywordResults, addressResults] = await Promise.all([
      searchKakaoKeywordPlaces(trimmedQuery, options),
      searchKakaoAddresses(trimmedQuery, options?.signal),
    ]);
    if (options?.signal?.aborted) return [];
    const fallbackKeywordResults = shouldRetryKeywordSearchWithoutCenter(
      nearbyKeywordResults,
      options
    )
      ? await searchKakaoKeywordPlaces(trimmedQuery, { signal: options?.signal })
      : [];
    if (options?.signal?.aborted) return [];
    const mergedResults = uniqueByCoordinateAndName([
      ...nearbyKeywordResults,
      ...fallbackKeywordResults,
      ...addressResults,
    ]);

    return mergedResults;
  } catch {
    return [];
  }
};
