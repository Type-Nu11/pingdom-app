import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import axios from 'axios';

import {
  apiClient,
  configureApiAccessTokenProvider,
  configureApiTransport,
  createApiClient,
} from '../apiClient.ts';
import { CLIENT_TYPE_APP, CLIENT_TYPE_HEADER, withClientTypeHeader } from '../clientType.ts';

function clientTypeOf(headers) {
  const entries = Object.entries(headers ?? {})
    .filter(([key]) => key.toLowerCase() === CLIENT_TYPE_HEADER.toLowerCase());
  assert.equal(entries.length, 1, `expected exactly one ${CLIENT_TYPE_HEADER} header`);
  return entries[0][1];
}

function recordingTransport(overrides = {}) {
  const calls = [];
  const transport = {
    delete: async (path, options) => {
      calls.push({ method: 'DELETE', options, path });
      return { data: 'deleted' };
    },
    get: async (path, options) => {
      calls.push({ method: 'GET', options, path });
      return { data: 'got' };
    },
    patch: async (path, body, options) => {
      calls.push({ body, method: 'PATCH', options, path });
      return { data: 'patched' };
    },
    post: async (path, body, options) => {
      calls.push({ body, method: 'POST', options, path });
      return { data: 'posted' };
    },
    put: async (path, body, options) => {
      calls.push({ body, method: 'PUT', options, path });
      return { data: 'put' };
    },
    ...overrides,
  };
  return { calls, transport };
}

test('header constant is exactly X-Client-Type: App', () => {
  assert.equal(CLIENT_TYPE_HEADER, 'X-Client-Type');
  assert.equal(CLIENT_TYPE_APP, 'App');
  assert.deepEqual(
    withClientTypeHeader({ Accept: 'application/json', 'x-client-type': 'Web' }),
    { Accept: 'application/json', 'X-Client-Type': 'App' },
  );
  assert.deepEqual(withClientTypeHeader(), { 'X-Client-Type': 'App' });
});

