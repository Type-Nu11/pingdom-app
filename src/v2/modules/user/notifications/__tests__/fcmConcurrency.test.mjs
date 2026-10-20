import assert from 'node:assert/strict';
import test from 'node:test';
import { createNotificationApi } from '../api/notificationApi.ts';

test('FCM registration coalesces concurrent requests for the same token', async () => {
  let releaseRequest;
  let postCount = 0;
  const pending = new Promise((resolve) => { releaseRequest = resolve; });
  const notifications = createNotificationApi({
    delete: async () => undefined,
    get: async () => ({}),
    patch: async () => ({}),
    post: async () => {
      postCount += 1;
      await pending;
    },
    put: async () => ({}),
  });

  const first = notifications.registerFcmToken({ token: 'same-token' });
  const second = notifications.registerFcmToken({ token: 'same-token' });

  assert.equal(first, second);
  assert.equal(postCount, 1);
  releaseRequest();
  await Promise.all([first, second]);
});

test('FCM deletion waits for an in-flight registration of the same token', async () => {
  let releaseRegistration;
  const calls = [];
  const pending = new Promise((resolve) => { releaseRegistration = resolve; });
  const notifications = createNotificationApi({
    delete: async () => { calls.push('delete'); },
    get: async () => ({}),
    patch: async () => ({}),
    post: async () => {
      calls.push('register:start');
      await pending;
      calls.push('register:end');
    },
    put: async () => ({}),
  });

  const registration = notifications.registerFcmToken({ token: 'same-token' });
  const deletion = notifications.deleteFcmToken({ token: 'same-token' });
  await Promise.resolve();
  assert.deepEqual(calls, ['register:start']);

  releaseRegistration();
  await Promise.all([registration, deletion]);
  assert.deepEqual(calls, ['register:start', 'register:end', 'delete']);
});
