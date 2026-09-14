import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createMapHomeFeedsApi } from '../../../features/map-home-feeds/api/mapHomeFeedsApi.ts';
import {
  createLocalHotQueryOptions,
  createNationalTrendsQueryOptions,
  mapHomeFeedQueryKeys,
} from '../../../features/map-home-feeds/hooks/useMapHomeFeeds.ts';
import {
  getLocalHotFeedStatus,
  getNationalTrendsFeedStatus,
  selectLocalHotParams,
  selectNationalTrendsParams,
  toRankedPlaceViewModels,
} from '../../../features/map-home-feeds/model/mapHomeFeeds.ts';
import { ApiError } from '../ApiError.ts';

const rankedPlaces = [
  {
    rank: 2,
    placeId: 20,
    placeName: '둘째',
    category: 'CAFE',
    imageUrl: 'https://example.com/20.jpg',
    address: '부산',
    bookmarkAdds: 5,
    bookmarkRemoves: 1,
    netBookmarkGrowth: 4,
    bookmarkCount: 30,
    bookmarked: false,
  },
  {
    rank: 1,
    placeId: 10,
    placeName: '첫째',
    category: 'POPUP',
    imageUrl: 'https://example.com/10.jpg',
    address: '서울',
    bookmarkAdds: 8,
    bookmarkRemoves: 2,
    netBookmarkGrowth: 6,
    bookmarkCount: 50,
    bookmarked: true,
  },
];

test('canonical map home feed snapshot preserves deployed media types, errors, and optional Item fields', async () => {
  const contract = JSON.parse(await readFile('docs/api/map-home-feeds.openapi.json', 'utf8'));
  const local = contract.paths['/places/local-hot'].get;
  const national = contract.paths['/places/trends'].get;

  assert.deepEqual(Object.keys(contract.paths).sort(), ['/places/local-hot', '/places/trends']);
  assert.deepEqual(local.security, [{ bearerAuth: [] }]);
  assert.deepEqual(national.security, [{ bearerAuth: [] }]);
  assert.deepEqual(Object.keys(local.responses).sort(), ['200', '400', '401', '403', '404', '502', '503']);
  assert.deepEqual(Object.keys(national.responses).sort(), ['200', '400', '401', '403']);
  assert.equal(local.responses['200'].content['*/*'].schema.$ref, '#/components/schemas/PlaceLocalHotResponse');
  assert.equal(local.responses['400'].content['*/*'].schema.$ref, '#/components/schemas/PlaceLocalHotResponse');
  assert.equal(national.responses['400'].content['*/*'].schema.$ref, '#/components/schemas/PlaceTrendResponse');
  assert.equal(local.responses['403'].content['application/json'].schema.$ref, '#/components/schemas/ErrorResponse');
  assert.equal(contract.components.schemas.Item.required, undefined);
  assert.equal(contract.components.schemas.Item.properties.latitude, undefined);
  assert.equal(contract.components.schemas.Item.properties.longitude, undefined);
  assert.deepEqual(contract.components.schemas.PlaceTrendResponse.properties.period.enum, ['WEEK']);
});

test('map home feed API uses independent live paths and forwards period, params, and signals', async () => {
  const calls = [];
  const client = {
    get: async (path, options) => {
      calls.push({ path, options });
      return { places: rankedPlaces };
    },
  };
  const api = createMapHomeFeedsApi(client);
  const signal = new AbortController().signal;

  await api.getLocalHot({ latitude: 37.5, longitude: 127, page: 1, limit: 20 }, signal);
  await api.getNationalTrends({ period: 'WEEK', page: 2, limit: 10 }, signal);

  assert.deepEqual(calls, [
    {
      path: '/places/local-hot',
      options: {
        params: { latitude: 37.5, longitude: 127, page: 1, limit: 20 },
        signal,
      },
    },
    {
      path: '/places/trends',
      options: { params: { period: 'WEEK', page: 2, limit: 10 }, signal },
    },
  ]);
});

test('local-hot accepts either a coordinate pair or one regionCode and rejects invalid combinations', () => {
  assert.deepEqual(selectLocalHotParams({ latitude: 37.5, longitude: 127 }), {
    latitude: 37.5,
    longitude: 127,
    page: 1,
    limit: 20,
  });
  assert.deepEqual(selectLocalHotParams({ regionCode: '11680', page: 2 }), {
    regionCode: '11680',
    page: 2,
    limit: 20,
  });
  assert.equal(selectLocalHotParams({ latitude: 37.5 }), null);
  assert.equal(selectLocalHotParams({ longitude: 127 }), null);
  assert.equal(selectLocalHotParams({ latitude: 91, longitude: 127 }), null);
  assert.equal(selectLocalHotParams({ latitude: 37.5, longitude: 181 }), null);
  assert.equal(selectLocalHotParams({ regionCode: '1168' }), null);
  assert.equal(selectLocalHotParams({ latitude: 37.5, longitude: 127, regionCode: '11680' }), null);
});

