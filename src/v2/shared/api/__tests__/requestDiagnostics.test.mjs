import assert from 'node:assert/strict';
import test from 'node:test';
import { createApiClient } from '../apiClient.ts';

test('failed requests expose diagnostic metadata without credentials or payload values', async () => {
  const previous = globalThis.__DEV__;
  globalThis.__DEV__ = true;
  const logs = [];
  const original = console.warn;
  console.warn = (...args) => logs.push(args);
  try {
    const client = createApiClient({ get: async () => { throw {
      isAxiosError: true, message: 'secret-message', code: 'ERR_BAD_RESPONSE',
      config: { baseURL: 'https://api.example.com/v1', headers: { Authorization: 'secret-token' } },
      response: { status: 503, data: { code: 'SERVICE_UNAVAILABLE', traceId: 'trace-123', message: 'secret-message' } },
    }; } });
    await assert.rejects(client.get('/users/123?email=secret-email', { params: { token: 'secret-query' } }));
    const entry = JSON.parse(logs[0][1]);
    assert.equal(entry.route, '/users/:id');
    assert.equal(entry.method, 'GET');
    assert.equal(entry.status, 503);
    assert.equal(entry.kind, 'http');
    assert.equal(entry.host, 'api.example.com');
    assert.ok(entry.elapsedMs >= 0);
    assert.equal(JSON.stringify(logs).includes('secret'), false);
    globalThis.__DEV__ = false;
    await assert.rejects(client.get('/users/me'));
    assert.equal(logs.length, 1);
  } finally { console.warn = original; globalThis.__DEV__ = previous; }
});

test('identifier-shaped session IDs and echoed credentials are absent from diagnostics', async () => {
  const previous = globalThis.__DEV__;
  globalThis.__DEV__ = true;
  const logs = [];
  const original = console.warn;
  console.warn = (...args) => logs.push(args);
  try {
    const client = createApiClient({ post: async () => { throw {
      isAxiosError: true, code: 'private-transport-token',
      config: { headers: { Authorization: 'private-auth-token' } },
      response: { status: 500, headers: { 'x-request-id': 'private-header-token' },
        data: { code: 'private-server-token', traceId: 'private-trace-token', message: 'private-booker' } },
    }; } });
    await assert.rejects(client.post('/voice-ai/sessions/private-session-token/messages', { text: 'private-transcript' }));
    assert.equal(JSON.parse(logs[0][1]).route, '/voice-ai/sessions/:id/messages');
    assert.equal(JSON.stringify(logs).includes('private-'), false);
  } finally { console.warn = original; globalThis.__DEV__ = previous; }
});

test('timeouts and network failures are distinguished and cancellations are silent', async () => {
  const previous = globalThis.__DEV__;
  globalThis.__DEV__ = true;
  const logs = [];
  const original = console.warn;
  console.warn = (...args) => logs.push(JSON.parse(args[1]));
  try {
    for (const code of ['ECONNABORTED', 'ERR_NETWORK', 'ERR_CANCELED']) {
      const client = createApiClient({ get: async () => { throw { isAxiosError: true, code }; } });
      await assert.rejects(client.get('/places'));
    }
    assert.deepEqual(logs.map(entry => entry.kind), ['timeout', 'network']);
  } finally { console.warn = original; globalThis.__DEV__ = previous; }
});
