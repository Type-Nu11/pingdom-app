import assert from 'node:assert/strict';
import test from 'node:test';

import { createVisitVerificationApi } from '../../../features/place-visit-verification/api/visitVerificationApi.ts';
import {
  createVisitVerificationMutationOptions,
  invalidateReviewQueries,
} from '../../../features/place-visit-verification/hooks/useSubmitVisitVerification.ts';
import { createPlaceReviewsQueryOptions } from '../../../features/place-visit-verification/hooks/usePlaceReviews.ts';
import {
  appendPhotos,
  RECOMMEND_REASONS,
  selectReviewImageUrls,
  serializeRecommendReasons,
  toggleReason,
  selectCandidateImageUrls,
  uniquePlaceIdsInServerOrder,
  validateReviewDraft,
} from '../../../features/place-visit-verification/model/visitVerification.ts';
import { createInfiniteCheckInListQueryOptions } from '../../../features/check-ins/hooks/useCheckIns.ts';
import { createCheckInApi } from '../../../features/check-ins/api/checkInApi.ts';
import {
  applyVisitVerificationSessionResult,
  createObservationMutationOptions,
  createRecoverSessionMutationOptions,
  createStartForegroundSessionMutationOptions,
  createStartSessionMutationOptions,
} from '../../../features/place-visit-verification/hooks/useVisitVerificationSessionMutations.ts';
import {
  isTerminalVisitVerificationSession,
  clearActiveForegroundVisitVerificationSession,
  getActiveForegroundVisitVerificationSession,
  observationDelayMs,
  rememberActiveForegroundVisitVerificationSession,
  sessionErrorPhase,
  visitVerificationSessionQueryKeys,
} from '../../../features/place-visit-verification/model/visitVerificationSession.ts';
import { ApiError, mockApiClient, setMockScenario } from '../index.ts';
import {
  visitVerificationAlternatePolicyFixture,
  visitVerificationStartedFixture,
} from '../mock/features/visit-verification/fixtures.ts';

test('development fixtures default to 500m/30s while arbitrary server policies remain representable', () => {
  assert.deepEqual(
    [
      visitVerificationStartedFixture.requiredRadiusMeters,
      visitVerificationStartedFixture.requiredDwellSeconds,
    ],
    [500, 30],
  );
  assert.deepEqual(
    [
      visitVerificationAlternatePolicyFixture.requiredRadiusMeters,
      visitVerificationAlternatePolicyFixture.requiredDwellSeconds,
    ],
    [240, 12],
  );
});

test('development foreground mock follows STARTED to IN_PROGRESS to COMPLETED', async () => {
  setMockScenario('success');
  const api = createVisitVerificationApi(mockApiClient);
  const body = {
    accuracyMeters: 4,
    latitude: 35,
    longitude: 128,
    observedAt: '2026-09-02T01:00:00Z',
  };
  const started = await api.startForegroundSession(body);
  const progress = await api.submitObservation(started.id, body);
  const completed = await api.submitObservation(started.id, body);
  assert.deepEqual(
    [started.status, progress.status, completed.status],
    ['STARTED', 'IN_PROGRESS', 'COMPLETED'],
  );
  assert.equal(completed.completedCheckInId, 7002);
  assert.equal(completed.reviewEligible, true);
});

test('development observation mock keeps proximity loss, expiry, rejection, and network failure distinct', async () => {
  const api = createVisitVerificationApi(mockApiClient);
  const body = {
    accuracyMeters: 4,
    latitude: 35,
    longitude: 128,
    observedAt: '2026-09-02T01:00:00Z',
  };
  for (const [scenario, expectedStatus] of [
    ['empty', 'PROXIMITY_LOST'],
    ['expired', 'EXPIRED'],
    ['forbidden', 'REJECTED'],
  ]) {
    setMockScenario(scenario);
    const result = await api.submitObservation(9201, body);
    assert.equal(result.status, expectedStatus);
  }
  setMockScenario('network-error');
  await assert.rejects(
    api.startForegroundSession(body),
    (error) => error instanceof ApiError && error.isNetworkError,
  );
  setMockScenario('success');
});

