import assert from 'node:assert/strict';
import test from 'node:test';

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
