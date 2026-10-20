import { useQuery } from '@tanstack/react-query';
import { mapHomeFeedsApi } from '../api/mapHomeFeedsApi';
import { selectLocalHotParams, selectNationalTrendsParams } from '../model/mapHomeFeeds';
import type { LocalHotRequest, NationalTrendsRequest } from '../model/mapHomeFeeds.types';

type MapHomeFeedsApi = typeof mapHomeFeedsApi;

export const mapHomeFeedQueryKeys = {
  all: ['v2', 'places'] as const,
  localHotRoot: () => [...mapHomeFeedQueryKeys.all, 'local-hot'] as const,
  localHot: (params: NonNullable<ReturnType<typeof selectLocalHotParams>>) => [
    ...mapHomeFeedQueryKeys.localHotRoot(),
    'regionCode' in params
      ? params.regionCode
      : `${params.latitude},${params.longitude}`,
    params.page,
    params.limit,
  ] as const,
  nationalTrendsRoot: () => [...mapHomeFeedQueryKeys.all, 'trends'] as const,
  nationalTrends: (params: NonNullable<ReturnType<typeof selectNationalTrendsParams>>) => [
    ...mapHomeFeedQueryKeys.nationalTrendsRoot(),
    params.period,
    params.page,
    params.limit,
  ] as const,
};

export function createLocalHotQueryOptions(
  request: LocalHotRequest,
  api: Pick<MapHomeFeedsApi, 'getLocalHot'> = mapHomeFeedsApi,
) {
  const params = selectLocalHotParams(request);
  return {
    enabled: params !== null,
    queryFn: ({ signal }: { signal?: AbortSignal }) => {
      if (!params) throw new Error('Local hot query requires valid coordinates or regionCode.');
      return api.getLocalHot(params, signal);
    },
    queryKey: params
      ? mapHomeFeedQueryKeys.localHot(params)
      : [...mapHomeFeedQueryKeys.localHotRoot(), 'disabled'] as const,
    staleTime: 30_000,
  };
}

export function createNationalTrendsQueryOptions(
  request: NationalTrendsRequest = {},
  api: Pick<MapHomeFeedsApi, 'getNationalTrends'> = mapHomeFeedsApi,
) {
  const params = selectNationalTrendsParams(request);
  return {
    enabled: params !== null,
    queryFn: ({ signal }: { signal?: AbortSignal }) => {
      if (!params) throw new Error('National trends query requires WEEK and valid pagination.');
      return api.getNationalTrends(params, signal);
    },
    queryKey: params
      ? mapHomeFeedQueryKeys.nationalTrends(params)
      : [...mapHomeFeedQueryKeys.nationalTrendsRoot(), 'disabled'] as const,
    staleTime: 30_000,
  };
}

export function useLocalHotPlaces(request: LocalHotRequest, enabled = true) {
  const options = createLocalHotQueryOptions(request);
  return useQuery({ ...options, enabled: enabled && options.enabled });
}

export function useNationalTrends(enabled = true, request: NationalTrendsRequest = {}) {
  const options = createNationalTrendsQueryOptions(request);
  return useQuery({ ...options, enabled: enabled && options.enabled });
}
