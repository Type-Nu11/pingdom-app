import assert from 'node:assert/strict';
import test from 'node:test';
import { createApiClient, configureApiAccessTokenProvider, configureAppRequestMetadata, getAppRequestHeaders } from '../apiClient.ts';

const deviceId = '00000000-0000-4000-8000-000000000001';
test('proxy metadata is injected, recomputed per request, and does not replace JWT', async () => {
  let version = '1.0.0';
  const restore = configureAppRequestMetadata(async () => ({ appVersion: version, deviceId }));
  const restoreToken = configureApiAccessTokenProvider(() => 'test-token');
  const calls = [];
  const client = createApiClient({ post: async (path, body, options) => { calls.push(options); return { data: {} }; } });
  try {
    await client.post('/routes', {});
    version = '1.0.1';
    await client.post('/routes', {});
    assert.equal(calls[0].headers['X-App-Version'], '1.0.0');
    assert.equal(calls[1].headers['X-App-Version'], '1.0.1');
    for (const { headers } of calls) {
      assert.equal(headers['X-Device-Id'], deviceId);
      assert.equal(headers['X-Client-Type'], 'App');
      assert.equal(headers.Authorization, 'Bearer test-token');
      assert.ok(Math.abs(Number(headers['X-Timestamp']) - Date.now() / 1000) < 2);
      assert.equal(headers['X-SignatureBase64'], undefined);
    }
  } finally { restore(); restoreToken(); }
  assert.deepEqual(await getAppRequestHeaders(), {});
});
