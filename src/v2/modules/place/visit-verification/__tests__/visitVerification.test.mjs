import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';

import { createVisitVerificationApi } from '../api/visitVerificationApi.ts';
import {
  createVisitVerificationMutationOptions,
  invalidateReviewQueries,
  primeSubmittedReviewQueries,
} from '../hooks/useSubmitVisitVerification.ts';
import { createPlaceReviewsQueryOptions } from '../hooks/usePlaceReviews.ts';
import {
  appendPhotos,
  RECOMMEND_REASONS,
  serializeRecommendReasons,
  reviewPhotoPart,
  toggleReason,
  selectCandidateImageUrls,
  uniquePlaceIdsInServerOrder,
  validateReviewDraft,
} from '../model/visitVerification.ts';
import { createInfiniteCheckInListQueryOptions } from '../../check-ins/hooks/useCheckIns.ts';
import { createCheckInApi } from '../../check-ins/api/checkInApi.ts';
import {
  applyVisitVerificationSessionResult,
  createObservationMutationOptions,
  createRecoverSessionMutationOptions,
  createStartForegroundSessionMutationOptions,
  createStartSessionMutationOptions,
} from '../hooks/useVisitVerificationSessionMutations.ts';
import {
  isTerminalVisitVerificationSession,
  clearActiveForegroundVisitVerificationSession,
  getActiveForegroundVisitVerificationSession,
  observationDelayMs,
  rememberActiveForegroundVisitVerificationSession,
  sessionErrorPhase,
  visitVerificationSessionQueryKeys,
} from '../model/visitVerificationSession.ts';
import { ApiError, mockApiClient, setMockScenario } from '../../../../shared/api/index.ts';
import {
  visitVerificationAlternatePolicyFixture,
  visitVerificationStartedFixture,
} from '../../../../shared/api/mock/features/visit-verification/fixtures.ts';

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
  const body = { recommendReasons: ['FRIENDLY'], reviewMediaIds: [], content: 'A real review.' };

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

test('successful review submission refreshes place reviews and the current user review list', async () => {
  const invalidated = [];
  const queryClient = {
    invalidateQueries: async ({ queryKey }) => { invalidated.push(queryKey); },
  };

  await invalidateReviewQueries(queryClient, 17);

  assert.deepEqual(invalidated, [
    ['v2', 'places', 'entity', 17, 'reviews'],
    ['v2', 'users', 'me', 'reviews'],
    ['v2', 'places', 'entity', 17, 'detail'],
    ['v2', 'places', 'entity', 17, 'verification-media'],
    ['v2', 'places', 'entity', 17, 'exploration-media'],
    ['v2', 'visit-verification-sessions'],
  ]);
});

test('successful review submission immediately primes place detail and my review count caches', () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(
    ['v2', 'users', 'me', 'reviews', { limit: 1, page: 1 }],
    { hasNext: false, limit: 1, page: 1, reviews: [], totalElements: 7, totalPages: 1 },
  );
  const review = {
    content: '방금 작성한 리뷰',
    createdAt: '2026-09-03T11:00:00Z',
    imageUrls: ['https://cdn.test/review.jpg'],
    placeId: 17,
    recommendReason: '친절해요, 깨끗해요',
    reviewId: 91,
  };

  queryClient.setQueryData(['v2', 'places', 'entity', 17, 'reviews', { limit: 20, page: 1 }], {content:[],size:20,totalElements:0});
  primeSubmittedReviewQueries(queryClient, review);

  assert.deepEqual(
    queryClient.getQueryData(['v2', 'places', 'entity', 17, 'reviews', { limit: 20, page: 1 }]).content,
    [review],
  );
  const mine = queryClient.getQueryData(
    ['v2', 'users', 'me', 'reviews', { limit: 1, page: 1 }],
  );
  assert.equal(mine.totalElements, 7); // My Page owns its response shape; invalidate instead of fabricating it.
  assert.deepEqual(mine.reviews, []);
});

