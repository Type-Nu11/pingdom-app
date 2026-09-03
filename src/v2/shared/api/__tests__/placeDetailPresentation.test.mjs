import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createPlaceDetailApi } from '../../../features/place-detail/api/placeDetailApi.ts';
import {
  createPlaceAvailabilitiesQueryOptions,
  createPlaceMenusQueryOptions,
} from '../../../features/place-detail/hooks/usePlaceDetail.ts';
import {
  buildPlaceDetailPresentation,
  selectReservationCta,
} from '../../../features/place-detail/model/placeDetailPresentation.ts';
import {
  formatPlaceMenuPrice,
  presentPlaceMenus,
} from '../../../features/place-detail/model/placeMenuPresentation.ts';

const ready = (data) => ({ data, error: null, isError: false, isPending: false });
const empty = ready(undefined);
const pending = { data: undefined, error: null, isError: false, isPending: true };
const failed = (status = 500) => ({
  data: undefined,
  error: { status },
  isError: true,
  isPending: false,
});

const detail = {
  id: 70069,
  name: '대구소프트웨어마이스터고등학교',
  englishName: null,
  address: '대구광역시 달성군',
  roadAddress: null,
  jibunAddress: null,
  postalCode: null,
  geocodingSource: 'KAKAO',
  operatingStatus: 'OPERATING',
  operatingStatusCheckedAt: null,
  currentlyOperating: true,
  currentlyOperatingCheckedAt: '2026-08-31T00:00:00Z',
  regularHours: [{ dayOfWeek: 'MONDAY', opensAt: '09:00:00', closesAt: '18:00:00' }],
  operatingExceptions: [],
  activeOperatingNotices: [],
  description: null,
  touristSummary: null,
  touristCategories: ['OTHER'],
  primaryInformationSource: 'ADMIN',
  informationVerificationStatus: 'ADMIN_VERIFIED',
  informationVerifiedAt: null,
  informationEvidenceUpdatedAt: null,
  verifiedEvidenceCount: 0,
  lastVerifiedAt: null,
  lastVerifiedSourceType: null,
  latitude: 35.0,
  longitude: 128.0,
  registrant: 'public-name',
  merchantOwner: null,
};

const baseResources = {
  availabilities: ready([]),
  card: ready({ ...detail, category: 'OTHER', imageUrl: null }),
  detail: ready(detail),
  media: ready({ placeId: 70069, media: [] }),
  menus: ready([]),
  notices: ready({ placeId: 70069, currentlyOperating: true, checkedAt: '', notices: [] }),
  reviews: ready({ content: [], totalElements: 0 }),
  visitDecision: ready({
    place: detail,
    merchantInformation: null,
    ongoingEvents: [],
    reservableAvailabilities: [],
    availableOffers: { offers: [] },
    checkedAt: '',
  }),
};

test('scoped live contract preserves place detail fields, nullable card image, pagination, and errors', async () => {
  const document = JSON.parse(await readFile(
    new URL('../../../../../docs/api/place-exploration.openapi.json', import.meta.url),
    'utf8',
  ));
  const schemas = document.components.schemas;
  const detailSchema = schemas.PlaceDetailResponse;
  assert.ok(detailSchema.required.includes('regularHours'));
  assert.ok(detailSchema.required.includes('merchantOwner'));
  assert.equal(detailSchema.properties.englishName.nullable, true);
  assert.equal(detailSchema.properties.roadAddress.nullable, true);
  assert.equal(detailSchema.properties.thumbnailUrl, undefined);
  assert.equal(detailSchema.properties.touristSupport, undefined);
  assert.equal(schemas.TouristPlaceCardResponse.properties.imageUrl.nullable, true);
  assert.equal(schemas.PlaceMenuResponse.properties.description.nullable, true);
  assert.equal(schemas.PlaceMenuResponse.properties.imageUrl.nullable, true);
  assert.deepEqual(schemas.PlaceMenuResponse.properties.currency.enum, [
    'KRW', 'USD', 'JPY', 'CNY', 'EUR',
  ]);
  assert.deepEqual(schemas.PlaceMenuResponse.properties.status.enum, [
    'AVAILABLE', 'SOLD_OUT', 'HIDDEN', 'INACTIVE',
  ]);
  assert.ok(schemas.PagePlaceReviewResponse.properties.content.items.$ref.endsWith('/PlaceReviewResponse'));

  const expectedStatuses = new Map([
    ['/places/{id}', ['200', '401', '403', '404']],
    ['/places/{placeId}/card', ['200', '401', '403', '404']],
    ['/places/{id}/media/exploration', ['200', '401', '403']],
    ['/places/{placeId}/visit-decision', ['200', '401', '403', '404']],
    ['/places/{placeId}/operating-notices', ['200', '401', '403', '404']],
    ['/places/{placeId}/reviews', ['200', '401', '403']],
    ['/places/{placeId}/menus', ['200', '401', '403', '404']],
    ['/places/{placeId}/availabilities', ['200', '401', '403']],
  ]);
  for (const [path, statuses] of expectedStatuses) {
    assert.deepEqual(Object.keys(document.paths[path].get.responses), statuses);
  }
});