test('documented session error statuses select only supported UI states', () => {
  const cases = [
    [400, 'invalid-observation'],
    [401, 'unauthenticated'],
    [403, 'inactive-tourist'],
    [404, 'no-place'],
    [409, 'ambiguous-place'],
    [422, 'proximity-lost'],
  ];
  for (const [status, phase] of cases) {
    const error = new ApiError('server message', { status });
    assert.equal(sessionErrorPhase(error), phase);
    assert.equal(error.status, status);
  }
  assert.equal(
    sessionErrorPhase(new ApiError('offline', { isNetworkError: true })),
    'network-error',
  );
});

test('session starts, recovery, and observation preserve paths, bodies, and AbortSignals', async () => {
  const calls = [];
  const response = { id: 9201, placeId: 17, status: 'STARTED' };
  const client = {
    delete: async () => response,
    get: async (path, options) => { calls.push({ options, path }); return response; },
    patch: async () => response,
    post: async (path, body, options) => { calls.push({ body, options, path }); return response; },
    put: async () => response,
  };
  const api = createVisitVerificationApi(client);
  const signal = new AbortController().signal;
  const startBody = {
    accuracyMeters: 4.2,
    latitude: 35.1,
    longitude: 128.1,
    observedAt: '2026-09-02T01:00:00Z',
    placeId: 17,
  };
  const observationBody = {
    accuracyMeters: 4.5,
    latitude: 35.2,
    longitude: 128.2,
    observedAt: '2026-09-02T01:00:15Z',
  };
  const foregroundBody = { ...observationBody };

  assert.equal(await api.startSession(startBody, signal), response);
  assert.equal(await api.startForegroundSession(foregroundBody, signal), response);
  assert.equal(await api.getSession(9201, signal), response);
  assert.equal(await api.submitObservation(9201, observationBody, signal), response);
  assert.deepEqual(calls, [
    { body: startBody, options: { signal }, path: '/visit-verification-sessions' },
    { body: foregroundBody, options: { signal }, path: '/visit-verification-sessions/foreground' },
    { options: { signal }, path: '/visit-verification-sessions/9201' },
    { body: observationBody, options: { signal }, path: '/visit-verification-sessions/9201/observations' },
  ]);
});

test('session mutations never retry and preserve request variables', async () => {
  const calls = [];
  const response = { id: 9201, status: 'IN_PROGRESS' };
  const api = {
    getSession: async (sessionId, signal) => { calls.push({ sessionId, signal, type: 'recover' }); return response; },
    startForegroundSession: async (value, signal) => { calls.push({ body: value, signal, type: 'foreground' }); return response; },
    startSession: async (body, signal) => { calls.push({ body, signal, type: 'start' }); return response; },
    submitObservation: async (sessionId, body, signal) => { calls.push({ body, sessionId, signal, type: 'observation' }); return response; },
  };
  const signal = new AbortController().signal;
  const body = { accuracyMeters: 3, latitude: 35, longitude: 128, observedAt: '2026-09-02T01:00:00Z' };
  const start = createStartSessionMutationOptions(api);
  const foreground = createStartForegroundSessionMutationOptions(api);
  const recover = createRecoverSessionMutationOptions(api);
  const observation = createObservationMutationOptions(api);

  assert.equal(start.retry, false);
  assert.equal(foreground.retry, false);
  assert.equal(recover.retry, false);
  assert.equal(observation.retry, false);
  await start.mutationFn({ body: { ...body, placeId: 17 }, signal });
  await foreground.mutationFn({ body, signal });
  await recover.mutationFn({ sessionId: 9201, signal });
  await observation.mutationFn({ body, sessionId: 9201, signal });
  assert.deepEqual(calls.map(({ type }) => type), [
    'start',
    'foreground',
    'recover',
    'observation',
  ]);
});

