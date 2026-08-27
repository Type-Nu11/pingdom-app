import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  ISSUE_262_STATUS,
  PRODUCTION_ROOT_POLICY,
  PRODUCTION_ROUTE_PARITY,
  PROTECTED_ROUTE_FLOWS,
} from '../../../application/migration/routeParity.ts';
import {
  canDeliverProtectedIntent,
  resolveProductionRootState,
} from '../../../application/navigation/runtimeState.ts';
import {
  claimDeepLinkEvent,
  DEEP_LINK_EVENT_DEDUPE_WINDOW_MS,
} from '../../../application/navigation/deepLinkDedupe.ts';
import { createOnboardingCompletion } from '../../../v2/features/onboarding-entry/model/onboardingEntry.ts';

const completed = {
  completion: createOnboardingCompletion({ birthYear: 2000, country: 'KR', language: 'ko' }),
  kind: 'completed',
};

test('production root gates auth and onboarding hydration without flicker', () => {
  assert.equal(resolveProductionRootState(true, false, { kind: 'incomplete' }), 'loading');
  assert.equal(resolveProductionRootState(false, false, { kind: 'hydrating' }), 'loading');
  assert.equal(resolveProductionRootState(false, false, { kind: 'incomplete' }), 'onboarding');
  assert.equal(resolveProductionRootState(false, false, completed), 'auth');
  assert.equal(resolveProductionRootState(false, true, completed), 'main');
});

test('logout and refresh failure clear the protected root without clearing onboarding completion', () => {
  assert.equal(resolveProductionRootState(false, true, completed), 'main');
  assert.equal(resolveProductionRootState(false, false, completed), 'auth');
  assert.equal(completed.kind, 'completed');
});

test('pending notification and deep-link intents wait for hydration and navigation readiness', () => {
  assert.equal(canDeliverProtectedIntent('loading', true), false);
  assert.equal(canDeliverProtectedIntent('auth', true), false);
  assert.equal(canDeliverProtectedIntent('main', false), false);
  assert.equal(canDeliverProtectedIntent('main', true), true);
});

test('consecutive duplicate callbacks for one deep-link open event are collapsed', () => {
  const url = 'pingdom://places/17';
  const first = claimDeepLinkEvent(url, 1_000, null);

  assert.deepEqual(first, { receivedAt: 1_000, url });
  assert.equal(
    claimDeepLinkEvent(url, 1_000 + DEEP_LINK_EVENT_DEDUPE_WINDOW_MS, first),
    null,
  );
});

test('the same deep link can be opened normally after the short dedupe window', () => {
  const url = 'pingdom://places/17';
  const first = claimDeepLinkEvent(url, 1_000, null);
  const receivedAt = 1_001 + DEEP_LINK_EVENT_DEDUPE_WINDOW_MS;

  assert.deepEqual(claimDeepLinkEvent(url, receivedAt, first), { receivedAt, url });
  assert.deepEqual(
    claimDeepLinkEvent('pingdom://settings', 1_010, first),
    { receivedAt: 1_010, url: 'pingdom://settings' },
  );
});

test('required protected route flows return to Map and Profile/Settings are explicit bridges', () => {
  assert.deepEqual(PROTECTED_ROUTE_FLOWS.reservation, [
    'Map', 'Map.PlaceDetail', 'CreateReservation', 'ReservationDetail', 'Map',
  ]);
  assert.deepEqual(PROTECTED_ROUTE_FLOWS.visitVerification, [
    'Map', 'VisitVerificationPlaces', 'VisitVerificationReview', 'Map',
  ]);

  for (const route of ['Profile', 'Settings/Logout']) {
    assert.equal(
      PRODUCTION_ROUTE_PARITY.find((entry) => entry.route === route)?.status,
      'COMPOSITION_BRIDGE',
    );
  }

  assert.deepEqual(
    PRODUCTION_ROUTE_PARITY.find((entry) => entry.route === 'Profile')?.removalIssues,
    ['#227', '#231'],
  );
  assert.deepEqual(
    PRODUCTION_ROUTE_PARITY.find((entry) => entry.route === 'Settings/Logout')?.removalIssues,
    ['#228', '#229', '#230'],
  );
});

test('production entrypoint has one composition root with no mock or implicit V1 root fallback', () => {
  const appSource = readFileSync(new URL('../../../../App.tsx', import.meta.url), 'utf8');
  const v2AliasSource = readFileSync(new URL('../../../../App.v2.tsx', import.meta.url), 'utf8');

  assert.equal(PRODUCTION_ROOT_POLICY.hasImplicitV1RootFallback, false);
  assert.match(appSource, /src\/application\/ProductionApp/);
  assert.doesNotMatch(appSource, /App\.v1|V1App|mock/i);
  assert.match(v2AliasSource, /src\/application\/ProductionApp/);
  assert.doesNotMatch(v2AliasSource, /isLoggedIn\s*\?|V1App|V2App/);
  assert.equal(PRODUCTION_ROUTE_PARITY.some((entry) => entry.status === 'MISSING'), false);
  assert.deepEqual(ISSUE_262_STATUS, {
    bridgeFreeStandaloneV2: 'incomplete',
    codeCompositionRootCutover: 'complete',
    iosBuild: 'incomplete-pods',
    physicalDeviceQa: 'incomplete',
    wholeIssue: 'incomplete',
  });
});
