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
