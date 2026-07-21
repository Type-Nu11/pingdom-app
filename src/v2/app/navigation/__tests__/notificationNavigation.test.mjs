import assert from 'node:assert/strict';
import test from 'node:test';

import { parseNotificationRoute } from '../../../features/notifications/services/notificationPayload.ts';
import {
  claimNotificationMessage,
  createNotificationNavigationIntent,
} from '../notificationIntent.ts';
import { parsePlaceId, V2_ROUTES } from '../types.ts';

test('V2 place route parameters accept only positive safe integers', () => {
  assert.equal(parsePlaceId('42'), 42);
  assert.equal(parsePlaceId(42), 42);

  for (const value of [undefined, '', '0', '01', '-1', '1.2', '../settings', 0]) {
    assert.equal(parsePlaceId(value), null);
  }
});

test('current notification payload routes to V2 place detail', () => {
  const route = parseNotificationRoute({
    data: { placeId: '42', screen: 'place-detail' },
    messageId: 'message-1',
  }, 'background-open');

  assert.deepEqual(createNotificationNavigationIntent(route), {
    params: { placeId: 42 },
    screen: V2_ROUTES.PlaceDetail,
  });
});

test('legacy targetId payload is supported', () => {
  const route = parseNotificationRoute({
    data: {
      mapImageId: '9',
      notificationId: '7',
      screen: 'PLACE_DETAIL',
      targetId: '123',
    },
  }, 'quit-open');

  assert.equal(route.placeId, '123');
  assert.equal(route.postId, '9');
  assert.equal(route.notificationId, '7');
  assert.deepEqual(createNotificationNavigationIntent(route), {
    params: { placeId: 123 },
    screen: V2_ROUTES.PlaceDetail,
  });
});

test('unsupported or invalid legacy payload safely falls back to Home', () => {
  const unsupported = parseNotificationRoute({
    data: { mapImageId: '9', screen: 'post-detail' },
  }, 'foreground-open');
  const invalidPlace = parseNotificationRoute({
    data: { placeId: '../settings', screen: 'place-detail' },
  }, 'foreground-open');

  assert.deepEqual(createNotificationNavigationIntent(unsupported), {
    screen: V2_ROUTES.Home,
  });
  assert.deepEqual(createNotificationNavigationIntent(invalidPlace), {
    screen: V2_ROUTES.Home,
  });
});

test('notification message IDs are handled once', () => {
  const handled = new Set();

  assert.equal(claimNotificationMessage('same-message', handled), true);
  assert.equal(claimNotificationMessage('same-message', handled), false);
  assert.equal(claimNotificationMessage(undefined, handled), true);
});
