import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';

import { ApiError, getApiErrorUx } from '../index.ts';
import { createPlaceMenuApi } from '../../../features/place-menus/api/placeMenuApi.ts';
import {
  createPlaceMenusQueryOptions,
  isValidPlaceMenuId,
  placeMenuQueryKeys,
} from '../../../features/place-menus/hooks/usePlaceMenus.ts';
import {
  formatPlaceMenuPrice,
  selectPlaceMenus,
} from '../../../features/place-menus/model/placeMenuPresentation.ts';

const menu = (overrides = {}) => ({
  id: 1,
  placeId: 17,
  name: 'Menu one',
  description: null,
  priceAmount: 0,
  currency: 'KRW',
  imageUrl: null,
  status: 'AVAILABLE',
  displayOrder: 1,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
  ...overrides,
});

test('menu API uses exactly GET /places/{placeId}/menus and forwards AbortSignal', async () => {
  const calls = [];
  const response = [menu()];
  const client = {
    get: async (path, options) => { calls.push({ path, options }); return response; },
  };
  const signal = new AbortController().signal;
  const result = await createPlaceMenuApi(client).listPlaceMenus(17, signal);

  assert.equal(result, response);
  assert.deepEqual(calls, [{ path: '/places/17/menus', options: { signal } }]);
});

test('menu API preserves 200 empty lists and common ApiError identities for 401, 403, and 404', async () => {
  assert.deepEqual(await createPlaceMenuApi({ get: async () => [] }).listPlaceMenus(17), []);
  for (const status of [401, 403, 404]) {
    const expected = new ApiError(`HTTP ${status}`, { status });
    const api = createPlaceMenuApi({ get: async () => { throw expected; } });
    await assert.rejects(api.listPlaceMenus(17), (error) => error === expected);
  }
  assert.equal(getApiErrorUx(new ApiError('expired', {
    code: 'EXPIRED_TOKEN', status: 401,
  })).kind, 'authentication');
  assert.equal(getApiErrorUx(new ApiError('denied', {
    code: 'ACCESS_DENIED', status: 403,
  })).kind, 'authorization');
});

test('menu query keys scope data and failures per place and queryFn forwards cancellation', async () => {
  assert.notDeepEqual(placeMenuQueryKeys.list(17), placeMenuQueryKeys.list(18));
  assert.deepEqual(placeMenuQueryKeys.list(17), ['v2', 'places', 'entity', 17, 'menus']);
  assert.equal(isValidPlaceMenuId(17), true);
  for (const value of [0, -1, 1.2, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(isValidPlaceMenuId(value), false);
  }

  const calls = [];
  const api = { listPlaceMenus: async (id, signal) => { calls.push([id, signal]); return [menu({ id })]; } };
  const signal = new AbortController().signal;
  await createPlaceMenusQueryOptions(17, api).queryFn({ signal });
  assert.deepEqual(calls, [[17, signal]]);

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await queryClient.fetchQuery(createPlaceMenusQueryOptions(17, api));
  const place18Error = new ApiError('not found', { status: 404 });
  await assert.rejects(queryClient.fetchQuery(createPlaceMenusQueryOptions(18, {
    listPlaceMenus: async () => { throw place18Error; },
  })), (error) => error === place18Error);
  assert.equal(queryClient.getQueryData(placeMenuQueryKeys.list(17))[0].id, 17);
  assert.equal(queryClient.getQueryData(placeMenuQueryKeys.list(18)), undefined);
});

test('presentation preserves server order and input while accepting zero and all contract currencies', () => {
  const source = ['KRW', 'USD', 'JPY', 'CNY', 'EUR'].map((currency, index) =>
    menu({ id: index + 1, currency, displayOrder: 5 - index, priceAmount: index === 0 ? 0 : 1234567 }));
  const before = structuredClone(source);
  const result = selectPlaceMenus(source);

  assert.deepEqual(result.map((item) => item.id), [1, 2, 3, 4, 5]);
  assert.equal(result[0].priceAmount, 0);
  assert.deepEqual(source, before);
  for (const item of result) {
    assert.equal(
      formatPlaceMenuPrice(item.priceAmount, item.currency, 'ko'),
      new Intl.NumberFormat('ko-KR', { currency: item.currency, style: 'currency' })
        .format(item.priceAmount),
    );
  }
});

test('presentation safely filters private or malformed records without inventing status, currency, or IDs', () => {
  const longName = 'A'.repeat(200);
  const longDescription = 'B'.repeat(500);
  const input = [
    menu({ id: 11, name: longName, description: longDescription }),
    menu({ id: 12, status: 'SOLD_OUT', imageUrl: null }),
    menu({ id: 13, status: 'HIDDEN' }),
    menu({ id: 14, status: 'INACTIVE' }),
    menu({ id: undefined }),
    menu({ id: 15, name: undefined }),
    menu({ id: 16, status: 'UNKNOWN' }),
    menu({ id: 17, currency: 'GBP' }),
    menu({ id: 18, priceAmount: undefined }),
  ];
  const result = selectPlaceMenus(input);

  assert.deepEqual(result.map((item) => item.id), [11, 12, 17, 18]);
  assert.equal(result[0].name, longName);
  assert.equal(result[0].description, longDescription);
  assert.equal(result[2].currency, null);
  assert.equal(result[3].priceAmount, null);
  assert.equal(formatPlaceMenuPrice(100, null, 'en'), null);
});

test('canonical menu snapshot records deployed security, statuses, and optional response fields', async () => {
  const contract = JSON.parse(await readFile('docs/api/place-menus.openapi.json', 'utf8'));
  const operation = contract.paths['/places/{placeId}/menus'].get;
  assert.deepEqual(operation.security, [{ bearerAuth: [] }]);
  assert.deepEqual(Object.keys(operation.responses).sort(), ['200', '401', '403', '404']);
  assert.equal(operation.responses['200'].content['*/*'].schema.type, 'array');
  assert.equal(contract.components.schemas.PlaceMenuResponse.required, undefined);
});