test('place detail API uses live paths and forwards AbortSignal', async () => {
  const calls = [];
  const signal = new AbortController().signal;
  const client = {
    get: async (path, options) => { calls.push({ options, path }); return []; },
  };
  const api = createPlaceDetailApi(client);
  await api.getPlaceDetail(70069, signal);
  await api.getPlaceAvailabilities(70069, signal);
  await api.getPlaceMenus(70069, signal);
  assert.deepEqual(calls.map((call) => call.path), [
    '/places/70069',
    '/places/70069/availabilities',
    '/places/70069/menus',
  ]);
  assert.ok(calls.every((call) => call.options.signal === signal));
});

test('menu Query key contains place id and forwards TanStack AbortSignal', async () => {
  const signal = new AbortController().signal;
  let received;
  const options = createPlaceMenusQueryOptions(70069, {
    getPlaceMenus: async (placeId, querySignal) => {
      received = { placeId, querySignal };
      return [];
    },
  });
  assert.deepEqual(options.queryKey, ['v2', 'places', 'entity', 70069, 'menus']);
  assert.equal(options.staleTime, 5 * 60 * 1000);
  assert.deepEqual(await options.queryFn({ signal }), []);
  assert.deepEqual(received, { placeId: 70069, querySignal: signal });
});

test('menu presentation preserves server order, excludes administrative states, and formats currency', () => {
  const menus = presentPlaceMenus([
    { id: 2, placeId: 70069, name: 'Second from server', priceAmount: 12500, currency: 'KRW', status: 'SOLD_OUT', displayOrder: 20 },
    { id: 1, placeId: 70069, name: 'First by displayOrder', priceAmount: 8, currency: 'USD', status: 'AVAILABLE', displayOrder: 10 },
    { id: 3, placeId: 70069, name: 'Hidden', priceAmount: 1, currency: 'KRW', status: 'HIDDEN', displayOrder: 30 },
    { id: 4, placeId: 1, name: 'Wrong place', priceAmount: 1, currency: 'KRW', status: 'AVAILABLE', displayOrder: 40 },
  ], 70069);

  assert.deepEqual(menus.map((menu) => menu.id), [2, 1]);
  assert.equal(menus[0].status, 'SOLD_OUT');
  assert.match(formatPlaceMenuPrice(menus[0], 'ko-KR'), /12,500/);
  assert.match(formatPlaceMenuPrice(menus[1], 'en-US'), /8/);
  assert.equal(formatPlaceMenuPrice({ currency: null, priceAmount: 9000 }, 'ko-KR'), null);
});

test('nullable and malformed menu fields use safe presentation fallbacks', () => {
  const [menu] = presentPlaceMenus([{
    id: Number.NaN,
    placeId: 70069,
    name: '   ',
    description: null,
    priceAmount: Number.POSITIVE_INFINITY,
    currency: '',
    imageUrl: null,
    status: 'FUTURE_SERVER_STATUS',
  }], 70069);

  assert.deepEqual(menu, {
    currency: null,
    description: null,
    displayOrder: null,
    id: null,
    imageUrl: null,
    name: null,
    priceAmount: null,
    status: 'UNKNOWN',
  });
  assert.equal(formatPlaceMenuPrice(menu, 'ko-KR'), null);
});

test('menu loading, empty, ready, and error states remain independent from place detail', () => {
  assert.equal(buildPlaceDetailPresentation(70069, {
    ...baseResources, menus: pending,
  }).menuState, 'loading');
  assert.equal(buildPlaceDetailPresentation(70069, {
    ...baseResources, menus: failed(),
  }).menuState, 'error');
  assert.equal(buildPlaceDetailPresentation(70069, baseResources).menuState, 'empty');
  const readyResult = buildPlaceDetailPresentation(70069, {
    ...baseResources,
    menus: ready([{ id: 1, placeId: 70069, name: 'Menu', priceAmount: 1, currency: 'KRW', status: 'AVAILABLE', displayOrder: 1 }]),
  });
  assert.equal(readyResult.menuState, 'ready');
  assert.equal(readyResult.name, detail.name);
});

test('availability Query key contains place id and forwards TanStack AbortSignal', async () => {
  const signal = new AbortController().signal;
  let received;
  const options = createPlaceAvailabilitiesQueryOptions(70069, {
    getPlaceAvailabilities: async (placeId, querySignal) => {
      received = { placeId, querySignal };
      return [];
    },
  });
  assert.deepEqual(options.queryKey, ['v2', 'places', 'entity', 70069, 'availabilities']);
  assert.deepEqual(await options.queryFn({ signal }), []);
  assert.deepEqual(received, { placeId: 70069, querySignal: signal });
});

test('70069-shaped empty availability can open the reservation page without inventing slots', () => {
  const result = buildPlaceDetailPresentation(
    70069,
    baseResources,
    new Date('2026-08-31T02:34:00.000Z'),
  );
  assert.equal(result.name, '대구소프트웨어마이스터고등학교');
  assert.deepEqual(result.imageUrls, []);
  assert.equal(result.imageState, 'empty');
  assert.deepEqual(result.reservation, {
    kind: 'empty', disabled: false,
  });
  assert.equal(result.reviewState, 'empty');
  assert.equal('businessHours' in result, false);
  assert.deepEqual(result.operatingSummary, {
    kind: 'open', transitionDay: 'today', transitionTime: '18:00',
  });
});

