import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '../ApiError.ts';
import {
  createMapLinkConversionMutationOptions,
  createPlaceAutocompleteQueryOptions,
  createPlaceCardQueryOptions,
  createPlaceExplorationMediaQueryOptions,
  createPlaceListQueryOptions,
  createPlaceMapQueryOptions,
  createPlaceOperatingNoticesQueryOptions,
  createPlaceVerificationMediaQueryOptions,
  createPlaceVisitDecisionQueryOptions,
  createRecommendationExplanationQueryOptions,
  placeQueryKeys,
} from '../../../features/place-exploration/hooks/usePlaceExploration.ts';

test('place exploration query keys separate viewport, place resources, and recommendation requestId', () => {
  const viewportA = { west: 1, south: 2, east: 3, north: 4, zoom: 10 };
  const viewportB = { ...viewportA, zoom: 11 };

  assert.notDeepEqual(placeQueryKeys.map(viewportA), placeQueryKeys.map(viewportB));
  assert.notDeepEqual(placeQueryKeys.list({ keyword: 'cafe' }), placeQueryKeys.list({ keyword: 'food' }));
  assert.notDeepEqual(placeQueryKeys.autocomplete({ keyword: 'ca' }), placeQueryKeys.autocomplete({ keyword: 'caf' }));
  assert.notDeepEqual(placeQueryKeys.card(17), placeQueryKeys.visitDecision(17));
  assert.notDeepEqual(placeQueryKeys.operatingNotices(17), placeQueryKeys.verificationMedia(17));
  assert.notDeepEqual(
    placeQueryKeys.recommendationExplanation('request-a'),
    placeQueryKeys.recommendationExplanation('request-b'),
  );
  assert.deepEqual(placeQueryKeys.card(17).slice(0, 4), ['v2', 'places', 'entity', 17]);
});

test('all place query options forward identifiers and TanStack AbortSignal unchanged', async () => {
  const calls = [];
  const response = { value: true };
  const api = {
    getPlaces: async (params, signal) => { calls.push(['list', params, signal]); return response; },
    autocompletePlaces: async (params, signal) => { calls.push(['autocomplete', params, signal]); return response; },
    getMapViewport: async (params, signal) => { calls.push(['map', params, signal]); return response; },
    getPlaceCard: async (placeId, signal) => { calls.push(['card', placeId, signal]); return response; },
    getPlaceVisitDecision: async (placeId, signal) => { calls.push(['visit', placeId, signal]); return response; },
    getPlaceOperatingNotices: async (placeId, signal) => { calls.push(['notices', placeId, signal]); return response; },
    getPlaceExplorationMedia: async (id, signal) => { calls.push(['exploration-media', id, signal]); return response; },
    getPlaceVerificationMedia: async (id, signal) => { calls.push(['media', id, signal]); return response; },
    getRecommendationExplanation: async (requestId, signal) => { calls.push(['explanation', requestId, signal]); return response; },
  };
  const signal = new AbortController().signal;
  const viewport = { west: 1, south: 2, east: 3, north: 4, zoom: 10 };
  const options = [
    createPlaceListQueryOptions({ keyword: ' cafe ', latitude: 37.5, longitude: 127 }, api),
    createPlaceAutocompleteQueryOptions({ keyword: ' ca ', latitude: 37.5, longitude: 127 }, api),
    createPlaceMapQueryOptions(viewport, api),
    createPlaceCardQueryOptions(17, api),
    createPlaceVisitDecisionQueryOptions(17, api),
    createPlaceOperatingNoticesQueryOptions(17, api),
    createPlaceExplorationMediaQueryOptions(18, api),
    createPlaceVerificationMediaQueryOptions(18, api),
    createRecommendationExplanationQueryOptions('request-a', api),
  ];

  for (const option of options) {
    assert.equal(await option.queryFn({ signal }), response);
  }

  assert.deepEqual(calls.map(([name, identifier]) => [name, identifier]), [
    ['list', { page: 1, limit: 100, keyword: 'cafe', latitude: 37.5, longitude: 127 }],
    ['autocomplete', { keyword: 'ca', limit: 10, latitude: 37.5, longitude: 127 }],
    ['map', viewport],
    ['card', 17],
    ['visit', 17],
    ['notices', 17],
    ['exploration-media', 18],
    ['media', 18],
    ['explanation', 'request-a'],
  ]);
  assert.ok(calls.every(([, , receivedSignal]) => receivedSignal === signal));
});

test('shared card query key deduplicates concurrent card consumers', async () => {
  const queryClient = new QueryClient();
  let callCount = 0;
  const options = createPlaceCardQueryOptions(17, {
    getPlaceCard: async () => {
      callCount += 1;
      await Promise.resolve();
      return { id: 17 };
    },
  });

  const [first, second] = await Promise.all([
    queryClient.fetchQuery(options),
    queryClient.fetchQuery(options),
  ]);

  assert.equal(callCount, 1);
  assert.equal(first, second);
  assert.equal(queryClient.getQueryData(placeQueryKeys.card(17)), first);
});

test('map-link conversion forwards body and signal, preserves errors, and never auto-retries', async () => {
  const expectedError = new ApiError('conflict', {
    code: 'MAP_LINK_CONVERSION_CONFLICT',
    status: 409,
  });
  const signal = new AbortController().signal;
  let received;
  const options = createMapLinkConversionMutationOptions({
    recordMapLinkConversion: async (placeId, body, receivedSignal) => {
      received = { body, placeId, signal: receivedSignal };
      throw expectedError;
    },
  });
  const variables = {
    body: {
      linkType: 'EXTERNAL_MAP',
      provider: 'KAKAO',
      requestId: 'request-a',
    },
    placeId: 17,
    signal,
  };

  await assert.rejects(options.mutationFn(variables), (error) => error === expectedError);
  assert.deepEqual(received, { ...variables, signal });
  assert.equal(options.retry, false);
  assert.equal('onError' in options, false);
});