test('review draft limits photos, serializes multiple reasons, and never blocks text submission for local photos', () => {
  const photos = Array.from({ length: 4 }, (_, index) => ({ height: 10, width: 10, uri: `file://${index}` }));
  assert.equal(appendPhotos([], photos).length, 3);

  let reasons = [];
  for (const reason of RECOMMEND_REASONS) reasons = toggleReason(reasons, reason);
  assert.equal(reasons.length, 5);
  assert.deepEqual(serializeRecommendReasons(reasons.slice(0, 2)), ['FRIENDLY', 'EASY_TO_FIND']);
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
    serverTotalElements: 2,
    totalPages: 1,
    hasNext: false,
  });
});


test('review reasons use stable server enums, reject unknown keys and preserve unique order', () => {
  assert.deepEqual(serializeRecommendReasons(['clean', 'kind', 'clean']), ['CLEAN', 'FRIENDLY']);
  for (const [key, value] of [['kind','FRIENDLY'], ['easyToFind','EASY_TO_FIND'], ['delicious','GOOD_FOOD'], ['multilingual','MULTILINGUAL_SUPPORT'], ['parking','PARKING'], ['photoSpot','PHOTO_SPOT'], ['clean','CLEAN']]) {
    assert.deepEqual(serializeRecommendReasons([key]), [value]);
  }
  for (const keys of [[], ['unknown'], RECOMMEND_REASONS]) assert.throws(() => serializeRecommendReasons(keys));
});

test('local review photos upload in order and create only the standard request', async () => {
  const calls = [];
  const options = createVisitVerificationMutationOptions({
    uploadReviewMedia: async (id, photo) => { calls.push(photo.uri); return { reviewMediaId: calls.length }; },
    cancelReviewMedia: async () => { assert.fail('connected media must not be cancelled'); },
    createReview: async (id, body) => { calls.push(body); return { reviewId: 91 }; },
  });
  await options.mutationFn({ placeId: 17, content: 'Review', reasons: ['kind', 'clean'], photos: [1,2,3].map(i => ({uri: `file://${i}.jpg`, mimeType:'image/jpeg', width:10, height:10})) });
  assert.deepEqual(calls, ['file://1.jpg','file://2.jpg','file://3.jpg', {content:'Review', recommendReasons:['FRIENDLY','CLEAN'], reviewMediaIds:[1,2,3]}]);
});


