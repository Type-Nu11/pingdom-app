import assert from 'node:assert/strict';
import test from 'node:test';
import { parseDeepLink } from '../deepLink.ts';
import {
  claimNotificationMessage,
  createFocusedPlaceMapParams,
  createNotificationNavigationIntent,
  getRootRouteName,
  toMainNavigatorParams,
} from '../navigationIntent.ts';
import {
  MAIN_ROUTES,
  ROOT_ROUTES,
  parseMerchantId,
  parseNotificationId,
  parsePlaceId,
  parsePostId,
  parseReservationId,
  parseCheckInId,
} from '../types.ts';
import { getProfileBackAction } from '../../../features/profile/utils/profileBack.ts';
import { getSettingsBackAction } from '../../../features/settings/utils/settingsBack.ts';
import { getMapBackAction } from '../../../features/place/utils/mapBack.ts';
import {
  ANDROID_EXIT_CONFIRMATION_WINDOW_MS,
  getAndroidBackAction,
} from '../androidBack.ts';

test('route ID parsers accept only positive safe integers', () => {
  assert.equal(parsePlaceId(123), 123);
  assert.equal(parsePlaceId('123'), 123);
  assert.equal(parseMerchantId('456'), 456);
  assert.equal(parsePostId('7'), 7);
  assert.equal(parseNotificationId('8'), 8);
  assert.equal(parseReservationId('901'), 901);
  assert.equal(parseCheckInId('7001'), 7001);

  for (const invalidId of [undefined, null, '', '0', '01', '-1', '1.2', 0, -1, 1.2, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(parsePlaceId(invalidId), null);
  }
});

test('visit verification routes carry numeric server identifiers', () => {
  assert.equal(MAIN_ROUTES.VisitVerificationPlaces, 'VisitVerificationPlaces');
  assert.equal(MAIN_ROUTES.VisitVerificationReview, 'VisitVerificationReview');
  assert.equal(parsePlaceId(17), 17);
  assert.equal(parseCheckInId(7001), 7001);
});

test('authentication state selects an exclusive root stack', () => {
  assert.equal(getRootRouteName(false), ROOT_ROUTES.Auth);
  assert.equal(getRootRouteName(true), ROOT_ROUTES.Main);
});

test('notification payload focuses the place in the map detail sheet', () => {
  const intent = createNotificationNavigationIntent({
    body: 'body',
    messageId: 'message-1',
    notificationsId: '8',
    placeId: '42',
    postId: '7',
    screen: 'place-detail',
    source: 'quit-open',
    title: 'title',
  });

  assert.deepEqual(intent, {
    params: {
      focusedPlaceId: 42,
      notificationContext: {
        body: 'body',
        notificationId: 8,
        postId: 7,
        title: 'title',
      },
    },
    screen: MAIN_ROUTES.Map,
  });
  assert.deepEqual(toMainNavigatorParams(intent), {
    params: intent.params,
    screen: MAIN_ROUTES.Map,
  });
});

test('invalid notification parameters safely fall back to Map', () => {
  const intent = createNotificationNavigationIntent({
    placeId: '../settings',
    screen: 'place-detail',
    source: 'background-open',
    title: '알림',
  });

  assert.deepEqual(intent, {
    params: { notificationContext: { body: undefined, notificationId: undefined, postId: undefined, title: '알림' } },
    screen: MAIN_ROUTES.Map,
  });
});

test('notification message IDs are handled only once per authenticated session', () => {
  const handledMessageIds = new Set();

  assert.equal(claimNotificationMessage({ messageId: 'message-1' }, handledMessageIds), true);
  assert.equal(claimNotificationMessage({ messageId: 'message-1' }, handledMessageIds), false);
  assert.equal(claimNotificationMessage({ messageId: 'message-2' }, handledMessageIds), true);
  assert.equal(claimNotificationMessage({}, handledMessageIds), true);
});

test('bookmark IDs produce Map focus params without creating string IDs', () => {
  assert.deepEqual(createFocusedPlaceMapParams(138001), { focusedPlaceId: 138001 });
  assert.equal(createFocusedPlaceMapParams('invalid'), null);
});

test('custom deep links map to typed navigation intents', () => {
  assert.deepEqual(parseDeepLink('pingdom://map'), { screen: MAIN_ROUTES.Map });
  assert.deepEqual(parseDeepLink('pingdom://places/123'), {
    params: { focusedPlaceId: 123 },
    screen: MAIN_ROUTES.Map,
  });
  assert.deepEqual(parseDeepLink('pingdom://places/123/check-in'), {
    params: { placeId: 123 },
    screen: MAIN_ROUTES.CheckIn,
  });
  assert.deepEqual(parseDeepLink('pingdom://coupons'), { screen: MAIN_ROUTES.CouponWallet });
  assert.deepEqual(parseDeepLink('pingdom://profile'), { screen: MAIN_ROUTES.Profile });
  assert.deepEqual(parseDeepLink('pingdom://settings'), { screen: MAIN_ROUTES.Settings });
  assert.deepEqual(parseDeepLink('pingdom://merchants/456'), {
    params: { merchantId: 456 },
    screen: MAIN_ROUTES.Merchant,
  });
});

test('invalid app links fall back to Map and unrelated schemes are ignored', () => {
  assert.deepEqual(parseDeepLink('pingdom://places/not-a-number'), { screen: MAIN_ROUTES.Map });
  assert.deepEqual(parseDeepLink('pingdom://places/0'), { screen: MAIN_ROUTES.Map });
  assert.deepEqual(parseDeepLink('pingdom://unknown/path'), { screen: MAIN_ROUTES.Map });
  assert.equal(parseDeepLink('https://example.com/places/123'), null);
});

test('Profile and Settings consume hardware back only for local UI state', () => {
  assert.equal(getProfileBackAction('archive-detail'), 'show-archive');
  assert.equal(getProfileBackAction('archive'), 'show-profile');
  assert.equal(getProfileBackAction('profile'), 'navigate-back');
  assert.equal(getSettingsBackAction(2), 'pop-page');
  assert.equal(getSettingsBackAction(1), 'navigate-back');
});

test('Map closes local bottom-sheet state before delegating navigation back', () => {
  assert.equal(getMapBackAction({ type: 'place-preview', placeId: 1 }, 'expanded'), 'show-home');
  assert.equal(getMapBackAction({ type: 'home' }, 'medium'), 'collapse-sheet');
  assert.equal(getMapBackAction({ type: 'home' }, 'collapsed'), 'navigate-back');
});

test('Android back pops navigation before applying the double-back exit policy', () => {
  const now = 10_000;

  assert.equal(getAndroidBackAction(true, now - 500, now), 'go-back');
  assert.equal(getAndroidBackAction(false, 0, now), 'show-exit-hint');
  assert.equal(getAndroidBackAction(false, now - 500, now), 'exit-app');
  assert.equal(
    getAndroidBackAction(false, now - ANDROID_EXIT_CONFIRMATION_WINDOW_MS - 1, now),
    'show-exit-hint',
  );
});
