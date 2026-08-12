import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';

import {
  createCheckInMutationOptions,
  createStatusVoteMutationOptions,
} from '../../../features/check-ins/hooks/useCheckIns.ts';
import { createConversionEventMutationOptions } from '../../../features/conversion/hooks/useConversionEvents.ts';
import { createRedeemCouponMutationOptions } from '../../../features/offers-coupons/hooks/useOffersCoupons.ts';
import { createPlaceClaimMutationOptions } from '../../../features/place-claims/hooks/usePlaceClaims.ts';
import { createPlaceDetailQueryOptions } from '../../../features/place-detail/hooks/usePlaceDetail.ts';
import { createPlaceListQueryOptions } from '../../../features/place-list/hooks/usePlaceList.ts';
import {
  createReservationMutationOptions,
  createReservationTransitionMutationOptions,
} from '../../../features/reservations/hooks/useReservations.ts';
import {
  createReplaceTravelPurposesMutationOptions,
  createTravelPurposeQueryOptions,
  recommendationQueryKeys,
  refreshPersonalizationCaches,
  travelPurposeQueryKeys,
  userQueryKeys,
} from '../../../features/travel-purposes/hooks/useTravelPurposes.ts';
import {
  validateReplaceTravelPurposesBody,
} from '../../../features/travel-purposes/model/travelPurpose.types.ts';
import {
  createCancelTravelScheduleMutationOptions,
  createTravelScheduleMutationOptions,
  createTravelSchedulesQueryOptions,
  createUpdateTravelScheduleMutationOptions,
  invalidateTravelScheduleDependencies,
} from '../../../features/travel-schedules/hooks/useTravelSchedules.ts';
import { travelScheduleQueryKeys } from '../../../features/travel-schedules/model/travelScheduleQueryKeys.ts';
import {
  createDeleteFcmTokenMutationOptions,
  createRegisterFcmTokenMutationOptions,
} from '../../../features/notifications/hooks/useFcmTokenMutations.ts';
import {
  createNotificationSettingsQueryOptions,
  createUpdateNotificationSettingsMutationOptions,
  notificationSettingsQueryKeys,
  optimisticallyUpdateNotificationSettings,
} from '../../../features/notifications/hooks/useNotificationSettings.ts';

test('place query Hook options pass API responses through without mapping', async () => {
  const listResponse = { places: [] };
  const detailResponse = { id: 17 };
  const signal = new AbortController().signal;
  let receivedList;
  let receivedDetail;

  const listOptions = createPlaceListQueryOptions(
    { limit: 20, page: 1, sort: 'NEAREST' },
    { getPlaceList: async (params, receivedSignal) => {
      receivedList = { params, receivedSignal };
      return listResponse;
    } },
  );
  const detailOptions = createPlaceDetailQueryOptions(17, {
    getPlaceDetail: async (placeId, receivedSignal) => {
      receivedDetail = { placeId, receivedSignal };
      return detailResponse;
    },
  });

  assert.equal(await listOptions.queryFn({ signal }), listResponse);
  assert.equal(await detailOptions.queryFn({ signal }), detailResponse);
  assert.deepEqual(receivedList, {
    params: { limit: 20, page: 1, sort: 'NEAREST' },
    receivedSignal: signal,
  });
  assert.deepEqual(receivedDetail, { placeId: 17, receivedSignal: signal });
});

test('action Hook options forward generated request bodies and identifiers unchanged', async () => {
  const calls = [];
  const apiResponse = { id: 1 };
  const body = { contract: 'body' };

  const options = [
    [createCheckInMutationOptions({ createCheckIn: async (value) => {
      calls.push(['checkIn', value]); return apiResponse;
    } }), body],
    [createStatusVoteMutationOptions({ createStatusVote: async (placeId, value) => {
      calls.push(['vote', placeId, value]); return apiResponse;
    } }), { body, placeId: 17 }],
    [createPlaceClaimMutationOptions({ createPlaceClaim: async (value) => {
      calls.push(['claim', value]); return apiResponse;
    } }), body],
    [createRedeemCouponMutationOptions({ redeemCoupon: async (value) => {
      calls.push(['coupon', value]); return apiResponse;
    } }), body],
    [createReservationMutationOptions({ createReservation: async (value) => {
      calls.push(['reservation', value]); return apiResponse;
    } }), body],
    [createReservationTransitionMutationOptions('confirmOwnedReservation', {
      confirmOwnedReservation: async (reservationId) => {
        calls.push(['confirm', reservationId]); return apiResponse;
      },
    }), 901],
    [createConversionEventMutationOptions({ ingestEvents: async (value) => {
      calls.push(['conversion', value]); return apiResponse;
    } }), body],
  ];

  for (const [option, variables] of options) {
    assert.equal(await option.mutationFn(variables), apiResponse);
  }

  assert.deepEqual(calls, [
    ['checkIn', body],
    ['vote', 17, body],
    ['claim', body],
    ['coupon', body],
    ['reservation', body],
    ['confirm', 901],
    ['conversion', body],
  ]);
});