test('presentation uses the latest server operating boolean and keeps notice text separate', () => {
  const result = buildPlaceDetailPresentation(70069, {
    ...baseResources,
    notices: ready({
      placeId: 70069,
      currentlyOperating: false,
      checkedAt: '2026-08-31T02:34:00Z',
      notices: [
        { noticeType: 'GENERAL', status: 'ACTIVE', visibleNow: true, message: '일반 공지' },
        { noticeType: 'HOURS_CHANGE', status: 'ACTIVE', visibleNow: true, message: '변경 영업시간' },
        { noticeType: 'TEMPORARY_CLOSURE', status: 'EXPIRED', visibleNow: true, message: '만료 공지' },
      ],
    }),
  }, new Date('2026-08-31T02:34:00.000Z'));

  assert.equal(result.operatingSummary.kind, 'closed');
  assert.equal(result.notice, '변경 영업시간');
  assert.notEqual(result.notice, result.operatingSummary.kind);
});

test('images are exploration-first, stable, clean, and de-duplicated before card fallback', () => {
  const resources = {
    ...baseResources,
    card: ready({ ...baseResources.card.data, imageUrl: 'https://cdn/card.jpg' }),
    media: ready({ placeId: 70069, media: [
      { id: 5, displayOrder: 2, imageUrl: 'https://cdn/b.jpg' },
      { id: 3, displayOrder: 1, imageUrl: ' https://cdn/a.jpg ' },
      { id: 4, displayOrder: 1, imageUrl: 'https://cdn/a.jpg' },
      { id: 6, displayOrder: 3, imageUrl: '' },
    ] }),
  };
  const result = buildPlaceDetailPresentation(70069, resources);
  assert.deepEqual(result.imageUrls, [
    'https://cdn/a.jpg', 'https://cdn/b.jpg', 'https://cdn/card.jpg',
  ]);
  assert.equal(result.imageState, 'ready');
});

test('availability requires ACTIVE, future end, and remaining capacity', () => {
  const now = new Date('2026-08-31T00:00:00Z');
  const active = (remainingCapacity) => ({
    placeId: 70069,
    status: 'ACTIVE',
    endsAt: '2026-09-01T00:00:00Z',
    remainingCapacity,
  });
  assert.deepEqual(selectReservationCta(ready([active(1)]), now), {
    kind: 'available', disabled: false,
  });
  assert.deepEqual(selectReservationCta(ready([active(0)]), now), {
    kind: 'full', disabled: false,
  });
  assert.deepEqual(selectReservationCta(ready([
    { ...active(2), status: 'INACTIVE' },
    { ...active(2), endsAt: '2026-08-30T00:00:00Z' },
  ]), now), {
    kind: 'empty', disabled: false,
  });
  assert.equal(selectReservationCta(pending, now).kind, 'loading');
  assert.equal(selectReservationCta(failed(401), now).kind, 'auth-error');
  assert.equal(selectReservationCta(failed(), now).kind, 'error');
});

test('partial failures remain section-specific and stale place resources are ignored', () => {
  const result = buildPlaceDetailPresentation(70069, {
    ...baseResources,
    card: failed(),
    media: failed(),
    reviews: failed(),
    visitDecision: ready({ ...baseResources.visitDecision.data, place: { ...detail, id: 1 } }),
  });
  assert.equal(result.name, detail.name);
  assert.equal(result.imageState, 'error');
  assert.equal(result.reviewState, 'error');
  assert.deepEqual(result.coupons, []);
});

test('card-only partial success preserves a status-only operating summary', () => {
  const result = buildPlaceDetailPresentation(70069, {
    ...baseResources,
    card: ready({
      ...baseResources.card.data,
      activeOperatingNotices: undefined,
      operatingExceptions: undefined,
      regularHours: undefined,
    }),
    detail: failed(),
    notices: failed(),
    visitDecision: failed(),
  }, new Date('2026-08-31T02:34:00.000Z'));

  assert.deepEqual(result.operatingSummary, {
    kind: 'open', transitionDay: null, transitionTime: null,
  });
});

test('place-scoped reviews retain omitted placeId and derive a missing total from visible items', () => {
  const result = buildPlaceDetailPresentation(70069, {
    ...baseResources,
    reviews: ready({
      content: [
        { id: 1, content: '경로로 식별된 리뷰', imageUrls: [] },
        { id: 2, placeId: 70069, content: '일치 리뷰', imageUrls: [] },
        { id: 3, placeId: 1, content: '다른 장소 리뷰', imageUrls: [] },
      ],
    }),
  });

  assert.deepEqual(result.reviews.map((review) => review.text), [
    '경로로 식별된 리뷰', '일치 리뷰',
  ]);
  assert.equal(result.reviewTotal, 2);
});
