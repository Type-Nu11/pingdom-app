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
  { activeImplementation: 'src/features/onboarding', removalIssues: ['#139'], route: 'Onboarding', status: 'COMPOSITION_BRIDGE' },
  { activeImplementation: 'src/features/onboarding + src/features/auth', removalIssues: ['#139'], route: 'AuthLanding/Login/Signup', status: 'COMPOSITION_BRIDGE' },
  { activeImplementation: 'src/v2/features/map/screens/MapScreen.tsx', removalIssues: [], route: 'Map/Search/Category/PlaceDetail', status: 'V2_READY' },
  { activeImplementation: 'src/v2/features/map/screens/MapScreen.tsx', removalIssues: [], route: 'Favorites/Recommendations', status: 'V2_READY' },
  { activeImplementation: 'src/v2/features/map/screens/MapScreen.tsx + src/v2/features/reservations', removalIssues: [], route: 'ReservationList', status: 'V2_READY' },
  { activeImplementation: 'src/v2/features/reservations/screens/CreateReservationScreen.tsx', route: 'CreateReservation', status: 'V2_READY' },
  { activeImplementation: 'src/v2/features/reservations/screens/ReservationDetailScreen.tsx', route: 'ReservationDetail/Payment', status: 'V2_READY' },
  { activeImplementation: 'src/v2/features/place-visit-verification', route: 'VisitVerification/Review', status: 'V2_READY' },
  { activeImplementation: 'src/features/place/screens/CheckInScreen.tsx', removalIssues: ['#139'], route: 'CheckIn', status: 'COMPOSITION_BRIDGE' },
  { activeImplementation: 'src/v2/features/my-page/screens/CouponBoxScreen.tsx', route: 'CouponBox', status: 'V2_READY' },
  { activeImplementation: 'src/v2/features/my-page/screens/MyPageScreen.tsx', removalIssues: [], route: 'Profile', status: 'V2_READY' },
  { activeImplementation: 'src/v2/features/settings/screens/SettingsScreen.tsx', removalIssues: [], route: 'Settings/Logout', status: 'V2_READY' },
  { activeImplementation: 'src/app/navigation/RoutePlaceholderScreen.tsx', removalIssues: ['#139'], route: 'Merchant', status: 'REMOVE' },
] as const;

export const PROTECTED_ROUTE_FLOWS = Object.freeze({
  reservation: ['Map', 'Map.PlaceDetail', 'CreateReservation', 'ReservationDetail', 'Map'],
  visitVerification: ['Map', 'VisitVerificationPlaces', 'VisitVerificationReview', 'Map'],
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
