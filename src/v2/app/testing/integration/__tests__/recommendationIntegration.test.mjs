import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';

import {
  claimRecommendationClick,
  recordRecommendationClickOnce,
} from '../../../../modules/place/exploration/presentation/index.ts';
import * as recommendationClick from '../../../../modules/place/exploration/presentation/index.ts';
import {
  createRecommendationPresentation,
  getRecommendationState,
} from '../../../../modules/place/exploration/presentation/index.ts';
import { createCurrentActivityIntentApi } from '../../../../features/current-activity-intent/data/index.ts';
import {
  createCurrentActivityIntentQueryOptions,
  createReplaceCurrentActivityIntentMutationOptions,
  refreshCurrentActivityIntentCaches,
} from '../../../../features/current-activity-intent/data/index.ts';
import { currentActivityIntentQueryKeys } from '../../../../features/current-activity-intent/data/index.ts';
import { recommendationQueryKeys } from '../../../../features/travel-purposes/data/index.ts';
import {
  createPlaceRecommendationsQueryOptions,
  createRecommendationExplanationQueryOptions,
  placeQueryKeys,
} from '../../../../modules/place/exploration/index.ts';
import { resources } from '../../../../shared/i18n/resources.ts';

const readTranslation = (key) => key.split('.').reduce(
  (value, part) => value?.[part], resources.ko.translation,
);

test('recommendation presentation uses only applied personalization and limit reasons', () => {
  assert.deepEqual(createRecommendationPresentation({}, readTranslation), {
    contextText: null,
    limitText: null,
  });
  assert.deepEqual(createRecommendationPresentation({
    appliedActivityIntent: null,
    appliedTravelPurposes: [],
    appliedRadiusKm: 10,
    limitReasons: [],
    requestedRadiusKm: 5,
  }, readTranslation), {
    contextText: null,
    limitText: null,
  });
  assert.deepEqual(createRecommendationPresentation({
    appliedActivityIntent: 'CAFE',
    appliedTravelPurposes: ['K_POP', 'FOOD'],
    appliedRadiusKm: 10,
    limitReasons: ['RADIUS_EXPANDED'],
    requestedRadiusKm: 5,
  }, readTranslation), {
    contextText: 'K-POP · 맛집 · 카페 방문',
    limitText: '추천 결과를 찾기 위해 검색 반경을 넓혔어요.',
  });
});

test('recommendation presentation describes only limit reasons returned by the server', () => {
  assert.deepEqual(createRecommendationPresentation({
    appliedRadiusKm: null,
    limitReasons: ['FALLBACK_CANDIDATE_POOL', 'REQUEST_LIMIT_CLAMPED'],
    requestedRadiusKm: undefined,
  }, readTranslation), {
    contextText: null,
    limitText: '조건에 맞는 장소가 적어 후보 범위를 넓혀 추천했어요. 서버 기준에 맞춰 추천 개수를 조정했어요.',
  });
  assert.deepEqual(createRecommendationPresentation({
    appliedRadiusKm: null,
    limitReasons: ['RADIUS_EXPANDED'],
    requestedRadiusKm: null,
  }, readTranslation), {
    contextText: null,
    limitText: '추천 결과를 찾기 위해 검색 반경을 넓혔어요.',
  });
});

test('recommendation state covers loading, error, empty, and ready results', () => {
  assert.equal(getRecommendationState({ isError: false, isLoading: true, places: [] }), 'loading');
  assert.equal(getRecommendationState({ isError: true, isLoading: false, places: [] }), 'error');
  assert.equal(getRecommendationState({ isError: false, isLoading: false, places: [] }), 'empty');
  assert.equal(getRecommendationState({ isError: false, isLoading: false, places: [{ id: 1 }] }), 'ready');
});

test('recommendation clicks are claimed once per request, version, and place', () => {
  const sent = new Set();
  const payload = { placeId: 17, recommendationVersion: 'place-rec-v2', requestId: 'request-a' };

  assert.equal(claimRecommendationClick(payload, sent), true);
  assert.equal(claimRecommendationClick(payload, sent), false);
  assert.equal(claimRecommendationClick({ ...payload, placeId: 18 }, sent), true);
  assert.equal(claimRecommendationClick({ ...payload, requestId: 'request-b' }, sent), true);
});

test('failed recommendation clicks release their claim and can be retried', async () => {
  const sent = new Set();
  const payload = { placeId: 17, recommendationVersion: 'place-rec-v2', requestId: 'request-a' };
  let attempts = 0;
  const send = async () => {
    attempts += 1;
    if (attempts === 1) throw new Error('temporary network error');
    return { recorded: true };
  };

  await assert.rejects(recordRecommendationClickOnce(payload, sent, send));
  assert.deepEqual(await recordRecommendationClickOnce(payload, sent, send), { recorded: true });
  assert.equal(await recordRecommendationClickOnce(payload, sent, send), undefined);
  assert.equal(attempts, 2);
});

