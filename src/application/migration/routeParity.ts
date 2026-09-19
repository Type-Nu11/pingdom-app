export type RouteParityStatus = 'COMPOSITION_BRIDGE' | 'MISSING' | 'REMOVE' | 'V2_READY';
export type FollowUpIssue = `#${number}`;

export type RouteParityEntry = Readonly<{
  activeImplementation: string;
  removalIssues?: readonly FollowUpIssue[];
  route: string;
  status: RouteParityStatus;
}>;

/** Executable counterpart of docs/v2-production-entrypoint-migration.md. */
export const PRODUCTION_ROUTE_PARITY: readonly RouteParityEntry[] = [
  { activeImplementation: 'src/features/onboarding', removalIssues: ['#124', '#139'], route: 'Onboarding', status: 'COMPOSITION_BRIDGE' },
  { activeImplementation: 'src/features/onboarding + src/features/auth', removalIssues: ['#124', '#139'], route: 'AuthLanding/Login/Signup', status: 'COMPOSITION_BRIDGE' },
  { activeImplementation: 'src/v2/modules/place/map', removalIssues: [], route: 'Map/Search/Category/PlaceDetail', status: 'V2_READY' },
  { activeImplementation: 'src/v2/modules/place/map', removalIssues: [], route: 'Favorites/Recommendations', status: 'V2_READY' },
  { activeImplementation: 'src/v2/modules/place/map + src/v2/modules/booking/reservations', removalIssues: [], route: 'ReservationList', status: 'V2_READY' },
  { activeImplementation: 'src/v2/modules/booking/reservations/screens/CreateReservationScreen.tsx', route: 'CreateReservation', status: 'V2_READY' },
  { activeImplementation: 'src/v2/modules/booking/reservations/screens/ReservationDetailScreen.tsx', route: 'ReservationDetail/Payment', status: 'V2_READY' },
  { activeImplementation: 'src/v2/modules/place/visit-verification', route: 'VisitVerification/Review', status: 'V2_READY' },
  { activeImplementation: 'src/features/place/screens/CheckInScreen.tsx', removalIssues: ['#124', '#139'], route: 'CheckIn', status: 'COMPOSITION_BRIDGE' },
  { activeImplementation: 'src/v2/modules/user/profile/my-page', route: 'CouponBox', status: 'V2_READY' },
  { activeImplementation: 'src/v2/modules/user/profile/my-page', removalIssues: [], route: 'Profile', status: 'V2_READY' },
  { activeImplementation: 'src/v2/modules/merchant', removalIssues: [], route: 'MyPage(MERCHANT_OWNER)', status: 'V2_READY' },
  { activeImplementation: 'src/v2/modules/user/settings', removalIssues: [], route: 'Settings/Logout', status: 'V2_READY' },
  { activeImplementation: 'src/v2/modules/user/notifications + src/v2/modules/user/settings', route: 'NotificationSettings/Push', status: 'V2_READY' },
  { activeImplementation: 'src/app/navigation/RoutePlaceholderScreen.tsx', removalIssues: ['#139'], route: 'Merchant', status: 'REMOVE' },
] as const;

export const PROTECTED_ROUTE_FLOWS = Object.freeze({
  reservation: ['Map', 'Map.PlaceDetail', 'CreateReservation', 'ReservationDetail', 'Map'],
  visitVerification: ['Map', 'Map.PlaceDetail', 'VisitVerificationSession', 'VisitVerificationReview', 'Map'],
});

export const PRODUCTION_ROOT_POLICY = Object.freeze({
  hasImplicitV1RootFallback: false,
  root: 'src/application/ProductionApp.tsx',
  runtimeOwner: 'src/application',
});

export const ISSUE_262_STATUS = Object.freeze({
  bridgeFreeStandaloneV2: 'incomplete',
  codeCompositionRootCutover: 'complete',
  iosBuild: 'simulator-complete-device-incomplete',
  physicalDeviceQa: 'incomplete',
  wholeIssue: 'incomplete',
});

/** Route presence is distinct from static module reachability and standalone parity. */
export const PRODUCTION_BRIDGES = [
  { owner: 'application navigation', consumer: 'RootNavigator', path: 'src/app/navigation/AuthNavigator.tsx', reachable: true,
    reason: 'Authentication and first-run UI lack V2 parity.', removalIssues: ['#124', '#139'] },
  { owner: 'application navigation', consumer: 'RootNavigator', path: 'src/app/navigation/MainNavigator.tsx', reachable: true,
    reason: 'Injects existing auth selectors, CheckIn and Merchant placeholder into application-owned route composition.', removalIssues: ['#124', '#139'] },
  { owner: 'application runtime', consumer: 'RootNavigator / Main bridge / configureProductionRuntime', path: 'src/app/store/authStore.ts', reachable: true,
    reason: 'Hydration, login, refresh failure and ordered logout must retain session semantics.', removalIssues: ['#124', '#139'] },
  { owner: 'application runtime', consumer: 'configureProductionRuntime', path: 'src/shared/api/apiClient.ts + authTokens.ts + authStorage.ts', reachable: true,
    reason: 'Existing Axios refresh/replay and Keychain cache are injected through ProductionRuntime.', removalIssues: ['#124', '#139'] },
] as const;

export const PRODUCTION_REMOVAL_CANDIDATES = [
  { route: 'Merchant', registered: true, deepLinkReachable: true, removalIssue: '#139', condition: 'Support-version/deep-link removal decision and device QA.' },
  { route: 'CouponWallet', registered: false, deepLinkReachable: false, removalIssue: '#139', condition: 'Already absent; /coupons resolves to MyPage, then V2 CouponBox. No bridge deletion claimed in #362.' },
  { route: 'ApiCheck', registered: false, deepLinkReachable: false, removalIssue: '#139', condition: 'Already absent; no deletion claimed in #362.' },
] as const;