test('foreground recovery memory stores only the server session and clears on logout boundary', () => {
  const session = { id: 9201, placeId: 17, status: 'IN_PROGRESS' };
  rememberActiveForegroundVisitVerificationSession(session);
  assert.equal(getActiveForegroundVisitVerificationSession(), session);
  assert.equal('latitude' in getActiveForegroundVisitVerificationSession(), false);
  clearActiveForegroundVisitVerificationSession();
  assert.equal(getActiveForegroundVisitVerificationSession(), null);

  rememberActiveForegroundVisitVerificationSession({ ...session, status: 'COMPLETED' });
  assert.equal(getActiveForegroundVisitVerificationSession(), null);
});

test('server recommendation controls scheduling and only server terminal states stop observation', () => {
  const now = Date.parse('2026-09-02T01:00:00Z');
  assert.equal(observationDelayMs('2026-09-02T01:00:15Z', now), 15_000);
  assert.equal(observationDelayMs('2026-09-02T00:59:59Z', now), 0);
  assert.equal(observationDelayMs(null, now), null);
  assert.equal(isTerminalVisitVerificationSession({ status: 'IN_PROGRESS', remainingSeconds: 0 }), false);
  for (const status of ['PROXIMITY_LOST', 'COMPLETED', 'EXPIRED', 'REJECTED']) {
    assert.equal(isTerminalVisitVerificationSession({ status }), true);
  }
});

test('completed session updates only session detail and recent check-in caches', async () => {
  const calls = [];
  const queryClient = {
    invalidateQueries: async (value) => { calls.push(['invalidate', value.queryKey]); },
    setQueryData: (key, value) => { calls.push(['set', key, value]); },
  };
  const session = { id: 9201, placeId: 17, status: 'COMPLETED', completedCheckInId: 7002, reviewEligible: true };
  await applyVisitVerificationSessionResult(queryClient, session);

  assert.deepEqual(calls, [
    ['set', visitVerificationSessionQueryKeys.detail(9201), session],
    ['invalidate', ['v2', 'check-ins']],
  ]);
});

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

test('review count query requests one review and uses server totalElements', async () => {
  const calls = [];
  const response = { content: [], totalElements: 7 };
  const api = createVisitVerificationApi({
    delete: async () => response,
    get: async (path, options) => { calls.push({ options, path }); return response; },
    patch: async () => response,
    post: async () => response,
    put: async () => response,
  });
  const signal = new AbortController().signal;
  const options = createPlaceReviewsQueryOptions(17, undefined, api);

  assert.equal(await options.queryFn({ signal }), response);
  assert.deepEqual(calls, [{
    options: { params: { limit: 1, page: 1 }, signal },
    path: '/places/17/reviews',
  }]);
  assert.deepEqual(options.queryKey, ['v2', 'places', 'entity', 17, 'reviews', { limit: 1, page: 1 }]);
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

test('successful review submission refreshes place reviews and the current user review list', async () => {
  const invalidated = [];
  const queryClient = {
    invalidateQueries: async ({ queryKey }) => { invalidated.push(queryKey); },
  };

  await invalidateReviewQueries(queryClient, 17);

  assert.deepEqual(invalidated, [
    ['v2', 'places', 'entity', 17, 'reviews'],
    ['v2', 'users', 'me', 'reviews'],
  ]);
});

test('review draft limits photos, serializes multiple reasons, and never blocks text submission for local photos', () => {
  const photos = Array.from({ length: 4 }, (_, index) => ({ height: 10, width: 10, uri: `file://${index}` }));
  assert.equal(appendPhotos([], photos).length, 3);

  let reasons = [];
  for (const reason of RECOMMEND_REASONS) reasons = toggleReason(reasons, reason);
  assert.equal(reasons.length, 5);
  assert.equal(serializeRecommendReasons(reasons.slice(0, 2), (reason) => reason), 'kind, easyToFind');
  assert.deepEqual(selectReviewImageUrls([
    { height: 10, uri: 'file:///local.jpg', width: 10 },
    { height: 10, uri: 'https://cdn.example.com/1.jpg', width: 10 },
  ]), ['https://cdn.example.com/1.jpg']);
  assert.equal(validateReviewDraft({ content: 'Review', reasons: reasons.slice(0, 2) }), null);
  assert.equal(validateReviewDraft({ content: 'Review', reasons: reasons.slice(0, 1) }), null);
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
