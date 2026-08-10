import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';

import {
  apiClient,
  configureApiAccessTokenProvider,
  configureApiTransport,
} from '../apiClient.ts';

test('configured app transport handles authenticated GET and PUT requests', async () => {
  const calls = [];
  const transport = {
    get: async (path, options) => {
      calls.push({ method: 'GET', options, path });
      return { data: { travelPurposes: ['K_POP'] } };
    },
    patch: async () => ({ data: undefined }),
    post: async () => ({ data: undefined }),
    put: async (path, body, options) => {
      calls.push({ body, method: 'PUT', options, path });
      return { data: body };
    },
  };
  const resetTransport = configureApiTransport(transport);
  const resetTokenProvider = configureApiAccessTokenProvider(() => 'access-token');

  try {
    const getResult = await apiClient.get('/users/me/travel-purposes');
    const putResult = await apiClient.put(
      '/users/me/travel-purposes',
      { travelPurposes: ['K_POP'] },
    );

    assert.deepEqual(getResult, { travelPurposes: ['K_POP'] });
    assert.deepEqual(putResult, { travelPurposes: ['K_POP'] });
    assert.deepEqual(calls.map(({ method }) => method), ['GET', 'PUT']);
    assert.equal(calls[0].options.headers.Authorization, 'Bearer access-token');
    assert.equal(calls[1].options.headers.Authorization, 'Bearer access-token');
  } finally {
    resetTokenProvider();
    resetTransport();
  }
});

test('idempotent PUT falls back to fetch after an Android Axios network error', async () => {
  const originalFetch = globalThis.fetch;
  const fetchCalls = [];
  const transport = {
    get: async () => ({ data: undefined }),
    patch: async () => ({ data: undefined }),
    post: async () => ({ data: undefined }),
    put: async () => {
      throw new axios.AxiosError('Network Error', 'ERR_NETWORK');
    },
  };
  const resetTransport = configureApiTransport(transport);
  const resetTokenProvider = configureApiAccessTokenProvider(() => 'access-token');
  globalThis.fetch = async (url, options) => {
    fetchCalls.push({ options, url });
    return new Response('{"travelPurposes":["K_POP"]}', {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  };

  try {
    const result = await apiClient.put(
      '/users/me/travel-purposes',
      { travelPurposes: ['K_POP'] },
    );

    assert.deepEqual(result, { travelPurposes: ['K_POP'] });
    assert.equal(fetchCalls.length, 1);
    assert.match(fetchCalls[0].url, /\/users\/me\/travel-purposes$/);
    assert.equal(fetchCalls[0].options.method, 'PUT');
    assert.equal(fetchCalls[0].options.headers.Authorization, 'Bearer access-token');
    assert.equal(fetchCalls[0].options.headers.Accept, 'application/json');
    assert.equal(
      fetchCalls[0].options.headers['Content-Type'],
      'application/json; charset=utf-8',
    );
    assert.equal(fetchCalls[0].options.body, '{"travelPurposes":["K_POP"]}');
  } finally {
    globalThis.fetch = originalFetch;
    resetTokenProvider();
    resetTransport();
  }
});
