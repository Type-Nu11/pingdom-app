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

test('opening reservations retains the selected place after its availability was confirmed', () => {
  const screen = read('../screens/MapScreen.tsx');

  assert.match(screen, /reservationEntryPlace \?\? selectedPlace/);
  assert.match(screen, /selectedPlacePresentation\?\.reservation\.kind === 'available'[\s\S]*?selectedPlace/);
  assert.match(screen, /setReservationEntryPlace/);
  assert.match(screen, /mapSection === 'reservations'[\s\S]*?useNearbyReservablePlaceIds/);
  assert.match(screen, /NEARBY_RESERVATION_CANDIDATE_LIMIT/);
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

test('expanded sheet stops below the search header and temporarily hides map categories', () => {
  const screen = read('../screens/MapScreen.tsx');
  const expandedTop = screen.match(/const expandedSheetTop =[\s\S]*?;/)?.[0] ?? '';

  assert.match(expandedTop, /MAP_TOP_OVERLAY_METRICS\.headerHeight/);
  assert.doesNotMatch(expandedTop, /insets\.top/);
  assert.doesNotMatch(expandedTop, /categoryHeight/);
  assert.match(screen, /showCategories=\{snapPoint !== 'expanded'\}/);
});

test('resting map content disables vertical scrolling while preserving nested horizontal lists', () => {
  const bottomSheet = read('../components/MapBottomSheet.tsx');

  assert.match(bottomSheet, /testID="expanded-home-scroll"/);
  assert.match(bottomSheet, /scrollEnabled=\{expandedInteractionsEnabled\}/);
  assert.match(bottomSheet, /scrollRef\.current\?\.scrollTo\(\{ animated: false, y: 0 \}\)/);
  assert.match(bottomSheet, /<ScrollView[\s\S]*?horizontal[\s\S]*?nestedScrollEnabled/);
});

test('the small visible handle keeps resting sheet content available as a drag surface', () => {
  const bottomSheet = read('../components/MapBottomSheet.tsx');

  assert.match(bottomSheet, /handleArea: \{[^}]*height: 20/);
  assert.match(bottomSheet, /handle: \{[^}]*height: 5[^}]*width: 56/);
  assert.match(bottomSheet, /\{\.\.\.panHandlers\}[\s\S]*?testID="map-sheet-handle-target"/);
  assert.match(bottomSheet, /\{\.\.\.\(snapPoint === 'expanded' \? \{\} : panHandlers\)\}/);
  assert.doesNotMatch(bottomSheet, /hitSlop=\{content\.type === 'place-preview'/);
  assert.doesNotMatch(bottomSheet, /handleGestureTarget/);
  assert.match(bottomSheet, /testID="map-sheet-handle-target"/);
});

test('place preview keeps header actions tappable and aligns category beside the title', () => {
  const bottomSheet = read('../components/MapBottomSheet.tsx');

  assert.match(bottomSheet, /<View style=\{styles\.previewHeader\}>/);
  assert.match(bottomSheet, /previewTitleRow: \{ alignItems: 'center', flexDirection: 'row'/);
  assert.match(bottomSheet, /BookmarkStar selected=\{bookmarked\} size=\{22\} strokeColor="#5E616A"/);
  assert.match(bottomSheet, /t\('map\.detail\.verifiedCount'/);
});

test('place actions retain selection across sheet expansion and expanded detail removes every radius', () => {
  const bottomSheet = read('../components/MapBottomSheet.tsx');

  assert.match(bottomSheet, /activePreviewAction/);
  assert.match(bottomSheet, /previewActionChipActive: \{ backgroundColor: '#FFF0F4'/);
  assert.match(bottomSheet, /activeAction=\{activePreviewAction\}/);
  assert.match(bottomSheet, /borderBottomLeftRadius: isExpandedPlaceDetail \? 0/);
  assert.match(bottomSheet, /borderBottomRightRadius: isExpandedPlaceDetail \? 0/);
  assert.match(bottomSheet, /cornerRadius=\{isExpandedPlaceDetail \? 0 : 34\}/);
});

test('the production map detail uses the compact Offer list before menus', () => {
  const screen = read('../screens/MapScreen.tsx');

  assert.match(screen, /<PlaceCouponCta[\s\S]*variant="compact"/);
});

test('expanded place detail keeps the design photo ratio, short tab accent, and section bands', () => {
  const bottomSheet = read('../components/MapBottomSheet.tsx');
  const coupon = read('../../offers-coupons/components/PlaceCouponCta.tsx');
  const menu = read('../../place-menus/components/PlaceMenuSection.tsx');

  assert.match(bottomSheet, /detailPhoto: \{[^}]*height: 180[^}]*width: 180/);
  assert.match(bottomSheet, /detailPhotoPrimary: \{[^}]*width: 242/);
  assert.match(bottomSheet, /detailTabIndicator: \{[^}]*height: 2[^}]*width: 40/);
  assert.doesNotMatch(bottomSheet, /detailInfoBlock: \{[^}]*borderBottom/);
  assert.match(coupon, /const CompactSection = styled\.View`[^`]*border-top-width: 8px/);
  assert.doesNotMatch(coupon, /const CompactSection = styled\.View`[^`]*border-bottom-width/);
  assert.match(menu, /const Section = styled\.View`[^`]*border-top-width: 8px/);
  assert.doesNotMatch(menu, /const Section = styled\.View`[^`]*border-bottom-width/);
});
