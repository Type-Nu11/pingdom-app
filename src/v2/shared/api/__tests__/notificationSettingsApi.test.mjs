import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';
import { ApiError, configureApiTransport, createApiClient } from '../index.ts';
import { createNotificationApi } from '../../../features/notifications/api/notificationApi.ts';

test('notification GET forwards cancellation and PATCH preserves partial body and server response', async () => {
  const signal = new AbortController().signal;
  const response = { newLikeEnabled: false, quietHoursStart: null };
  const restore = configureApiTransport({
    get: async (path, options) => {
      assert.equal(path, '/notifications/settings');
      assert.equal(options.signal, signal);
      return { data: response };
    },
    patch: async (path, body) => {
      assert.equal(path, '/notifications/settings');
      assert.deepEqual(body, { newLikeEnabled: false });
      return { data: response };
    },
  });
  try {
    const api = createNotificationApi(createApiClient());
    assert.equal(await api.getNotificationSettings(signal), response);
    assert.equal(await api.updateNotificationSettings({ newLikeEnabled: false }), response);
  } finally { restore(); }
});

for (const [status, code] of [[400, 'INVALID_QUIET_HOURS'], [401, 'INVALID_TOKEN'], [401, 'EXPIRED_TOKEN'], [403, 'ACCESS_DENIED']]) {
  test(`notification PATCH propagates ${status} ${code} through common ApiError`, async () => {
    const restore = configureApiTransport({ patch: async () => {
      throw new axios.AxiosError('request failed', undefined, undefined, undefined, {
        status, data: { code, message: 'server error' },
      });
    } });
    try {
      const api = createNotificationApi(createApiClient());
      await assert.rejects(api.updateNotificationSettings({ newLikeEnabled: true }), (error) => {
        assert.ok(error instanceof ApiError, `${error.constructor.name}: ${error.message}`);
        assert.equal(error.status, status);
        assert.equal(error.code, code);
        return true;
      });
    } finally { restore(); }
  });
}
