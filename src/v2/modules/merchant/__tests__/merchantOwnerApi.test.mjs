import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError } from '../../../shared/api/ApiError.ts';
import { createMerchantOwnerApi } from '../api/merchantOwnerApi.ts';

test('merchant transport preserves owner paths, nullable responses, bodies, paging and AbortSignal', async () => {
  const calls = [];
  const response = { description: null, reservationUrl: null };
  const client = Object.fromEntries(['get', 'post', 'put'].map(method => [method, async (...args) => {
    calls.push([method, ...args]);
    return response;
  }]));
  const api = createMerchantOwnerApi(client);
  const signal = new AbortController().signal;
  const options = { signal };
  const params = { page: 2, limit: 10 };
  const information = { description: null, websiteUrl: null };
  const schedule = { regularHours: [] };
  const offer = { title: 'fixture' };
  const results = await Promise.all([
    api.getProfile(signal), api.getPlaceDetail(17, signal), api.getPlaceInformation(17, signal),
    api.updatePlaceInformation(17, information, signal), api.getOperating(17, signal),
    api.updateOperatingSchedule(17, schedule, signal), api.getMedia(17, signal),
    api.listReviews(17, params, signal), api.listOffers(params, signal),
    api.createOffer(offer, signal), api.publishOffer(41, signal), api.closeOffer(41, signal),
  ]);
  assert.ok(results.every(value => value === response));
  assert.deepEqual(calls, [
    ['get', '/merchant-owner/me', options],
    ['get', '/merchant-owner/places/17', options],
    ['get', '/merchant-owner/places/17/information', options],
    ['put', '/merchant-owner/places/17/information', information, options],
    ['get', '/merchant-owner/places/17/operating', options],
    ['put', '/merchant-owner/places/17/operating-schedule', schedule, options],
    ['get', '/merchant-owner/places/17/media', options],
    ['get', '/places/17/reviews', { params, signal }],
    ['get', '/merchant-owner/offers', { params, signal }],
    ['post', '/merchant-owner/offers', offer, options],
    ['post', '/merchant-owner/offers/41/publish', undefined, options],
    ['post', '/merchant-owner/offers/41/close', undefined, options],
  ]);
});

test('merchant transport does not swallow owner permission errors or canceled requests', async () => {
  for (const error of [
    new ApiError('forbidden', { status: 403, code: 'ROLE_REQUIRED' }),
    new ApiError('missing', { status: 404 }),
    new ApiError('canceled', { code: 'ERR_CANCELED' }),
  ]) {
    const api = createMerchantOwnerApi({ get: async () => { throw error; } });
    await assert.rejects(api.getProfile(), value => value === error);
    await assert.rejects(api.getPlaceDetail(17), value => value === error);
  }
});
