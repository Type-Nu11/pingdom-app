import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';

import { createCurrentActivityIntentApi } from '../../../features/current-activity-intent/api/currentActivityIntentApi.ts';
import {
  createClearCurrentActivityIntentMutationOptions,
  createCurrentActivityIntentQueryOptions,
  createReplaceCurrentActivityIntentMutationOptions,
  refreshCachesAfterCurrentActivityIntentClear,
  refreshCachesAfterCurrentActivityIntentReplace,
} from '../../../features/current-activity-intent/hooks/useCurrentActivityIntent.ts';
import {
  currentActivityIntentQueryKeys,
  recommendationQueryKeys,
} from '../../../features/current-activity-intent/model/currentActivityIntentQueryKeys.ts';

test('current activity intent API implements GET, PUT replace, and DELETE clear', async () => {
  const calls = [];
  const response = { expiresAt: '2026-08-11T14:00:00Z', intent: 'CAFE' };
  const client = {
    delete: async (path, requestBody, options) => {
      calls.push({ method: 'DELETE', options, path, requestBody });
    },
    get: async (path, options) => {
      calls.push({ method: 'GET', options, path });
      return response;
    },
    patch: async () => undefined,
    post: async () => undefined,
    put: async (path, body, options) => {
      calls.push({ body, method: 'PUT', options, path });
      return response;
    },
  };
  const api = createCurrentActivityIntentApi(client);
  const signal = new AbortController().signal;
  const body = { intent: 'CAFE' };

  assert.equal(await api.getCurrentActivityIntent(signal), response);
  assert.equal(await api.replaceCurrentActivityIntent(body, signal), response);
  assert.equal(await api.clearCurrentActivityIntent(signal), undefined);
  assert.deepEqual(calls.map(({ method, path }) => `${method} ${path}`), [
    'GET /users/me/current-activity-intent',
    'PUT /users/me/current-activity-intent',
    'DELETE /users/me/current-activity-intent',
  ]);
  assert.equal(calls[0].options.signal, signal);
  assert.equal(calls[1].body, body);
  assert.equal(calls[1].options.signal, signal);
  assert.equal(calls[2].options.signal, signal);
  assert.equal(calls[2].requestBody, undefined);
});

test('current activity intent Hook options preserve query key, AbortSignal, and bodies', async () => {
  const response = { expiresAt: null, intent: null };
  const body = { intent: 'EXPLORE' };
  const signal = new AbortController().signal;
  const received = [];

  const queryOptions = createCurrentActivityIntentQueryOptions({
    getCurrentActivityIntent: async (value) => {
      received.push(['get', value]);
      return response;
    },
  });
  const replaceOptions = createReplaceCurrentActivityIntentMutationOptions({
    replaceCurrentActivityIntent: async (value) => {
      received.push(['put', value]);
      return response;
    },
  });
  const clearOptions = createClearCurrentActivityIntentMutationOptions({
    clearCurrentActivityIntent: async () => {
      received.push(['delete']);
    },
  });

  assert.equal(await queryOptions.queryFn({ signal }), response);
  assert.equal(await replaceOptions.mutationFn(body), response);
  assert.equal(await clearOptions.mutationFn(), undefined);
  assert.deepEqual(queryOptions.queryKey, [
    'v2',
    'users',
    'me',
    'current-activity-intent',
  ]);
  assert.deepEqual(received, [
    ['get', signal],
    ['put', body],
    ['delete'],
  ]);
});

test('replace updates only its user cache and invalidates existing recommendation queries', async () => {
  const queryClient = new QueryClient();
  const response = { expiresAt: '2026-08-11T14:00:00Z', intent: 'NIGHTLIFE' };
  const unrelatedKey = ['v2', 'places'];

  queryClient.setQueryData(currentActivityIntentQueryKeys.mine(), {
    expiresAt: null,
    intent: null,
  });
  queryClient.setQueryData(recommendationQueryKeys.list({ latitude: 1, longitude: 2 }), {
    places: [],
  });
  queryClient.setQueryData(unrelatedKey, { places: [] });

  await refreshCachesAfterCurrentActivityIntentReplace(queryClient, response);

  assert.deepEqual(queryClient.getQueryData(currentActivityIntentQueryKeys.mine()), response);
  assert.equal(queryClient.getQueryState(currentActivityIntentQueryKeys.mine()).isInvalidated, false);
  assert.equal(
    queryClient.getQueryState(recommendationQueryKeys.list({ latitude: 1, longitude: 2 }))
      .isInvalidated,
    true,
  );
  assert.equal(queryClient.getQueryState(unrelatedKey).isInvalidated, false);
});

test('clear invalidates current intent and recommendations without synthesizing a DELETE body', async () => {
  const queryClient = new QueryClient();
  const recommendationKey = recommendationQueryKeys.list({ latitude: 1, longitude: 2 });

  queryClient.setQueryData(currentActivityIntentQueryKeys.mine(), {
    expiresAt: '2026-08-11T14:00:00Z',
    intent: 'CAFE',
  });
  queryClient.setQueryData(recommendationKey, { places: [] });

  await refreshCachesAfterCurrentActivityIntentClear(queryClient);

  assert.equal(queryClient.getQueryState(currentActivityIntentQueryKeys.mine()).isInvalidated, true);
  assert.equal(queryClient.getQueryState(recommendationKey).isInvalidated, true);
});
