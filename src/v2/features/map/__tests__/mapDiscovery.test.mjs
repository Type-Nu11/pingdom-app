import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createViewport,
  toPlaceCardViewModel,
  toPlaceResults,
  toViewportMarkers,
} from '../model/mapDiscovery.ts';

test('map viewport is derived from center and radius using valid server bounds', () => {
  const viewport = createViewport({ lat: 37.5, lng: 127 }, 3, 15);
  assert.equal(viewport.zoom, 15);
  assert.ok(viewport.west < 127 && viewport.east > 127);
  assert.ok(viewport.south < 37.5 && viewport.north > 37.5);
  assert.deepEqual(viewport, createViewport({ lat: 37.5, lng: 127 }, 3, 15));
});

test('viewport mapper uses only valid server markers and tolerates unknown categories', () => {
  const markers = toViewportMarkers({
    mode: 'FUTURE_MODE',
    markers: [
      { placeId: 1, name: 'Cafe', category: 'CAFE', latitude: 37.5, longitude: 127 },
      { placeId: 2, name: 'Future', category: 'NEW_ENUM', latitude: 37.6, longitude: 127.1 },
      { placeId: 3, name: 'Invalid', category: 'FOOD', latitude: null, longitude: 127.2 },
    ],
    clusters: [],
  });
  assert.deepEqual(markers.map(({ category, placeId }) => ({ category, placeId })), [
    { category: 'food', placeId: 1 },
    { category: 'etc', placeId: 2 },
  ]);
});

test('place and card mappers tolerate optional and nullable server fields', () => {
  const results = toPlaceResults({ places: [
    { id: 17, name: 'Place', latitude: 35.18, longitude: 128.1, roadAddress: null },
    { id: undefined, name: 'Invalid', latitude: 0, longitude: 0 },
  ] });
  const card = toPlaceCardViewModel({
    id: 17, name: 'Place', address: 'Address', roadAddress: null,
    category: null, currentlyOperating: true, imageUrl: 'https://cdn.example.test/places/17.jpg',
    touristSummary: null,
  }, undefined, {
    placeId: 17, currentlyOperating: false, checkedAt: '2026-08-13T00:00:00Z',
    notices: [{ message: 'Temporary notice', visibleNow: true }],
  }, 120);
  assert.equal(results.length, 1);
  assert.equal(results[0].address, '');
  assert.deepEqual(card, {
    address: 'Address', category: 'OTHER', currentlyOperating: false, distanceMeters: 120,
    id: 17, imageUrl: 'https://cdn.example.test/places/17.jpg',
    imageUrls: ['https://cdn.example.test/places/17.jpg'], name: 'Place',
    notice: 'Temporary notice', reservable: false, summary: null, supportTags: [],
  });
});
