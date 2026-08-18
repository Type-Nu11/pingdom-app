import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PLACE_RANKING_DEFAULT_LIMIT,
  PLACE_RANKING_DEFAULT_PERIOD,
  placeRankingApi,
  type GetPlaceRankingsRequest,
} from '../api/placeRankingApi';
import { normalizePlaceRankingCriteria, normalizePlaceRankingPeriod } from '../model/placeRanking';
import type {
  PlaceRankingItem,
  PlaceRankingPeriod,
  PlaceRankingScope,
} from '../model/placeRanking.types';

export const placeRankingQueryKeys = {
  all: ['place-rankings'] as const,
  list: (params: GetPlaceRankingsRequest) => [...placeRankingQueryKeys.all, params] as const,
  scope: (scope: PlaceRankingScope) => [...placeRankingQueryKeys.all, scope] as const,
};

export type UseMapPlaceRankingsParams = {
  category?: string;
  latitude?: number;
  limit?: number;
  longitude?: number;
  page?: number;
  period?: PlaceRankingPeriod;
  radiusKm?: number;
  scope: PlaceRankingScope;
};

const EMPTY_ITEMS: PlaceRankingItem[] = [];

export const useMapPlaceRankings = (params: UseMapPlaceRankingsParams) => {
  const hasCoordinates = Number.isFinite(params.latitude) && Number.isFinite(params.longitude);
  const request = useMemo<GetPlaceRankingsRequest>(() => {
    const common = {
      limit: params.limit ?? PLACE_RANKING_DEFAULT_LIMIT,
      page: params.page ?? 1,
      period: params.period ?? PLACE_RANKING_DEFAULT_PERIOD,
      ...(params.category ? { category: params.category } : {}),
    };

    if (params.scope === 'LOCAL') {
      return {
        ...common,
        latitude: params.latitude as number,
        longitude: params.longitude as number,
        scope: 'LOCAL',
        ...(params.radiusKm !== undefined ? { radiusKm: params.radiusKm } : {}),
      };
    }

    return { ...common, scope: 'NATIONAL' };
  }, [
    params.category,
    params.latitude,
    params.limit,
    params.longitude,
    params.page,
    params.period,
    params.radiusKm,
    params.scope,
  ]);

  // 우리 지역 랭킹은 좌표가 준비되기 전에 호출하면 서버가 400을 응답하는 계약이라 조회를 막는다.
  const enabled = params.scope === 'NATIONAL' || hasCoordinates;
  const rankingsQuery = useQuery({
    enabled,
    queryKey: placeRankingQueryKeys.list(request),
    queryFn: () => placeRankingApi.getPlaceRankings(request),
  });
  const data = rankingsQuery.data;
  const items = data?.items ?? EMPTY_ITEMS;

  return {
    appliedRadiusKm: data?.appliedRadiusKm ?? null,
    criteria: normalizePlaceRankingCriteria(data?.criteria),
    data,
    error: rankingsQuery.error,
    generatedAt: data?.generatedAt ?? null,
    hasNext: data?.hasNext ?? false,
    isEmpty: !rankingsQuery.isLoading && !rankingsQuery.isError && items.length === 0,
    isError: rankingsQuery.isError,
    isFetching: rankingsQuery.isFetching,
    isLoading: enabled && rankingsQuery.isLoading,
    items,
    period: normalizePlaceRankingPeriod(data?.period),
    periodEnd: data?.periodEnd ?? null,
    periodStart: data?.periodStart ?? null,
    radiusExpanded: data?.radiusExpanded ?? false,
    refetch: rankingsQuery.refetch,
    requestedRadiusKm: data?.requestedRadiusKm ?? null,
    totalCount: data?.totalCount ?? 0,
  };
};

export default useMapPlaceRankings;