test('conversion Hook keeps one error owner and opts into its idempotent retry policy', () => {
  const options = createConversionEventMutationOptions({ ingestEvents: async () => ({}) });

  assert.equal(typeof options.retry, 'function');
  assert.equal(typeof options.retryDelay, 'function');
  assert.equal('onError' in options, false);
});

test('travel purpose Hook options forward AbortSignal and replace body unchanged', async () => {
  const response = { travelPurposes: ['K_POP', 'FOOD'] };
  const body = { travelPurposes: ['K_POP', 'FOOD'] };
  const signal = new AbortController().signal;
  let receivedSignal;
  let receivedBody;

  const queryOptions = createTravelPurposeQueryOptions({
    getTravelPurposes: async (value) => {
      receivedSignal = value;
      return response;
    },
  });
  const mutationOptions = createReplaceTravelPurposesMutationOptions({
    replaceTravelPurposes: async (value) => {
      receivedBody = value;
      return response;
    },
  });

  assert.equal(await queryOptions.queryFn({ signal }), response);
  assert.equal(await mutationOptions.mutationFn(body), response);
  assert.equal(receivedSignal, signal);
  assert.equal(receivedBody, body);
  assert.deepEqual(queryOptions.queryKey, ['v2', 'users', 'me', 'travel-purposes']);
});

test('travel purpose validation follows OpenAPI empty, maximum, enum, and uniqueness rules', () => {
  const emptyBody = { travelPurposes: [] };

  assert.equal(validateReplaceTravelPurposesBody(emptyBody), emptyBody);
  assert.throws(
    () => validateReplaceTravelPurposesBody({ travelPurposes: Array(10).fill('K_POP') }),
    { name: 'RangeError' },
  );
  assert.throws(
    () => validateReplaceTravelPurposesBody({ travelPurposes: ['FOOD', 'FOOD'] }),
    /must not contain duplicates/,
  );
  assert.throws(
    () => validateReplaceTravelPurposesBody({ travelPurposes: ['UNKNOWN'] }),
    /unsupported value/,
  );
});

test('travel purpose replacement restores its cache and invalidates user and recommendations', async () => {
  const queryClient = new QueryClient();
  const preference = { travelPurposes: ['BEAUTY', 'CAFE'] };

  queryClient.setQueryData(userQueryKeys.me(), { id: 1 });
  queryClient.setQueryData(recommendationQueryKeys.all, { places: [] });

  await refreshPersonalizationCaches(queryClient, preference);

  assert.equal(queryClient.getQueryData(travelPurposeQueryKeys.mine()), preference);
  assert.equal(queryClient.getQueryState(travelPurposeQueryKeys.mine()).isInvalidated, false);
  assert.equal(queryClient.getQueryState(userQueryKeys.me()).isInvalidated, true);
  assert.equal(queryClient.getQueryState(recommendationQueryKeys.all).isInvalidated, true);
});

