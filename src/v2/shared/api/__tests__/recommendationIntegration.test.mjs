import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';

import { claimRecommendationClick } from '../../../../features/place/model/recommendationClick.ts';
import { createRecommendationPresentation } from '../../../../features/place/model/recommendationPresentation.ts';
import { createCurrentActivityIntentApi } from '../../../features/current-activity-intent/api/currentActivityIntentApi.ts';
import {
  createCurrentActivityIntentQueryOptions,
  createReplaceCurrentActivityIntentMutationOptions,
  refreshCurrentActivityIntentCaches,
} from '../../../features/current-activity-intent/hooks/useCurrentActivityIntent.ts';
import { currentActivityIntentQueryKeys } from '../../../features/current-activity-intent/model/currentActivityIntentQueryKeys.ts';
import { recommendationQueryKeys } from '../../../features/travel-purposes/model/travelPurposeQueryKeys.ts';

test('recommendation presentation uses only applied context and radius expansion fields', () => {
  assert.deepEqual(createRecommendationPresentation({}), {
    contextText: null,
    limitText: null,
  });
  assert.deepEqual(createRecommendationPresentation({
    appliedActivityIntent: null,
    appliedTravelPurposes: [],
    appliedRadiusKm: 10,
    limitReasons: [],
    requestedRadiusKm: 5,
  }), {
    contextText: null,
    limitText: null,
  });
  assert.deepEqual(createRecommendationPresentation({
    appliedActivityIntent: 'CAFE',
    appliedTravelPurposes: ['K_POP', 'FOOD'],
    appliedRadiusKm: 10,
    limitReasons: ['RADIUS_EXPANDED'],
    requestedRadiusKm: 5,
  }), {
    contextText: 'K-POP · 맛집 · 카페 방문',
    limitText: '추천 결과를 찾기 위해 반경을 10km로 넓혔어요.',
  });
});

test('recommendation clicks are claimed once per request, version, and place', () => {
  const sent = new Set();
  const payload = { placeId: 17, recommendationVersion: 'place-rec-v2', requestId: 'request-a' };

  assert.equal(claimRecommendationClick(payload, sent), true);
  assert.equal(claimRecommendationClick(payload, sent), false);
  assert.equal(claimRecommendationClick({ ...payload, placeId: 18 }, sent), true);
  assert.equal(claimRecommendationClick({ ...payload, requestId: 'request-b' }, sent), true);
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
