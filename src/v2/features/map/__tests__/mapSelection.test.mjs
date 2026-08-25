import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MAP_DISMISSED_ZOOM_LEVEL,
  MAP_PREVIEW_ZOOM_LEVEL,
  markersForSelectedPlace,
} from '../model/mapSelection.ts';

const markers = [
  { id: '17', name: 'Legacy adapter marker' },
  { id: 'place:18', name: 'V2 adapter marker' },
  { id: '19', name: 'Another marker' },
];

test('a selected place hides every other marker for both migration marker ID formats', () => {
  assert.deepEqual(markersForSelectedPlace(markers, 17), [markers[0]]);
  assert.deepEqual(markersForSelectedPlace(markers, 18), [markers[1]]);
});

test('dismissing a place restores all markers and uses a closer Kakao zoom level', () => {
  assert.equal(markersForSelectedPlace(markers, null), markers);
  assert.ok(MAP_DISMISSED_ZOOM_LEVEL < MAP_PREVIEW_ZOOM_LEVEL);
});
