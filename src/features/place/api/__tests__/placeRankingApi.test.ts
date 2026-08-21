import { api } from '../../../../shared/api/apiClient';
import type { PlaceRankingPage } from '../../model/placeRanking.types';
import { placeRankingApi } from '../placeRankingApi';

const emptyPage: PlaceRankingPage = {
  criteria: 'POST_LIKE_COUNT',
  generatedAt: '2026-08-18T00:00:00Z',
  hasNext: false,
  items: [],
  limit: 20,
  page: 1,
  period: 'WEEK',
  periodEnd: '2026-08-18T00:00:00Z',
  periodStart: '2026-08-11T00:00:00Z',
  radiusExpanded: false,
  scope: 'LOCAL',
  totalCount: 0,
  totalPages: 0,
};

function mockGet() {
  return jest.spyOn(api, 'get').mockResolvedValue({ data: emptyPage } as never);
}

describe('placeRankingApi.getPlaceRankings', () => {
  test('우리 지역 요청은 좌표와 반경, 기본 기간을 함께 보낸다', async () => {
    const get = mockGet();

    await placeRankingApi.getPlaceRankings({
      latitude: 37.54,
      longitude: 127.05,
      scope: 'LOCAL',
    });

    expect(get).toHaveBeenCalledWith('/map/place-rankings', {
      params: {
        latitude: 37.54,
        limit: 20,
        longitude: 127.05,
        page: 1,
        period: 'WEEK',
        radiusKm: 5,
        scope: 'LOCAL',
      },
    });
  });

  test('전국 요청은 위치 parameter를 보내지 않는다', async () => {
    const get = mockGet();

    await placeRankingApi.getPlaceRankings({ period: 'DAY', scope: 'NATIONAL' });

    expect(get).toHaveBeenCalledWith('/map/place-rankings', {
      params: {
        limit: 20,
        page: 1,
        period: 'DAY',
        scope: 'NATIONAL',
      },
    });
  });

  test('category는 있을 때만 전달한다', async () => {
    const get = mockGet();

    await placeRankingApi.getPlaceRankings({ category: 'CAFE', scope: 'NATIONAL' });

    expect(get.mock.calls[0][1]).toEqual({
      params: {
        category: 'CAFE',
        limit: 20,
        page: 1,
        period: 'WEEK',
        scope: 'NATIONAL',
      },
    });
  });

  test('page와 limit은 계약 범위로 보정한다', async () => {
    const get = mockGet();

    await placeRankingApi.getPlaceRankings({ limit: 500, page: 0, scope: 'NATIONAL' });

    expect(get.mock.calls[0][1]).toEqual({
      params: { limit: 50, page: 1, period: 'WEEK', scope: 'NATIONAL' },
    });

    await placeRankingApi.getPlaceRankings({ limit: 0, page: -3, scope: 'NATIONAL' });

    expect(get.mock.calls[1][1]).toEqual({
      params: { limit: 1, page: 1, period: 'WEEK', scope: 'NATIONAL' },
    });
  });

  test('반경은 계약 최대값 50km로 보정한다', async () => {
    const get = mockGet();

    await placeRankingApi.getPlaceRankings({
      latitude: 37.54,
      longitude: 127.05,
      radiusKm: 120,
      scope: 'LOCAL',
    });

    expect(get.mock.calls[0][1]).toEqual({
      params: {
        latitude: 37.54,
        limit: 20,
        longitude: 127.05,
        page: 1,
        period: 'WEEK',
        radiusKm: 50,
        scope: 'LOCAL',
      },
    });
  });

  test('응답을 그대로 반환한다', async () => {
    mockGet();

    await expect(placeRankingApi.getPlaceRankings({ scope: 'NATIONAL' })).resolves.toEqual(emptyPage);
  });
});