for (const withToken of [true, false]) {
  test(`GET/POST/PUT/PATCH/DELETE send X-Client-Type: App (${withToken ? 'authenticated' : 'anonymous'})`, async () => {
    const { calls, transport } = recordingTransport();
    const resetTransport = configureApiTransport(transport);
    const resetToken = configureApiAccessTokenProvider(() => (withToken ? 'access-token' : null));
    const client = createApiClient();
    const signal = new AbortController().signal;

    try {
      assert.equal(await client.get('/users/me', { params: { page: 1 }, signal }), 'got');
      assert.equal(await client.post('/auth/login', { username: 'u' }, { signal }), 'posted');
      assert.equal(await client.put('/users/me/travel-purposes', { a: 1 }, { signal }), 'put');
      assert.equal(await client.patch('/users/me', { b: 2 }, { signal }), 'patched');
      assert.equal(await client.delete('/users/me/current-activity-intent', undefined, { signal }), 'deleted');

      assert.deepEqual(calls.map(({ method }) => method), ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
      for (const call of calls) {
        assert.equal(clientTypeOf(call.options.headers), 'App', call.method);
        assert.equal(call.options.signal, signal, `${call.method} keeps abort signal`);
        assert.equal(
          call.options.headers.Authorization,
          withToken ? 'Bearer access-token' : undefined,
          `${call.method} Authorization unchanged`,
        );
      }
      assert.deepEqual(calls[0].options.params, { page: 1 });
    } finally {
      resetToken();
      resetTransport();
    }
  });
}

test('caller headers are merged but cannot override X-Client-Type', async () => {
  const { calls, transport } = recordingTransport();
  const resetToken = configureApiAccessTokenProvider(() => 'access-token');
  const client = createApiClient(transport);
  const headers = { 'X-Client-Type': 'Web', 'x-client-type': 'Browser', 'X-Trace': 'trace-1' };

  try {
    await client.get('/users/me', { headers });
    await client.post('/reviews', { a: 1 }, { headers });
    await client.put('/users/me', { a: 1 }, { headers });
    await client.patch('/users/me', { a: 1 }, { headers });
    await client.delete('/users/me', undefined, { headers });

    for (const call of calls) {
      assert.equal(clientTypeOf(call.options.headers), 'App', call.method);
      assert.equal(call.options.headers['X-Trace'], 'trace-1', call.method);
      assert.equal(call.options.headers.Authorization, 'Bearer access-token', call.method);
    }
    assert.deepEqual(headers, { 'X-Client-Type': 'Web', 'x-client-type': 'Browser', 'X-Trace': 'trace-1' });
  } finally {
    resetToken();
  }
});

test('multipart POST keeps client type alongside the multipart content type', async () => {
  const { calls, transport } = recordingTransport();
  const client = createApiClient(transport);
  const form = new FormData();
  form.append('file', 'x');

  await client.post('/reviews/media', form, {
    headers: { 'Content-Type': 'multipart/form-data', 'X-Client-Type': 'Web' },
  });

  assert.equal(clientTypeOf(calls[0].options.headers), 'App');
  assert.equal(calls[0].options.headers['Content-Type'], 'multipart/form-data');
});

test('default axios transport sends X-Client-Type with existing timeout and credentials', async () => {
  const seen = [];
  const resetToken = configureApiAccessTokenProvider(() => 'access-token');
  const client = createApiClient();
  const adapter = async (config) => {
    seen.push(config);
    return { config, data: { ok: true }, headers: {}, status: 200, statusText: 'OK' };
  };

  try {
    assert.deepEqual(
      await client.get('/users/me', { adapter, headers: { 'x-client-type': 'Web' } }),
      { ok: true },
    );
    assert.equal(seen[0].headers.get('X-Client-Type'), 'App');
    assert.equal(seen[0].headers.get('Authorization'), 'Bearer access-token');
    assert.equal(seen[0].headers.get('Accept'), 'application/json');
    assert.equal(seen[0].timeout, 10_000);
    assert.equal(seen[0].withCredentials, true);
  } finally {
    resetToken();
  }
});

test('PUT fetch fallback sends X-Client-Type: App and keeps headers', async () => {
  const originalFetch = globalThis.fetch;
  const fetchCalls = [];
  const { transport } = recordingTransport({
    put: async () => {
      throw new axios.AxiosError('Network Error', 'ERR_NETWORK');
    },
  });
  const resetToken = configureApiAccessTokenProvider(() => 'access-token');
  const client = createApiClient(transport);
  globalThis.fetch = async (url, options) => {
    fetchCalls.push({ options, url });
    return new Response('{"ok":true}', { status: 200 });
  };

  try {
    assert.deepEqual(
      await client.put('/users/me/travel-purposes', { a: 1 }, { headers: { 'X-Client-Type': 'Web' } }),
      { ok: true },
    );
    assert.equal(fetchCalls.length, 1);
    assert.equal(fetchCalls[0].url, 'http://127.0.0.1/api/v1/users/me/travel-purposes');
    assert.equal(clientTypeOf(fetchCalls[0].options.headers), 'App');
    assert.equal(fetchCalls[0].options.headers.Authorization, 'Bearer access-token');
    assert.equal(fetchCalls[0].options.headers['Content-Type'], 'application/json; charset=utf-8');
  } finally {
    globalThis.fetch = originalFetch;
    resetToken();
  }
});

test('PUT fetch fallback keeps caller abort and timeout behavior', async (t) => {
  const originalFetch = globalThis.fetch;
  const fetchSignals = [];
  const { transport } = recordingTransport({
    put: async () => {
      throw new axios.AxiosError('Network Error', 'ERR_NETWORK');
    },
  });
  const client = createApiClient(transport);
  globalThis.fetch = (_url, options) => new Promise((_resolve, reject) => {
    fetchSignals.push(options);
    options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  });
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const caller = new AbortController();
  const aborted = client.put('/users/me', { a: 1 }, { signal: caller.signal });
  await new Promise((resolve) => setImmediate(resolve));
  caller.abort();
  await assert.rejects(aborted, (error) => error.code !== 'REQUEST_TIMEOUT');
  assert.equal(clientTypeOf(fetchSignals[0].headers), 'App');

  mock.timers.enable({ apis: ['setTimeout'] });
  t.after(() => mock.timers.reset());
  const timedOut = client.put('/users/me', { a: 1 });
  await new Promise((resolve) => setImmediate(resolve));
  mock.timers.tick(10_000);
  await assert.rejects(timedOut, { code: 'REQUEST_TIMEOUT' });
  assert.equal(clientTypeOf(fetchSignals[1].headers), 'App');
});

test('non-network PUT failures do not fall back and keep ApiError mapping', async () => {
  const originalFetch = globalThis.fetch;
  let fetchCount = 0;
  const { transport } = recordingTransport({
    put: async () => {
      throw new axios.AxiosError('Bad Request', 'ERR_BAD_REQUEST', undefined, undefined, {
        config: {}, data: { code: 'INVALID' }, headers: {}, status: 400, statusText: 'Bad Request',
      });
    },
  });
  globalThis.fetch = async () => {
    fetchCount += 1;
    return new Response('{}');
  };

  try {
    await assert.rejects(createApiClient(transport).put('/users/me', {}), { status: 400 });
    assert.equal(fetchCount, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('mock mode client never touches the network transport', async () => {
  const originalFetch = globalThis.fetch;
  let fetchCount = 0;
  const { calls, transport } = recordingTransport();
  const resetTransport = configureApiTransport(transport);
  globalThis.fetch = async () => {
    fetchCount += 1;
    return new Response('{}');
  };

  try {
    await apiClient.get('/__unknown-mock-route__').catch(() => undefined);
    assert.equal(calls.length, 0);
    assert.equal(fetchCount, 0);
  } finally {
    globalThis.fetch = originalFetch;
    resetTransport();
  }
});

test('absolute URLs are rejected before any transport sees Pingdom headers', async () => {
  const { calls, transport } = recordingTransport();
  const client = createApiClient(transport);

  await assert.rejects(client.get('https://api.frankfurter.dev/v2/rate/KRW/USD'));
  await assert.rejects(client.get('//dapi.kakao.com/v2/local'));
  assert.equal(calls.length, 0);
});
