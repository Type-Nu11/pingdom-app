import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (relativePath) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');

test('production Map route renders the V2-owned composition directly', () => {
  const navigator = read('../../../../app/navigation/MainNavigator.tsx');
  const screen = read('../screens/MapScreen.tsx');

  assert.match(navigator, /v2\/features\/map\/screens\/MapScreen/);
  assert.doesNotMatch(navigator, /features\/place\/screens\/MapScreen/);
  assert.match(screen, /usePlaceDetailPresentation/);
  assert.match(screen, /canQueryBookmarks/);
  assert.doesNotMatch(screen, /src\/features|features\/place|app\/store|FALLBACK_COORD/);
});

test('the V2 production map preserves route callbacks and duplicate reservation navigation guard', () => {
  const screen = read('../screens/MapScreen.tsx');

  assert.match(screen, /onClearOpenedBookmarkedPlace/);
  assert.match(screen, /onOpenReservation/);
  assert.match(screen, /onOpenVisitVerification/);
  assert.match(screen, /reservationNavigationLock\.current/);
  assert.match(screen, /registerAndroidBackOverride/);
  assert.match(screen, /pointerEvents=\{snapPoint === 'expanded' \? 'none' : 'auto'\}/);
});

test('map buttons expose immediate pressed-state feedback without delaying onPress', () => {
  const sheet = read('../components/MapBottomSheet.tsx');

  assert.match(sheet, /style=\{\(\{ pressed \}\) => \[styles\.navItem, pressed && styles\.pressed\]\}/);
  assert.match(sheet, /style=\{\(\{ pressed \}\) => \[styles\.previewBookmarkButton, pressed && styles\.pressed\]\}/);
  assert.match(sheet, /onPress=\{onPress\}/);
});

test('bookmark state changes do not recreate native marker payloads', () => {
  const screen = read('../screens/MapScreen.tsx');
  const adapter = read('../components/KakaoMapAdapter.tsx');
  const canvas = read('../components/MapCanvas.tsx');

  assert.doesNotMatch(screen, /applyBookmarkStateToMarkers/);
  assert.match(adapter, /markers=\{markers\}/);
  assert.doesNotMatch(adapter, /markers\.map/);
  assert.doesNotMatch(canvas, /markers\.map/);
});

test('the production place detail composes one V2 menu section with the selected numeric place id', () => {
  const bottomSheet = read('../components/MapBottomSheet.tsx');
  const occurrences = bottomSheet.match(/<PlaceMenuSection placeId=\{place\.id\} \/>/g) ?? [];

  assert.match(bottomSheet, /from ['"]\.\.\/\.\.\/place-menus['"]/);
  assert.equal(occurrences.length, 1);
});

test('map section changes do not fade the whole sheet or preserve expanded place content', () => {
  const screen = read('../screens/MapScreen.tsx');
  const bottomSheet = read('../components/MapBottomSheet.tsx');

  assert.doesNotMatch(screen, /<FadeSlideTransition/);
  assert.match(screen, /const openMapSection = useCallback/);
  assert.match(screen, /setContent\(\{ type: 'home' \}\)/);
  assert.match(screen, /jumpTo\('medium'\)/);
  assert.match(bottomSheet, /tintColor="#FFFFFF"/);
});

test('the drag target is larger than the visible handle without adding layout spacing', () => {
  const bottomSheet = read('../components/MapBottomSheet.tsx');

  assert.match(bottomSheet, /handleArea: \{[^}]*height: 20/);
  assert.match(bottomSheet, /handle: \{[^}]*height: 5[^}]*width: 56/);
  assert.match(bottomSheet, /handleGestureTarget: \{[\s\S]*?height: 44,[\s\S]*?position: 'absolute',[\s\S]*?width: 160/);
  assert.match(bottomSheet, /testID="map-sheet-handle-target"/);
});

test('the production map detail uses the compact Offer list before menus', () => {
  const screen = read('../screens/MapScreen.tsx');

  assert.match(screen, /<PlaceCouponCta[\s\S]*variant="compact"/);
});
