import { DEFAULT_MAP_CENTER, MAP_DISMISSED_ZOOM_LEVEL, MAP_LOCATE_ZOOM_LEVEL, MAP_PREVIEW_ZOOM_LEVEL, selectMapCameraCenter } from '../camera/model/mapCamera.ts';
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  markersForSelectedPlace,
} from '../selection/model/mapSelection.ts';

const markers = [
  { id: '17', name: 'Legacy adapter marker' },
  { id: 'place:18', name: 'V2 adapter marker' },
  { id: '19', name: 'Another marker' },
];

test('a selected place hides every other marker for both migration marker ID formats', () => {
  assert.deepEqual(markersForSelectedPlace(markers, 17), [markers[0]]);
  assert.deepEqual(markersForSelectedPlace(markers, 18), [markers[1]]);
});

test('dismissing a place restores all markers and uses a closer map zoom level', () => {
  assert.equal(markersForSelectedPlace(markers, null), markers);
  assert.ok(MAP_DISMISSED_ZOOM_LEVEL < MAP_PREVIEW_ZOOM_LEVEL);
});

test('locating the user zooms closer than a place preview', () => {
  assert.ok(MAP_PREVIEW_ZOOM_LEVEL < MAP_LOCATE_ZOOM_LEVEL);
});


test('camera keeps user following, selected-place offset, and dismissed-center precedence', () => {
  const input = { isFollowingUser: false, focusedPlace: { latitude: 37.5, longitude: 127 }, designScale: 2,
    dismissedMarkerCenter: { lat: 35, lng: 128 }, center: { lat: 36, lng: 129 } };
  assert.deepEqual(selectMapCameraCenter(input), { lat: 37.5 - 0.00072 * 2, lng: 127 });
  assert.deepEqual(selectMapCameraCenter({ ...input, isFollowingUser: true }), { lat: 35, lng: 128 });
  assert.deepEqual(selectMapCameraCenter({ ...input, focusedPlace: null, dismissedMarkerCenter: null }), { lat: 36, lng: 129 });
  assert.deepEqual(selectMapCameraCenter({ ...input, focusedPlace: null, dismissedMarkerCenter: null, center: null }), DEFAULT_MAP_CENTER);
});