test('click payload keeps the current response identifiers after card reordering', () => {
  const input = {
    placeId: 22,
    recommendationPlaceIds: [11, 22],
    recommendationRequestId: 'request-a',
    recommendationVersion: 'place-rec-v2',
  };

  assert.deepEqual(recommendationClick.selectRecommendationClickPayload?.(input), {
    placeId: 22,
    recommendationVersion: 'place-rec-v2',
    requestId: 'request-a',
  });
  assert.deepEqual(recommendationClick.selectRecommendationClickPayload?.({
    ...input,
    recommendationPlaceIds: [22, 11],
  }), {
    placeId: 22,
    recommendationVersion: 'place-rec-v2',
    requestId: 'request-a',
  });
  assert.equal(recommendationClick.selectRecommendationClickPayload?.({
    ...input,
    placeId: 99,
  }), null);
});

test('explanation 404 leaves recommendation data and click tracking independently usable', async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const listOptions = createPlaceRecommendationsQueryOptions(
    { latitude: 37.5, longitude: 127 },
    { getRecommendations: async () => ({
      places: [{ id: 17, reasonCode: 'NEARBY' }],
      recommendationRequestId: 'request-a',
      recommendationVersion: 'place-rec-v2',
    }) },
  );
  const explanationOptions = createRecommendationExplanationQueryOptions(
    'request-a',
    { getRecommendationExplanation: async () => {
      throw Object.assign(new Error('not found'), { status: 404 });
    } },
  );

  const recommendations = await queryClient.fetchQuery(listOptions);
  await assert.rejects(queryClient.fetchQuery(explanationOptions));
  assert.equal(
    queryClient.getQueryData(placeQueryKeys.recommendationList({
      latitude: 37.5,
      limit: 10,
      longitude: 127,
      radiusKm: 5,
    })),
    recommendations,
  );

  const sent = [];
  await recordRecommendationClickOnce(
    { placeId: 17, recommendationVersion: 'place-rec-v2', requestId: 'request-a' },
    new Set(),
    async (payload) => { sent.push(payload); },
  );
  assert.deepEqual(sent, [{
    placeId: 17,
    recommendationVersion: 'place-rec-v2',
    requestId: 'request-a',
  }]);
});

test('current activity intent API preserves endpoint, nullable response, body, and signal', async () => {
  const calls = [];
  const response = { expiresAt: null, intent: null };
  const client = {
    delete: async (path, body, options) => { calls.push(['delete', path, body, options]); },
    get: async (path, options) => { calls.push(['get', path, options]); return response; },
    put: async (path, body, options) => { calls.push(['put', path, body, options]); return response; },
  };
  const api = createCurrentActivityIntentApi(client);
  const signal = new AbortController().signal;
  const body = { intent: 'EXPLORE' };

  assert.equal(await api.getCurrentActivityIntent(signal), response);
  assert.equal(await api.replaceCurrentActivityIntent(body, signal), response);
  await api.clearCurrentActivityIntent(signal);
  assert.deepEqual(calls.map((call) => call.slice(0, 2)), [
    ['get', '/users/me/current-activity-intent'],
    ['put', '/users/me/current-activity-intent'],
    ['delete', '/users/me/current-activity-intent'],
  ]);
  assert.equal(calls[1][2], body);
  assert.equal(calls[0][2].signal, signal);
  assert.equal(calls[2][3].signal, signal);
});

test('activity intent options and successful changes invalidate recommendation queries', async () => {
  const response = { intent: 'SHOP', expiresAt: '2026-08-13T12:00:00Z' };
  const body = { intent: 'SHOP' };
  const queryOptions = createCurrentActivityIntentQueryOptions({
    getCurrentActivityIntent: async () => response,
  });
  const mutationOptions = createReplaceCurrentActivityIntentMutationOptions({
    replaceCurrentActivityIntent: async (value) => value === body ? response : null,
  });
  const queryClient = new QueryClient();
  queryClient.setQueryData(recommendationQueryKeys.all, { places: [] });

  assert.equal(await queryOptions.queryFn({}), response);
  assert.equal(await mutationOptions.mutationFn(body), response);
  assert.deepEqual(queryOptions.queryKey, ['v2', 'users', 'me', 'current-activity-intent']);
  await refreshCurrentActivityIntentCaches(queryClient, response);
  assert.equal(queryClient.getQueryData(currentActivityIntentQueryKeys.mine()), response);
  assert.equal(queryClient.getQueryState(recommendationQueryKeys.all).isInvalidated, true);
});
