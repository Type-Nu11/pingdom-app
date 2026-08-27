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
  { activeImplementation: 'src/features/place/screens/MapScreen.tsx', removalIssues: ['#139'], route: 'Map/Search/Category/PlaceDetail', status: 'COMPOSITION_BRIDGE' },
  { activeImplementation: 'src/features/place/screens/MapScreen.tsx', removalIssues: ['#139'], route: 'Favorites/Recommendations', status: 'COMPOSITION_BRIDGE' },
  { activeImplementation: 'src/features/place/screens/MapScreen.tsx + src/features/reservation', removalIssues: ['#139'], route: 'ReservationList', status: 'COMPOSITION_BRIDGE' },
  { activeImplementation: 'src/v2/features/reservations/screens/CreateReservationScreen.tsx', route: 'CreateReservation', status: 'V2_READY' },
  { activeImplementation: 'src/v2/features/reservations/screens/ReservationDetailScreen.tsx', route: 'ReservationDetail/Payment', status: 'V2_READY' },
  { activeImplementation: 'src/v2/features/place-visit-verification', route: 'VisitVerification/Review', status: 'V2_READY' },
  { activeImplementation: 'src/features/place/screens/CheckInScreen.tsx', removalIssues: ['#139'], route: 'CheckIn', status: 'COMPOSITION_BRIDGE' },
  { activeImplementation: 'src/features/place/screens/CouponWalletScreen.tsx', removalIssues: ['#139'], route: 'CouponWallet', status: 'COMPOSITION_BRIDGE' },
  { activeImplementation: 'src/features/profile/screens/ProfileScreen.tsx', removalIssues: ['#227', '#231'], route: 'Profile', status: 'COMPOSITION_BRIDGE' },
  { activeImplementation: 'src/features/settings/screens/SettingsScreen.tsx', removalIssues: ['#228', '#229', '#230'], route: 'Settings/Logout', status: 'COMPOSITION_BRIDGE' },
  { activeImplementation: 'src/app/navigation/RoutePlaceholderScreen.tsx', removalIssues: ['#139'], route: 'Merchant', status: 'REMOVE' },
  { activeImplementation: 'src/features/profile/dev/account-session-api-check', removalIssues: ['#139'], route: 'ApiCheck', status: 'REMOVE' },
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
  iosBuild: 'incomplete-pods',
  physicalDeviceQa: 'incomplete',
  wholeIssue: 'incomplete',
});