test('query keys isolate feed, location, region, page, and period while trends need no location', () => {
  assert.notDeepEqual(
    mapHomeFeedQueryKeys.localHot({ regionCode: '11680', page: 1, limit: 20 }),
    mapHomeFeedQueryKeys.localHot({ regionCode: '26440', page: 1, limit: 20 }),
  );
  assert.notDeepEqual(
    mapHomeFeedQueryKeys.localHot({ regionCode: '11680', page: 1, limit: 20 }),
    mapHomeFeedQueryKeys.localHot({ regionCode: '11680', page: 2, limit: 20 }),
  );
  assert.notDeepEqual(
    mapHomeFeedQueryKeys.localHot({ regionCode: '11680', page: 1, limit: 20 }),
    mapHomeFeedQueryKeys.nationalTrends({ period: 'WEEK', page: 1, limit: 20 }),
  );
  const national = createNationalTrendsQueryOptions();
  assert.deepEqual(national.queryKey, ['v2', 'places', 'trends', 'WEEK', 1, 20]);
  assert.equal(createLocalHotQueryOptions({ latitude: 37.5 }).enabled, false);
  assert.equal(createLocalHotQueryOptions({ latitude: 37.5, longitude: 127 }).enabled, true);
  assert.equal(createNationalTrendsQueryOptions({ page: 0 }).enabled, false);
  assert.equal(createNationalTrendsQueryOptions({ limit: 51 }).enabled, false);
  assert.equal(selectNationalTrendsParams({ period: 'DAY' }), null);
});

test('ranking presentation preserves server order and does not invent coordinates', () => {
  const result = toRankedPlaceViewModels(rankedPlaces);

  assert.deepEqual(result.map(({ placeId, rank }) => ({ placeId, rank })), [
    { placeId: 20, rank: 2 },
    { placeId: 10, rank: 1 },
  ]);
  assert.ok(result.every((place) => !('latitude' in place) && !('longitude' in place)));
});

test('local feed distinguishes location preparation, denial, regional failures, and retryable errors', () => {
  assert.equal(getLocalHotFeedStatus({ locationStatus: 'loading' }), 'location-pending');
  assert.equal(getLocalHotFeedStatus({ locationStatus: 'denied' }), 'location-denied');
  assert.equal(getLocalHotFeedStatus({ locationStatus: 'failed' }), 'invalid-location');
  assert.equal(getLocalHotFeedStatus({ locationStatus: 'granted', hasValidLocation: false }), 'invalid-location');
  assert.equal(getLocalHotFeedStatus({ locationStatus: 'granted', isLoading: true }), 'loading');
  assert.equal(getLocalHotFeedStatus({ locationStatus: 'granted', error: new ApiError('missing', { status: 404 }) }), 'region-not-found');
  assert.equal(getLocalHotFeedStatus({ locationStatus: 'granted', error: new ApiError('gateway', { status: 502 }) }), 'region-resolution-failed');
  assert.equal(getLocalHotFeedStatus({ locationStatus: 'granted', error: new ApiError('unavailable', { status: 503 }) }), 'region-service-unavailable');
  assert.equal(getLocalHotFeedStatus({ locationStatus: 'granted', error: new ApiError('auth', { status: 401 }) }), 'unauthorized');
  assert.equal(getLocalHotFeedStatus({ locationStatus: 'granted', placeCount: 0 }), 'empty');
  assert.equal(getLocalHotFeedStatus({ locationStatus: 'granted', placeCount: 2 }), 'ready');
});

test('national feed is independent of location and distinguishes contract failures', () => {
  assert.equal(getNationalTrendsFeedStatus({ enabled: false }), 'disabled');
  assert.equal(getNationalTrendsFeedStatus({ enabled: true, isLoading: true }), 'loading');
  assert.equal(getNationalTrendsFeedStatus({ enabled: true, error: new ApiError('period', { status: 400 }) }), 'invalid-period');
  assert.equal(getNationalTrendsFeedStatus({ enabled: true, error: new ApiError('auth', { status: 401 }) }), 'unauthorized');
  assert.equal(getNationalTrendsFeedStatus({ enabled: true, placeCount: 0 }), 'empty');
  assert.equal(getNationalTrendsFeedStatus({ enabled: true, placeCount: 1 }), 'ready');
});
