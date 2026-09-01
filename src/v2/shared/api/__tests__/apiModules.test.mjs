import assert from 'node:assert/strict';
import test from 'node:test';

import { createCheckInApi } from '../../../features/check-ins/api/checkInApi.ts';
import { createConversionApi } from '../../../features/conversion/api/conversionApi.ts';
import { createOfferCouponApi } from '../../../features/offers-coupons/api/offerCouponApi.ts';
import { createPlaceClaimApi } from '../../../features/place-claims/api/placeClaimApi.ts';
import { createPlaceDetailApi } from '../../../features/place-detail/api/placeDetailApi.ts';
import { createPlaceListApi } from '../../../features/place-list/api/placeListApi.ts';
import { createReservationApi } from '../../../features/reservations/api/reservationApi.ts';
import { createTravelPurposeApi } from '../../../features/travel-purposes/api/travelPurposeApi.ts';
import { createTravelScheduleApi } from '../../../features/travel-schedules/api/travelScheduleApi.ts';
import { createNotificationApi } from '../../../features/notifications/api/notificationApi.ts';

test('API modules keep operation paths, params, bodies, and documented response mapping', async () => {
  const calls = [];
  const response = { contract: 'response-object' };
  const client = {
    delete: async (path, body, options) => {
      calls.push({ body, method: 'DELETE', options, path });
      return response;
    },
    get: async (path, options) => {
      calls.push({ method: 'GET', options, path });
      return response;
    },
    patch: async (path, body, options) => {
      calls.push({ body, method: 'PATCH', options, path });
      return response;
    },
    post: async (path, body, options) => {
      calls.push({ body, method: 'POST', options, path });
      return response;
    },
    put: async (path, body, options) => {
      calls.push({ body, method: 'PUT', options, path });
      return response;
    },
  };

  const signal = new AbortController().signal;
  const placeList = createPlaceListApi(client);
  const placeDetail = createPlaceDetailApi(client);
  const checkIns = createCheckInApi(client);
  const claims = createPlaceClaimApi(client);
  const offers = createOfferCouponApi(client);
  const reservations = createReservationApi(client);
  const conversion = createConversionApi(client);
  const travelPurposes = createTravelPurposeApi(client);
  const travelSchedules = createTravelScheduleApi(client);
  const notifications = createNotificationApi(client);

  const checkInBody = {
    accuracyMeters: 10,
    latitude: 35.18,
    longitude: 128.1,
    observedAt: '2026-07-23T05:20:00Z',
    placeId: 17,
  };
  const voteBody = {
    checkInId: 7001,
    crowdLevel: 'MODERATE',
    observedAt: '2026-07-23T05:30:00Z',
  };
  const claimBody = { placeId: 17, reason: 'Business registration proof' };
  const redeemBody = { code: '11111111-1111-4111-8111-111111111111' };
  const reservationBody = {
    availabilityId: 801,
    idempotencyKey: 'reservation-01992f4c-31f6-7c42-ae8d-9d892c31e32d',
    quantity: 2,
  };
  const conversionBody = {
    events: [{
      checkInId: null,
      couponId: null,
      eventId: '11111111-1111-4111-8111-111111111111',
      eventName: 'PLACE_IMPRESSION',
      occurredAt: '2026-07-23T05:30:00Z',
      placeId: 17,
      recommendationRequestId: null,
      reservationId: null,
      schemaVersion: '1.0',
      sessionId: '22222222-2222-4222-8222-222222222222',
      sourceScreen: 'PLACE_LIST',
    }],
  };
  const travelScheduleBody = {
    startDate: '2026-08-12',
    endDate: '2026-08-14',
  };
  const updatedTravelScheduleBody = {
    startDate: '2026-08-13',
    endDate: '2026-08-16',
  };

  const results = await Promise.all([
    placeList.getPlaceList({ keyword: 'cafe', page: 1 }, signal),
    placeDetail.getPlaceDetail(17, signal),
    checkIns.listCheckIns({ page: 1 }, signal),
    checkIns.createCheckIn(checkInBody, signal),
    checkIns.createStatusVote(17, voteBody, signal),
    claims.listPlaceClaims({ limit: 20 }, signal),
    claims.createPlaceClaim(claimBody, signal),
    claims.getPlaceClaim(301, signal),
    claims.cancelPlaceClaim(301, signal),
    offers.listOffers({ placeId: 17 }, signal),
    offers.getOffer(401, signal),
    offers.issueCoupon(401, signal),
    offers.listCoupons({ page: 1 }, signal),
    offers.redeemCoupon(redeemBody, signal),
    reservations.listAvailabilities(17, {}, signal),
    reservations.listReservations({ page: 1 }, signal),
    reservations.createReservation(reservationBody, signal),
    reservations.cancelReservation(901, signal),
    reservations.listOwnedReservations({ placeId: 17 }, signal),
    reservations.confirmOwnedReservation(901, signal),
    reservations.cancelOwnedReservation(901, signal),
    conversion.ingestEvents(conversionBody, signal),
    travelPurposes.getTravelPurposes(signal),
    travelPurposes.replaceTravelPurposes({ travelPurposes: ['K_POP', 'FOOD'] }, signal),
    travelSchedules.getTravelSchedules(signal),
    travelSchedules.createTravelSchedule(travelScheduleBody, signal),
    travelSchedules.updateTravelSchedule(1, updatedTravelScheduleBody, signal),
    travelSchedules.cancelTravelSchedule(1, signal),
    notifications.registerFcmToken({ token: 'fcm-token' }, signal),
    notifications.deleteFcmToken({ token: 'deleted-fcm-token' }, signal),
    notifications.getNotificationSettings(signal),
    notifications.updateNotificationSettings({ newLikeEnabled: false }, signal),
    notifications.updateLegacyFcmToken({ token: 'legacy-token' }, signal),
  ]);

  assert.ok(
    results.every((result, index) =>
      index === 2
        ? result.checkIns.length === 0 && result.page === 1
        : index === 15 || index === 18
        ? result.contract === response.contract && result.totalCount === 0
        : index === 28 || index === 29 || index === 32
        ? result === undefined
        : result === response),
  );
  assert.deepEqual(calls.map(({ method, path }) => `${method} ${path}`), [
    'GET /places',
    'GET /places/17',
    'GET /location-check-ins',
    'POST /location-check-ins',
    'POST /places/17/status-votes',
    'GET /merchant-owner/place-claims',
    'POST /merchant-owner/place-claims',
    'GET /merchant-owner/place-claims/301',
    'POST /merchant-owner/place-claims/301/cancel',
    'GET /offers',
    'GET /offers/401',
    'POST /offers/401/coupons',
    'GET /coupons',
    'POST /merchant-owner/offers/coupons/redeem',
    'GET /places/17/availabilities',
    'GET /reservations',
    'POST /reservations',
    'POST /reservations/901/cancel',
    'GET /merchant-owner/reservations',
    'POST /merchant-owner/reservations/901/confirm',
    'POST /merchant-owner/reservations/901/cancel',
    'POST /conversion-events/batch',
    'GET /users/me/travel-purposes',
    'PUT /users/me/travel-purposes',
    'GET /users/me/travel-schedules',
    'POST /users/me/travel-schedules',
    'PATCH /users/me/travel-schedules/1',
    'POST /users/me/travel-schedules/1/cancel',
    'POST /firebase/fcm-tokens',
    'DELETE /firebase/fcm-tokens',
    'GET /notifications/settings',
    'PATCH /notifications/settings',
    'PATCH /firebase/fcm-token',
  ]);

  assert.deepEqual(calls[0].options.params, { keyword: 'cafe', page: 1 });
  assert.equal(calls[0].options.signal, signal);
  assert.equal(calls[3].body, checkInBody);
  assert.equal(calls[4].body, voteBody);
  assert.equal(calls[6].body, claimBody);
  assert.equal(calls[13].body, redeemBody);
  assert.equal(calls[14].options.signal, signal);
  assert.equal(calls[16].body, reservationBody);
  assert.equal(calls[21].body, conversionBody);
  assert.deepEqual(calls[23].body, { travelPurposes: ['K_POP', 'FOOD'] });
  assert.equal(calls[22].options.signal, signal);
  assert.equal(calls[23].options.signal, signal);
  assert.equal(calls[24].options.signal, signal);
  assert.equal(calls[25].body, travelScheduleBody);
  assert.equal(calls[25].options.signal, signal);
  assert.equal(calls[26].body, updatedTravelScheduleBody);
  assert.equal(calls[26].options.signal, signal);
  assert.equal(calls[27].options.signal, signal);
  assert.deepEqual(calls[28].body, { token: 'fcm-token' });
  assert.equal(calls[29].options.signal, signal);
  assert.deepEqual(calls[31].body, { newLikeEnabled: false });
});

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
