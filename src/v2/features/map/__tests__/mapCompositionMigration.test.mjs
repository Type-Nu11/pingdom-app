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
});

test('the production place detail composes one V2 menu section with the selected numeric place id', () => {
  const bottomSheet = read('../components/MapBottomSheet.tsx');
  const occurrences = bottomSheet.match(/<PlaceMenuSection placeId=\{place\.id\} \/>/g) ?? [];

  assert.match(bottomSheet, /from ['"]\.\.\/\.\.\/place-menus['"]/);
  assert.equal(occurrences.length, 1);
});
