import assert from 'node:assert/strict';
import test from 'node:test';

import { createVisitVerificationApi } from '../../../features/place-visit-verification/api/visitVerificationApi.ts';
import { createVisitVerificationMutationOptions } from '../../../features/place-visit-verification/hooks/useSubmitVisitVerification.ts';
import {
  appendPhotos,
  RECOMMEND_REASONS,
  toggleReason,
  selectCandidateImageUrls,
  uniquePlaceIdsInServerOrder,
  validateReviewDraft,
} from '../../../features/place-visit-verification/model/visitVerification.ts';
import { createInfiniteCheckInListQueryOptions } from '../../../features/check-ins/hooks/useCheckIns.ts';
import { createCheckInApi } from '../../../features/check-ins/api/checkInApi.ts';

test('visit review API forwards the confirmed body, place ID, and signal unchanged', async () => {
  const calls = [];
  const response = { reviewId: 91 };
  const client = {
    delete: async () => response,
    get: async () => response,
    patch: async () => response,
    post: async (path, body, options) => { calls.push({ body, options, path }); return response; },
    put: async () => response,
  };
  const api = createVisitVerificationApi(client);
  const signal = new AbortController().signal;
  const body = { recommendReason: 'Friendly', content: 'A real review.' };

  assert.equal(await api.createReview(17, body, signal), response);
  assert.deepEqual(calls, [{ body, options: { signal }, path: '/places/17/reviews' }]);
});

test('candidate enrichment preserves server check-in order while deduplicating place requests', () => {
  assert.deepEqual(uniquePlaceIdsInServerOrder([
    { placeId: 17 }, { placeId: 22 }, { placeId: 17 },
  ]), [17, 22]);
  assert.deepEqual(selectCandidateImageUrls('card.jpg', [
    { displayOrder: 2, imageUrl: 'late.jpg', thumbnailUrl: null },
    { displayOrder: 1, imageUrl: 'early.jpg', thumbnailUrl: 'thumb.jpg' },
  ]), ['card.jpg', 'thumb.jpg']);
});

test('visit review mutation disables retry and does not reshape the contract body', async () => {
  const calls = [];
  const body = { recommendReason: 'Friendly', content: 'Review' };
  const response = { reviewId: 91 };
  const options = createVisitVerificationMutationOptions({
    createReview: async (placeId, value) => { calls.push({ placeId, value }); return response; },
  });

  assert.equal(options.retry, false);
  assert.equal(await options.mutationFn({ body, placeId: 17 }), response);
  assert.deepEqual(calls, [{ placeId: 17, value: body }]);
});

test('review draft limits photos and reasons without inventing submission serialization', () => {
  const photos = Array.from({ length: 4 }, (_, index) => ({ height: 10, width: 10, uri: `file://${index}` }));
  assert.equal(appendPhotos([], photos).length, 3);

  let reasons = [];
  for (const reason of RECOMMEND_REASONS) reasons = toggleReason(reasons, reason);
  assert.equal(reasons.length, 5);
  assert.equal(validateReviewDraft({ content: 'Review', photoCount: 0, reasons: reasons.slice(0, 2) }), 'multiple-reasons-contract-missing');
  assert.equal(validateReviewDraft({ content: 'Review', photoCount: 1, reasons: reasons.slice(0, 1) }), 'photo-upload-contract-missing');
  assert.equal(validateReviewDraft({ content: 'Review', photoCount: 0, reasons: reasons.slice(0, 1) }), null);
});

test('check-in pagination follows server page metadata and forwards AbortSignal', async () => {
  const calls = [];
  const response = { checkIns: [], page: 1, totalPages: 2, hasNext: true };
  const options = createInfiniteCheckInListQueryOptions(20, {
    listCheckIns: async (params, signal) => { calls.push({ params, signal }); return response; },
  });
  const signal = new AbortController().signal;

  assert.equal(await options.queryFn({ pageParam: 1, signal }), response);
  assert.deepEqual(calls, [{ params: { limit: 20, page: 1 }, signal }]);
  assert.equal(options.getNextPageParam(response), 2);
  assert.equal(options.getNextPageParam({ ...response, hasNext: false }), undefined);
});

test('check-in API normalizes the live items response and drops unusable identifiers', async () => {
  const signal = new AbortController().signal;
  const client = {
    delete: async () => ({}),
    get: async (_path, options) => {
      assert.equal(options.signal, signal);
      return {
        items: [
          {
            id: 7001,
            placeId: 17,
            observedAt: '2026-08-26T05:30:00Z',
            distanceMeters: 18.4,
            status: 'PROXIMITY_MATCHED',
          },
          { id: 7002, observedAt: '2026-08-26T05:31:00Z', distanceMeters: 10 },
        ],
        page: 1,
        limit: 20,
        totalElements: 2,
        totalPages: 1,
        hasNext: false,
      };
    },
    patch: async () => ({}),
    post: async () => ({}),
    put: async () => ({}),
  };

  const result = await createCheckInApi(client).listCheckIns({ limit: 20, page: 1 }, signal);

  assert.deepEqual(result, {
    checkIns: [{
      id: 7001,
      placeId: 17,
      observedAt: '2026-08-26T05:30:00Z',
      distanceMeters: 18.4,
      status: 'PROXIMITY_MATCHED',
    }],
    page: 1,
    limit: 20,
    totalCount: 2,
    totalPages: 1,
    hasNext: false,
  });
});
