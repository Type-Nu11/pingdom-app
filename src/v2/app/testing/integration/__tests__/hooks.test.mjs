import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '../../../../shared/api/ApiError.ts';

import {
  createCheckInMutationOptions,
  createStatusVoteMutationOptions,
} from '../../../../modules/place/check-ins/data/index.ts';
import { createConversionEventMutationOptions } from '../../../../shared/analytics/conversion/data/index.ts';
import { createRedeemCouponMutationOptions } from '../../../../modules/booking/offers-coupons/__tests__/index.ts';
import { createPlaceClaimMutationOptions } from '../../../../modules/place/claims/data/index.ts';
import { createPlaceDetailQueryOptions } from '../../../../modules/place/detail/data/index.ts';
import { createPlaceListQueryOptions } from '../../../../modules/place/search/data/index.ts';
import {
  createReservationMutationOptions,
  createReservationTransitionMutationOptions,
  invalidateReservationCreateDependencies,
  reservationQueryKeys,
} from '../../../../modules/booking/reservations/__tests__/index.ts';
import {
  createReplaceTravelPurposesMutationOptions,
  createTravelPurposeQueryOptions,
  recommendationQueryKeys,
  refreshPersonalizationCaches,
  travelPurposeQueryKeys,
  userQueryKeys,
} from '../../../../modules/travel/purposes/__tests__/index.ts';
import {
  validateReplaceTravelPurposesBody,
} from '../../../../modules/travel/purposes/__tests__/index.ts';
import {
  createCancelTravelScheduleMutationOptions,
  createTravelScheduleMutationOptions,
  createTravelSchedulesQueryOptions,
  createUpdateTravelScheduleMutationOptions,
  invalidateTravelScheduleDependencies,
} from '../../../../modules/travel/schedules/__tests__/index.ts';
import { travelScheduleQueryKeys } from '../../../../modules/travel/schedules/__tests__/index.ts';

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

test('reservation create invalidates only the reservation list and the origin place availability', async () => {
  const queryClient = new QueryClient();
  const otherPlaceAvailabilities = reservationQueryKeys.availabilitiesByPlace(99);
  const placeDetailKey = ['v2', 'places', 'detail', 17];
  const recommendationsKey = recommendationQueryKeys.list({ page: 1 });

  queryClient.setQueryData(reservationQueryKeys.list({ page: 1 }), { reservations: [] });
  queryClient.setQueryData(reservationQueryKeys.availabilities(17, {}), []);
  queryClient.setQueryData(otherPlaceAvailabilities, []);
  queryClient.setQueryData(placeDetailKey, { id: 17 });
  queryClient.setQueryData(recommendationsKey, { places: [] });

  await invalidateReservationCreateDependencies(queryClient, 17);

  assert.equal(
    queryClient.getQueryState(reservationQueryKeys.list({ page: 1 })).isInvalidated,
    true,
  );
  assert.equal(
    queryClient.getQueryState(reservationQueryKeys.availabilities(17, {})).isInvalidated,
    true,
  );
  assert.equal(queryClient.getQueryState(otherPlaceAvailabilities).isInvalidated, false);
  assert.equal(queryClient.getQueryState(placeDetailKey).isInvalidated, false);
  assert.equal(queryClient.getQueryState(recommendationsKey).isInvalidated, false);
});

test('reservation create without an origin place leaves every availability cache intact', async () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(reservationQueryKeys.availabilities(17, {}), []);

  await invalidateReservationCreateDependencies(queryClient);

  assert.equal(
    queryClient.getQueryState(reservationQueryKeys.availabilities(17, {})).isInvalidated,
    false,
  );
});
