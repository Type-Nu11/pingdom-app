import assert from 'node:assert/strict';
import test from 'node:test';

import { createPlaceExplorationApi } from '../../../features/place-exploration/api/placeExplorationApi.ts';

test('place exploration API uses current server paths, identifiers, viewport params, and signals', async () => {
  const calls = [];
  const response = { contract: 'response' };
  const client = {
    get: async (path, options) => {
      calls.push({ method: 'GET', options, path });
      return response;
    },
    patch: async () => response,
    post: async (path, body, options) => {
      calls.push({ body, method: 'POST', options, path });
      return response;
    },
    put: async () => response,
  };
  const api = createPlaceExplorationApi(client);
  const signal = new AbortController().signal;
  const viewport = {
    west: 126.8,
    south: 37.4,
    east: 127.2,
    north: 37.7,
    zoom: 14,
    ignoredRuntimeField: 'must-not-reach-server',
  };
  const conversion = {
    linkType: 'DIRECTIONS',
    provider: 'KAKAO',
    requestId: 'request/with space',
  };

  const results = await Promise.all([
    api.getMapViewport(viewport, signal),
    api.getPlaceCard(17, signal),
    api.getPlaceVisitDecision(17, signal),
    api.getPlaceOperatingNotices(17, signal),
    api.getPlaceVerificationMedia(18, signal),
    api.getRecommendationExplanation('request/with space', signal),
    api.recordMapLinkConversion(17, conversion, signal),
  ]);

  assert.ok(results.every((result) => result === response));
  assert.deepEqual(calls.map(({ method, path }) => `${method} ${path}`), [
    'GET /places/map',
    'GET /places/17/card',
    'GET /places/17/visit-decision',
    'GET /places/17/operating-notices',
    'GET /places/18/media/verification',
    'GET /places/recommendations/request%2Fwith%20space/explanation',
    'POST /places/17/map-link-conversions',
  ]);
  assert.deepEqual(calls[0].options.params, {
    west: viewport.west,
    south: viewport.south,
    east: viewport.east,
    north: viewport.north,
    zoom: viewport.zoom,
  });
  assert.ok(calls.every(({ options }) => options.signal === signal));
  assert.equal(calls[6].body, conversion);
});
