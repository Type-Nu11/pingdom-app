import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ApiError,
  configureApiTransport,
  createApiClient,
} from '../index.ts';

test('shared client unwraps responses and forwards bodies and abort signals unchanged', async () => {
  const calls = [];
  const responseBody = { acceptedAt: '2026-08-10T00:00:00Z', results: [] };
  const transport = {
    get: async () => ({ data: responseBody }),
    patch: async () => ({ data: responseBody }),
    post: async (path, body, options) => {
      calls.push({ body, options, path });
      return { data: responseBody };
    },
  };
  const client = createApiClient(transport);
  const body = { events: [{ eventId: 'stable-id' }] };
  const signal = new AbortController().signal;

  assert.equal(await client.post('/conversion-events/batch', body, { signal }), responseBody);
  assert.deepEqual(calls, [{ body, options: { signal }, path: '/conversion-events/batch' }]);
});

test('shared client preserves request content type for multipart bodies', async () => {
  const calls = [];
  const transport = {
    get: async () => ({ data: null }),
    patch: async () => ({ data: null }),
    post: async (path, body, options) => {
      calls.push({ body, options, path });
      return { data: { profileImageUrl: 'https://cdn.example.com/profile.jpg' } };
    },
  };
  const client = createApiClient(transport);
  const body = new FormData();

  await client.post('/users/me/profile-image', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  assert.equal(calls[0].body, body);
  assert.deepEqual(calls[0].options.headers, { 'Content-Type': 'multipart/form-data' });
});

test('shared client converts transport failures to the common contract error', async () => {
  const client = createApiClient({
    get: async () => { throw new Error('unused'); },
    patch: async () => { throw new Error('unused'); },
    post: async () => {
      throw {
        isAxiosError: true,
        message: 'Request failed',
        response: {
          data: {
            code: 'EVENT_BATCH_TOO_LARGE',
            details: null,
            fieldErrors: null,
            message: 'Too many events',
            traceId: 'trace-conversion',
          },
          status: 413,
        },
      };
    },
  });

  await assert.rejects(
    client.post('/conversion-events/batch', { events: [] }),
    (error) =>
      error instanceof ApiError &&
      error.code === 'EVENT_BATCH_TOO_LARGE' &&
      error.status === 413 &&
      error.traceId === 'trace-conversion',
  );
});

test('shared client rejects absolute paths before sending credentials', async () => {
  let requestCount = 0;
  const transport = {
    get: async () => { requestCount += 1; return { data: null }; },
    patch: async () => { requestCount += 1; return { data: null }; },
    post: async () => { requestCount += 1; return { data: null }; },
  };
  const client = createApiClient(transport);

  await assert.rejects(client.get('https://example.com/steal'), /relative/);
  assert.equal(requestCount, 0);
});

test('app composition can inject the authenticated transport after the shared client is created', async () => {
  const responseBody = { authenticated: true };
  const client = createApiClient();
  const transport = {
    get: async () => ({ data: responseBody }),
    patch: async () => ({ data: responseBody }),
    post: async () => ({ data: responseBody }),
    put: async () => ({ data: responseBody }),
  };

  const resetTransport = configureApiTransport(transport);

  try {
    assert.equal(await client.get('/places'), responseBody);
  } finally {
    resetTransport();
  }
});
