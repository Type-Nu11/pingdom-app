import React, { type PropsWithChildren } from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { placeRankingApi } from '../../api/placeRankingApi';
import type { PlaceRankingPage, PlaceRankingScope } from '../../model/placeRanking.types';
import { placeRankingQueryKeys, useMapPlaceRankings } from '../useMapPlaceRankings';

function page(scope: PlaceRankingScope, placeId: number): PlaceRankingPage {
  return {
    criteria: 'POST_LIKE_COUNT',
    generatedAt: '2026-08-18T00:00:00Z',
    hasNext: false,
    items: [{
      imageSource: 'POST',
      imageUrl: null,
      latitude: 37.54,
      longitude: 127.05,
      placeId,
      placeName: `${scope} 장소`,
      rank: 1,
      score: 10,
      thumbnailUrl: null,
    }],
    limit: 20,
    page: 1,
    period: 'WEEK',
    periodEnd: '2026-08-18T00:00:00Z',
    periodStart: '2026-08-11T00:00:00Z',
    radiusExpanded: false,
    scope,
    totalCount: 1,
    totalPages: 1,
  };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity, retry: false } },
  });
  const wrapper = ({ children }: PropsWithChildren) => React.createElement(
    QueryClientProvider,
    { client: queryClient },
    children,
  );
  return { queryClient, wrapper };
}

describe('useMapPlaceRankings', () => {
  test('우리 지역은 좌표가 준비된 뒤에만 조회한다', async () => {
    const getPlaceRankings = jest.spyOn(placeRankingApi, 'getPlaceRankings');
    const { wrapper } = createWrapper();

    const { result } = await renderHook(() => useMapPlaceRankings({ scope: 'LOCAL' }), { wrapper });

    expect(getPlaceRankings).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  test('전국은 좌표 없이 조회한다', async () => {
    jest.spyOn(placeRankingApi, 'getPlaceRankings').mockResolvedValue(page('NATIONAL', 22));
    const { wrapper } = createWrapper();

    const { result } = await renderHook(() => useMapPlaceRankings({ scope: 'NATIONAL' }), { wrapper });

    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(placeRankingApi.getPlaceRankings).toHaveBeenCalledWith({
      limit: 20,
      page: 1,
      period: 'WEEK',
      scope: 'NATIONAL',
    });
  });

  test('두 목록은 서로 다른 cache key를 사용한다', async () => {
    jest.spyOn(placeRankingApi, 'getPlaceRankings').mockImplementation(async (params) => (
      page(params.scope, params.scope === 'LOCAL' ? 11 : 22)
    ));
    const { wrapper } = createWrapper();

    const local = await renderHook(() => useMapPlaceRankings({
      latitude: 37.54,
      longitude: 127.05,
      scope: 'LOCAL',
    }), { wrapper });
    const national = await renderHook(() => useMapPlaceRankings({ scope: 'NATIONAL' }), { wrapper });

    await waitFor(() => expect(local.result.current.items).toHaveLength(1));
    await waitFor(() => expect(national.result.current.items).toHaveLength(1));

    expect(local.result.current.items[0].placeId).toBe(11);
    expect(national.result.current.items[0].placeId).toBe(22);
    expect(placeRankingQueryKeys.list({
      latitude: 37.54,
      limit: 20,
      longitude: 127.05,
      page: 1,
      period: 'WEEK',
      scope: 'LOCAL',
    })).not.toEqual(placeRankingQueryKeys.list({
      limit: 20,
      page: 1,
      period: 'WEEK',
      scope: 'NATIONAL',
    }));
  });

  test('반경 확장 여부와 집계 메타를 그대로 노출한다', async () => {
    jest.spyOn(placeRankingApi, 'getPlaceRankings').mockResolvedValue({
      ...page('LOCAL', 11),
      appliedRadiusKm: 20,
      radiusExpanded: true,
      requestedRadiusKm: 5,
    });
    const { wrapper } = createWrapper();

    const { result } = await renderHook(() => useMapPlaceRankings({
      latitude: 37.54,
      longitude: 127.05,
      scope: 'LOCAL',
    }), { wrapper });

    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.appliedRadiusKm).toBe(20);
    expect(result.current.radiusExpanded).toBe(true);
    expect(result.current.criteria).toBe('POST_LIKE_COUNT');
    expect(result.current.periodStart).toBe('2026-08-11T00:00:00Z');
  });

  test('알 수 없는 criteria는 null로 노출하고 목록은 유지한다', async () => {
    jest.spyOn(placeRankingApi, 'getPlaceRankings').mockResolvedValue({
      ...page('NATIONAL', 22),
      criteria: 'SOMETHING_NEW' as never,
    });
    const { wrapper } = createWrapper();

    const { result } = await renderHook(() => useMapPlaceRankings({ scope: 'NATIONAL' }), { wrapper });

    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.criteria).toBeNull();
  });

  test('enabled=false면 수동 실행 전까지 조회하지 않는다', async () => {
    const getPlaceRankings = jest.spyOn(placeRankingApi, 'getPlaceRankings')
      .mockResolvedValue(page('NATIONAL', 22));
    const { wrapper } = createWrapper();

    const { result } = await renderHook(
      () => useMapPlaceRankings({ scope: 'NATIONAL' }, { enabled: false }),
      { wrapper },
    );

    expect(getPlaceRankings).not.toHaveBeenCalled();

    await result.current.refetch();

    await waitFor(() => expect(getPlaceRankings).toHaveBeenCalledTimes(1));
  });

  test('빈 결과는 빈 배열과 isEmpty로 노출한다', async () => {
    jest.spyOn(placeRankingApi, 'getPlaceRankings').mockResolvedValue({
      ...page('NATIONAL', 22),
      hasNext: false,
      items: [],
      totalCount: 0,
      totalPages: 0,
    });
    const { wrapper } = createWrapper();

    const { result } = await renderHook(() => useMapPlaceRankings({ scope: 'NATIONAL' }), { wrapper });

    await waitFor(() => expect(result.current.isEmpty).toBe(true));
    expect(result.current.items).toEqual([]);
  });
});