const reviewDraft = (count = 0) => ({ placeId: 17, content: 'Review', reasons: ['kind'], photos: Array.from({length:count}, (_,i) => ({uri:`file://${i}.jpg`,mimeType:'image/jpeg',width:10,height:10})) });
for (const count of [0,1,3]) test(`submission uploads ${count} photos and preserves returned ID order`, async () => {
  const uploaded = [], cancelled = [], phases = [];
  const api = {
    uploadReviewMedia: async (_, photo) => { uploaded.push(photo); return {reviewMediaId: 10 + uploaded.length}; },
    cancelReviewMedia: async (_, id) => cancelled.push(id),
    createReview: async (_, body) => { assert.deepEqual(body, {content:'Review',recommendReasons:['FRIENDLY'],reviewMediaIds: [11,12,13].slice(0,count)}); return {reviewId:91}; },
  };
  const options = createVisitVerificationMutationOptions(api, phase => phases.push(phase));
  assert.deepEqual(await options.mutationFn(reviewDraft(count)), {reviewId:91});
  assert.equal(uploaded.length,count);
  assert.deepEqual(cancelled,[]);
  assert.deepEqual(phases,count ? ['uploading','submitting','idle'] : ['submitting','idle']);
});
for (const failure of ['upload','create','cleanup']) test(`${failure} failure preserves original error, cleans unlinked media, and supports retry`, async () => {
  const original = new ApiError('original',{status:503});
  const cancelled = []; let uploads = 0; let creates = 0; let fail = true;
  const api = {
    uploadReviewMedia: async () => { uploads++; if(fail && failure==='upload' && uploads===2) throw original; return {reviewMediaId:uploads}; },
    cancelReviewMedia: async (_, id) => { cancelled.push(id); if(failure==='cleanup') throw new Error('cleanup'); },
    createReview: async () => { creates++; if(fail) throw original; return {reviewId:91}; },
  };
  const options = createVisitVerificationMutationOptions(api);
  const draft = reviewDraft(3); const before = structuredClone(draft);
  await assert.rejects(options.mutationFn(draft), error => error===original);
  assert.deepEqual(cancelled, failure==='upload' ? [1] : [1,2,3]);
  assert.equal(creates, failure==='upload' ? 0 : 1);
  assert.deepEqual(draft,before);
  fail=false;
  assert.deepEqual(await options.mutationFn(draft), {reviewId:91});
});
test('concurrent submission calls share the whole upload/create lock', async () => {
  let release; let uploads=0; let creates=0;
  const options=createVisitVerificationMutationOptions({
    uploadReviewMedia: async () => { uploads++; await new Promise(resolve => {release=resolve;}); return {reviewMediaId:1}; },
    cancelReviewMedia: async () => assert.fail('no cleanup on success'),
    createReview: async () => { creates++; return {reviewId:91}; },
  });
  const a=options.mutationFn(reviewDraft(1)); const b=options.mutationFn(reviewDraft(1));
  assert.equal(a,b); release(); await Promise.all([a,b]);
  assert.equal(uploads,1); assert.equal(creates,1);
});
test('photo descriptors normalize MIME and safe names without leaking local paths in format errors', () => {
  assert.deepEqual(reviewPhotoPart({uri:'file:///secret.jpg',mimeType:' IMAGE/JPG '}),{uri:'file:///secret.jpg',type:'image/jpeg',name:'review-photo.jpg'});
  assert.equal(reviewPhotoPart({uri:'file:///secret.png'}).type,'image/png');
  assert.equal(reviewPhotoPart({uri:'file:///secret',mimeType:'image/png',fileName:'../../photo.png'}).name,'photo.png');
  assert.throws(() => reviewPhotoPart({uri:'file:///private.heic',mimeType:'image/heic'}), error => error.status===415 && !error.message.includes('private'));
});

test('review media uses authenticated multipart file and 204 cancellation through the common client', async () => {
  const {createApiClient,configureApiAccessTokenProvider}=await import('../../../../shared/api/apiClient.ts');
  const { createRecordingApiTransport } = await import('../../../../shared/api/__tests__/support/recordingTransport.ts');
  const originalForm=globalThis.FormData;
  class NativeForm extends originalForm { parts=[]; append(key,value) {this.parts.push([key,value]);} }
  globalThis.FormData=NativeForm;
  const restore=configureApiAccessTokenProvider(()=>'test-token');
  const { client, requests: calls } = createRecordingApiTransport(config => ({
    data: config.method === 'delete' ? undefined : { reviewMediaId: 71 },
    status: config.method === 'delete' ? 204 : 201,
  }));
  try {
    const api=createVisitVerificationApi(client);
    assert.deepEqual(await api.uploadReviewMedia(17,{uri:'file:///private/photo.jpg',fileName:'photo.jpg',mimeType:'image/jpeg'}),{reviewMediaId:71});
    assert.equal(await api.cancelReviewMedia(17,71),undefined);
    assert.equal(calls[0].url,'/places/17/reviews/media');
    assert.equal(calls[0].headers.Authorization,'Bearer test-token');
    assert.ok(!String(calls[0].headers.get('Content-Type')).includes('application/json'));
    assert.deepEqual(calls[0].data.parts,[['file',{uri:'file:///private/photo.jpg',name:'photo.jpg',type:'image/jpeg'}]]);
    assert.equal(calls[1].url,'/places/17/reviews/media/71');
  } finally { restore();globalThis.FormData=originalForm; }
});
for(const status of [400,401,403,404,409,413,415,503]) test(`review media HTTP ${status} remains a common ApiError`,async()=>{
  const {createApiClient}=await import('../../../../shared/api/apiClient.ts');
  const failure={isAxiosError:true,message:'failure',response:{status,data:{code:'FAILED',message:'server detail'}}};
  const api=createVisitVerificationApi(createApiClient({delete:async()=>{throw failure;},post:async()=>{throw failure;}}));
  await assert.rejects(api.cancelReviewMedia(17,71),error=>error instanceof ApiError && error.status===status && error.code==='FAILED');
  await assert.rejects(api.uploadReviewMedia(17,{uri:'file:///photo.jpg',mimeType:'image/jpeg'}),error=>error instanceof ApiError && error.status===status && error.code==='FAILED');
});

