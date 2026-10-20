import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';

import {
  configureApiAccessTokenProvider,
  configureApiTransport,
  createApiClient,
} from '../apiClient.ts';

test('configured app transport handles authenticated GET, PUT, and DELETE requests', async () => {
  const client = createApiClient();
  const calls = [];
  const transport = {
    delete: async (path, options) => {
      calls.push({ body: options.data, method: 'DELETE', options, path });
      return {
        data: path === '/users/me/oauth-accounts/google'
          ? { linked: false }
          : undefined,
      };
    },
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
    const getResult = await client.get('/users/me/travel-purposes');
    const putResult = await client.put(
      '/users/me/travel-purposes',
      { travelPurposes: ['K_POP'] },
    );
    const currentActivityIntentDeleteResult = await client.delete(
      '/users/me/current-activity-intent',
    );
    await client.delete('/firebase/fcm-tokens', { token: 'device-token' });
    const deleteResult = await client.delete(
      '/users/me/oauth-accounts/google',
      { currentPassword: 'password' },
    );

    assert.deepEqual(getResult, { travelPurposes: ['K_POP'] });
    assert.deepEqual(putResult, { travelPurposes: ['K_POP'] });
    assert.equal(currentActivityIntentDeleteResult, undefined);
    assert.deepEqual(deleteResult, { linked: false });
    assert.deepEqual(
      calls.map(({ method }) => method),
      ['GET', 'PUT', 'DELETE', 'DELETE', 'DELETE'],
    );
    assert.equal(calls[0].options.headers.Authorization, 'Bearer access-token');
    assert.equal(calls[1].options.headers.Authorization, 'Bearer access-token');
    assert.equal(calls[2].options.headers.Authorization, 'Bearer access-token');
    assert.equal(calls[3].options.headers.Authorization, 'Bearer access-token');
    assert.equal(calls[4].options.headers.Authorization, 'Bearer access-token');
    assert.equal(calls[2].body, undefined);
    assert.deepEqual(calls[3].body, { token: 'device-token' });
    assert.deepEqual(calls[4].body, { currentPassword: 'password' });
  } finally {
    resetTokenProvider();
    resetTransport();
  }
});

test('idempotent PUT falls back to fetch after an Android Axios network error', async () => {
  const client = createApiClient();
  const originalFetch = globalThis.fetch;
  const fetchCalls = [];
  const transport = {
    delete: async () => ({ data: undefined }),
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
    const result = await client.put(
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
