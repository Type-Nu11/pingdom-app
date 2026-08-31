import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createPlaceDetailApi } from '../../../features/place-detail/api/placeDetailApi.ts';
import { createPlaceAvailabilitiesQueryOptions } from '../../../features/place-detail/hooks/usePlaceDetail.ts';
import {
  buildPlaceDetailPresentation,
  selectReservationCta,
} from '../../../features/place-detail/model/placeDetailPresentation.ts';

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
  assert.ok(schemas.PagePlaceReviewResponse.properties.content.items.$ref.endsWith('/PlaceReviewResponse'));

  const expectedStatuses = new Map([
    ['/places/{id}', ['200', '401', '403', '404']],
    ['/places/{placeId}/card', ['200', '401', '403', '404']],
    ['/places/{id}/media/exploration', ['200', '401', '403']],
    ['/places/{placeId}/visit-decision', ['200', '401', '403', '404']],
    ['/places/{placeId}/operating-notices', ['200', '401', '403', '404']],
    ['/places/{placeId}/reviews', ['200', '401', '403']],
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
  assert.deepEqual(calls.map((call) => call.path), [
    '/places/70069',
    '/places/70069/availabilities',
  ]);
  assert.ok(calls.every((call) => call.options.signal === signal));
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

test('70069-shaped empty availability is a normal disabled state', () => {
  const result = buildPlaceDetailPresentation(70069, baseResources);
  assert.equal(result.name, '대구소프트웨어마이스터고등학교');
  assert.deepEqual(result.imageUrls, []);
  assert.equal(result.imageState, 'empty');
  assert.deepEqual(result.reservation, {
    kind: 'empty', disabled: true, message: '현재 예약 가능한 일정이 없습니다',
  });
  assert.equal(result.reviewState, 'empty');
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
  assert.equal(selectReservationCta(ready([active(1)]), now).kind, 'available');
  assert.equal(selectReservationCta(ready([active(0)]), now).kind, 'full');
  assert.equal(selectReservationCta(ready([
    { ...active(2), status: 'INACTIVE' },
    { ...active(2), endsAt: '2026-08-30T00:00:00Z' },
  ]), now).kind, 'empty');
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