test('priming a new review does not inject it into later pagination pages', () => {
  const client=new QueryClient();
  const key=['v2','places','entity',17,'reviews',{page:2,limit:20}];
  client.setQueryData(key,{content:[{reviewId:3}],totalElements:21});
  primeSubmittedReviewQueries(client,{reviewId:91,placeId:17,content:'New'});
  assert.deepEqual(client.getQueryData(key).content,[{reviewId:3}]);
});

test('invalid draft and unsupported photo fail before any upload or review creation', async () => {
  const options=createVisitVerificationMutationOptions({
    uploadReviewMedia: async()=>assert.fail('invalid input uploaded'),
    createReview: async()=>assert.fail('invalid input submitted'),
    cancelReviewMedia: async()=>assert.fail('nothing to cancel'),
  });
  for(const draft of [
    {...reviewDraft(),content:''}, {...reviewDraft(),content:'x'.repeat(2001)},
    {...reviewDraft(),reasons:[]}, {...reviewDraft(),reasons:['unknown']},
    {...reviewDraft(),reasons:RECOMMEND_REASONS}, reviewDraft(4),
    {...reviewDraft(),photos:[{uri:'file:///private.heic',mimeType:'image/heic'}]},
  ]) await assert.rejects(options.mutationFn(draft), error=>error instanceof ApiError);
});

test('snapshot includes multipart, cancel, standard fields and all declared error schemas', async () => {
  const {readFile}=await import('node:fs/promises');
  const doc=JSON.parse(await readFile(new URL('../../../../../../docs/api/place-exploration.openapi.json',import.meta.url),'utf8'));
  const upload=doc.paths['/places/{placeId}/reviews/media'].post;
  assert.deepEqual(upload.requestBody.content['multipart/form-data'].schema.required,['file']);
  for(const status of [201,400,401,403,404,413,415,503]) assert.ok(upload.responses[status]);
  const cancel=doc.paths['/places/{placeId}/reviews/media/{reviewMediaId}'].delete;
  assert.equal(cancel.responses[204].content,undefined);
  for(const status of [401,403,404,409]) assert.ok(cancel.responses[status]);
  const request=doc.components.schemas.PlaceReviewCreateRequest.properties;
  assert.equal(request.recommendReasons.maxItems,5);
  assert.equal(request.recommendReasons.minItems,1);
  assert.equal(request.reviewMediaIds.maxItems,3);
  assert.equal(request.content.maxLength,2000);
  assert.equal(request.recommendReason.deprecated,true);
  assert.equal(request.imageUrls.deprecated,true);
});

test('review success invalidates verification sessions only for the submitted place', async () => {
  const client=new QueryClient();
  const own=visitVerificationSessionQueryKeys.detail(1);
  const other=visitVerificationSessionQueryKeys.detail(2);
  client.setQueryData(own,{placeId:17}); client.setQueryData(other,{placeId:99});
  await invalidateReviewQueries(client,17);
  assert.equal(client.getQueryState(own).isInvalidated,true);
  assert.equal(client.getQueryState(other).isInvalidated,false);
});
