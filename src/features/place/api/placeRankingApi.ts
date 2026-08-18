import { api } from '../../../shared/api/apiClient';
import type {
  PlaceRankingPage,
  PlaceRankingPeriod,
  PlaceRankingScope,
} from '../model/placeRanking.types';

// 이슈 #190 제안 계약 전용 모듈. 서버 확정 전까지 이 파일만 교체하면 되도록 분리한다.
export const PLACE_RANKING_PATH = '/map/place-rankings';

export const PLACE_RANKING_DEFAULT_LIMIT = 20;
export const PLACE_RANKING_MAX_LIMIT = 50;
export const PLACE_RANKING_DEFAULT_PERIOD: PlaceRankingPeriod = 'WEEK';
export const PLACE_RANKING_DEFAULT_RADIUS_KM = 5;
export const PLACE_RANKING_MAX_RADIUS_KM = 50;

type CommonPlaceRankingRequest = {
  category?: string;
  limit?: number;
  page?: number;
  period?: PlaceRankingPeriod;
};

export type GetPlaceRankingsRequest = CommonPlaceRankingRequest & (
  | {
    latitude: number;
    longitude: number;
    radiusKm?: number;
    scope: Extract<PlaceRankingScope, 'LOCAL'>;
  }
  | { scope: Extract<PlaceRankingScope, 'NATIONAL'> }
);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const placeRankingApi = {
  getPlaceRankings: async (params: GetPlaceRankingsRequest): Promise<PlaceRankingPage> => {
    const { data } = await api.get<PlaceRankingPage>(PLACE_RANKING_PATH, {
      params: {
        limit: clamp(Math.trunc(params.limit ?? PLACE_RANKING_DEFAULT_LIMIT), 1, PLACE_RANKING_MAX_LIMIT),
        page: Math.max(Math.trunc(params.page ?? 1), 1),
        period: params.period ?? PLACE_RANKING_DEFAULT_PERIOD,
        scope: params.scope,
        ...(params.category ? { category: params.category } : {}),
        ...(params.scope === 'LOCAL' ? {
          latitude: params.latitude,
          longitude: params.longitude,
          radiusKm: clamp(
            params.radiusKm ?? PLACE_RANKING_DEFAULT_RADIUS_KM,
            0,
            PLACE_RANKING_MAX_RADIUS_KM
          ),
        } : {}),
      },
    });

    return data;
  },
};

export default placeRankingApi;