test('travel schedule Hook options preserve date-only bodies, identifiers, and AbortSignal', async () => {
  const calls = [];
  const response = { schedules: [] };
  const body = { startDate: '2026-08-31', endDate: '2026-09-02' };
  const signal = new AbortController().signal;
  const api = {
    getTravelSchedules: async (receivedSignal) => {
      calls.push(['list', receivedSignal]); return response;
    },
    createTravelSchedule: async (value) => {
      calls.push(['create', value]); return response;
    },
    updateTravelSchedule: async (scheduleId, value) => {
      calls.push(['update', scheduleId, value]); return response;
    },
    cancelTravelSchedule: async (scheduleId) => {
      calls.push(['cancel', scheduleId]); return response;
    },
  };

  const queryOptions = createTravelSchedulesQueryOptions(api);
  const createOptions = createTravelScheduleMutationOptions(api);
  const updateOptions = createUpdateTravelScheduleMutationOptions(api);
  const cancelOptions = createCancelTravelScheduleMutationOptions(api);

  assert.equal(await queryOptions.queryFn({ signal }), response);
  assert.equal(await createOptions.mutationFn(body), response);
  assert.equal(await updateOptions.mutationFn({ body, scheduleId: 7 }), response);
  assert.equal(await cancelOptions.mutationFn(7), response);
  assert.deepEqual(queryOptions.queryKey, [
    'v2', 'users', 'me', 'travel-schedules', 'list',
  ]);
  assert.deepEqual(calls, [
    ['list', signal],
    ['create', body],
    ['update', 7, body],
    ['cancel', 7],
  ]);
});

test('travel schedule mutations invalidate only schedule-dependent caches', async () => {
  const queryClient = new QueryClient();
  const unrelatedKey = ['v2', 'places', 'detail', 17];

  queryClient.setQueryData(travelScheduleQueryKeys.list(), { schedules: [] });
  queryClient.setQueryData(userQueryKeys.me(), { id: 1 });
  queryClient.setQueryData(recommendationQueryKeys.list({ page: 1 }), { places: [] });
  queryClient.setQueryData(unrelatedKey, { id: 17 });

  await invalidateTravelScheduleDependencies(queryClient);

  assert.equal(queryClient.getQueryState(travelScheduleQueryKeys.list()).isInvalidated, true);
  assert.equal(queryClient.getQueryState(userQueryKeys.me()).isInvalidated, true);
  assert.equal(
    queryClient.getQueryState(recommendationQueryKeys.list({ page: 1 })).isInvalidated,
    true,
  );
  assert.equal(queryClient.getQueryState(unrelatedKey).isInvalidated, false);
});

test('notification Hook options forward AbortSignal and contract bodies', async () => {
  const setting = { newLikeEnabled: true, timezone: 'Asia/Seoul' };
  const update = { newLikeEnabled: false };
  const token = { token: 'device-token' };
  const signal = new AbortController().signal;
  const calls = [];

  const query = createNotificationSettingsQueryOptions({
    getNotificationSettings: async (receivedSignal) => {
      calls.push(['get', receivedSignal]);
      return setting;
    },
  });
  const updateMutation = createUpdateNotificationSettingsMutationOptions({
    updateNotificationSettings: async (body) => {
      calls.push(['update', body]);
      return { ...setting, ...body };
    },
  });
  const registerMutation = createRegisterFcmTokenMutationOptions({
    registerFcmToken: async (body) => { calls.push(['register', body]); },
  });
  const deleteMutation = createDeleteFcmTokenMutationOptions({
    deleteFcmToken: async (body) => { calls.push(['delete', body]); },
  });

  assert.equal(await query.queryFn({ signal }), setting);
  assert.equal((await updateMutation.mutationFn(update)).newLikeEnabled, false);
  await registerMutation.mutationFn(token);
  await deleteMutation.mutationFn(token);
  assert.deepEqual(query.queryKey, ['v2', 'notifications', 'settings', 'me']);
  assert.deepEqual(calls, [
    ['get', signal],
    ['update', update],
    ['register', token],
    ['delete', token],
  ]);
});

test('notification setting optimistic update can be rolled back to server cache', () => {
  const queryClient = new QueryClient();
  const queryKey = notificationSettingsQueryKeys.mine();
  const previous = {
    newHotplaceEnabled: true,
    newLikeEnabled: true,
    quietHoursEnabled: false,
    timezone: 'Asia/Seoul',
  };
  queryClient.setQueryData(queryKey, previous);

  const snapshot = optimisticallyUpdateNotificationSettings(queryClient, {
    newLikeEnabled: false,
  });

  assert.deepEqual(snapshot, previous);
  assert.deepEqual(queryClient.getQueryData(queryKey), {
    ...previous,
    newLikeEnabled: false,
  });
  queryClient.setQueryData(queryKey, snapshot);
  assert.deepEqual(queryClient.getQueryData(queryKey), previous);
});
