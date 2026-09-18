# V2 boundary audit for ADR 0001

Baseline: `27ace6b`, branch `refactor/357-v2-domain-boundary`; initial working tree clean,
HEAD vs origin/dev 0/0. Inspected #356–#362 including comments (none at inspection).
The issue's 26 features / 67 map files / 35 my-page files are stale.

## Inventory and ownership

Counts include every tracked file (tests and README included); source counts exclude docs.
No feature directory moved. Four resource-only public indexes were added.

| Existing feature | Baseline files | After #357 | Target owner | Responsibility | Move issue |
|---|---:|---:|---|---|---|
| account | 8 | 8 | User | Account and privacy contracts | #358 |
| auth | 4 | 4 | User | Account/session mutations; app composes auth routes | #358 |
| check-ins | 3 | 3 | Place | Visit evidence and status votes | #361 |
| conversion | 4 | 4 | Shared | Analytics transport/retry; domain callers retain event decisions | #360 |
| current-activity-intent | 5 | 5 | Travel | Current travel intent and recommendations | #360 |
| home | 2 | 2 | App composition | Empty landing shell, no domain state | #360 |
| map | 93 | 93 | Place | Map/camera/search/selection and sheet composition | #361 |
| map-home-feeds | 5 | 5 | Place | Discovery and ranking feeds | #361 |
| merchant-my-page | 17 | 17 | Merchant | Merchant presentation; consumes Place claims API | #360 |
| my-page | 38 | 38 | User | Profile presentation; consumes Travel/Booking/Place public APIs | #358 |
| notifications | 24 | 24 | User | Preferences and native notification lifecycle | #358 |
| offers-coupons | 18 | 19 | Booking | Benefits and coupon issuance/wallet contracts | #359 |
| onboarding-entry | 5 | 5 | Onboarding | Completion/hydration model | #360 |
| onboarding-preferences | 18 | 18 | Onboarding | Preference collection; consumes Travel APIs | #360 |
| payments | 7 | 7 | Booking | Payment contracts and state presentation | #359 |
| place-claims | 3 | 3 | Place | Place ownership claim contract; Merchant is a consumer | #361 |
| place-detail | 14 | 14 | Place | Place detail presentation | #361 |
| place-exploration | 6 | 6 | Place | Favorites/recommendations/exploration | #361 |
| place-list | 9 | 9 | Place | Place search/list example | #361 |
| place-menus | 7 | 7 | Place | Place menu read contract | #361 |
| place-visit-verification | 20 | 21 | Place | Stay/visit verification and review flow | #361 |
| reservations | 22 | 23 | Booking | Reservation/availability/product flow | #359 |
| scout-profile | 6 | 6 | User | Scout identity/profile contract | #358 |
| settings | 23 | 23 | User | User settings and route resolution | #358 |
| travel-purposes | 5 | 5 | Travel | Travel purpose/reference and user choices | #360 |
| travel-schedules | 5 | 5 | Travel | Travel schedules; User owns calendar presentation | #360 |
| visitor-verification-reports | 5 | 5 | Place | Visit evidence/report correction contract | #361 |
| voice-assistant | 12 | 13 | Voice Assistant | Assistant input/session orchestration | #360 |

**28 top-level feature folders**. Community has no current folder; ownership is an explicit additional decision for #360.

## Production graph

The all-source graph includes dormant/example files and explicit mock clients as well as
active route dependencies. It follows local dependencies through application bridges;
test sources/support are excluded from SCCs, but their imports still get boundary checks.

| Metric | Baseline | After #357 |
|---|---:|---:|
| V2/application production source files | 399 | 405 |
| Import/re-export occurrences (external + local, types included) | 1644 | 1651 |
| Resolved local import occurrences | 1173 | 1180 |
| Feature-to-other-feature deep imports | 51 | 51 |
| App-to-feature deep imports | 18 | 17 |
| Application-to-feature deep imports | 6 | 6 |
| Shared-to-feature references | 6 | 2 |
| V2 production-to-V1 references | 0 | 0 |
| SCCs including types and dynamic imports | 2 | 1 |
| SCCs excluding type-only edges | 1 | 0 |

`index.ts → App.tsx → application/ProductionApp` remains the production entrypoint.
ProductionProviders now composes app/i18n; runtime configuration still injects the auth/session
transport; RootNavigator still composes the same V1 Auth/Main navigation bridges and V2 hooks.
V2 app navigation still composes feature screens. Features consume shared infrastructure
and other features; shared has only the two explicitly frozen mock-fixture type reversals.

Production entrypoint reachability (local assets and type-only dependencies included) is
457 → 463 local paths: V2 358 → 364, application 6 → 6, V1 feature paths 23 → 23.
This demonstrates that no active V1 bridge was removed. The broader all-source policy also
checks modules not reachable from this entrypoint.

Run `npm run audit:v2-boundaries` for the complete current directed edge list, including
source, resolved target, original specifier, line, type-only and test metadata. The audit
is read-only; it does not update the reviewed exception manifest.

## Exception counts and ownership

Counts below are rule occurrences; an import can violate more than one rule.

| Rule | Production | Tests |
|---|---:|---:|
| application-bridge | 10 | 0 |
| domain-public-api | 76 | 127 |
| no-upward-composition | 2 | 2 |
| production-cycle | 14 | 0 |
| public-no-export-star | 4 | 0 |
| screen-no-api | 4 | 35 |
| shared-no-domain | 2 | 94 |
| v2-no-escape | 0 | 2 |
| v2-no-legacy | 0 | 2 |

370 exact manifest entries / 374 allowed rule occurrences.

| Removal issue | Production occurrences | Test occurrences |
|---|---:|---:|
| #361 | 32 | 94 |
| #358 | 23 | 72 |
| #359 | 10 | 48 |
| #360 | 29 | 42 |
| #362 | 18 | 6 |

Tests are not blanket-exempt: notably shared API integration tests import domain contracts,
status-label tests check Booking copy, and NotificationProduction checks V1 navigation.
Their exact paths, reasons, issue and multiplicity are in
[exceptions.json](../../../scripts/v2-boundaries/exceptions.json); adding a new such edge fails.

## Exact production exceptions

All paths below are repository-relative. Repeated source/target pairs may represent distinct
value/type imports. Original specifiers and occurrence caps remain in the executable manifest.

| Rule | Source | Target | Kind | Removal |
|---|---|---|---|---|
| application-bridge | `src/application/navigation/RootNavigator.tsx` | `src/app/navigation/AuthNavigator.tsx` | value × 1 | #362 |
| application-bridge | `src/application/navigation/RootNavigator.tsx` | `src/app/navigation/deepLink.ts` | value × 1 | #362 |
| application-bridge | `src/application/navigation/RootNavigator.tsx` | `src/app/navigation/MainNavigator.tsx` | value × 1 | #362 |
| application-bridge | `src/application/navigation/RootNavigator.tsx` | `src/app/navigation/navigationIntent.ts` | value × 1 | #362 |
| application-bridge | `src/application/navigation/RootNavigator.tsx` | `src/app/navigation/types.ts` | value × 1 | #362 |
| application-bridge | `src/application/navigation/RootNavigator.tsx` | `src/app/navigation/useAndroidBackHandler.ts` | value × 1 | #362 |
| domain-public-api | `src/application/navigation/RootNavigator.tsx` | `src/v2/features/map/store/mapSettingsStore.ts` | value × 1 | #362 |
| application-bridge | `src/application/navigation/RootNavigator.tsx` | `src/app/store/authStore.ts` | value × 1 | #362 |
| domain-public-api | `src/application/navigation/RootNavigator.tsx` | `src/v2/features/notifications/hooks/useFcmTokenSync.ts` | value × 1 | #362 |
| domain-public-api | `src/application/navigation/RootNavigator.tsx` | `src/v2/features/notifications/hooks/useForegroundNotifications.ts` | value × 1 | #362 |
| domain-public-api | `src/application/navigation/RootNavigator.tsx` | `src/v2/features/notifications/hooks/useNotificationOpenSync.ts` | value × 1 | #362 |
| domain-public-api | `src/application/navigation/RootNavigator.tsx` | `src/v2/features/notifications/model/notification.types.ts` | type × 1 | #362 |
| application-bridge | `src/application/runtime/configureProductionRuntime.ts` | `src/app/store/authStore.ts` | value × 1 | #362 |
| application-bridge | `src/application/runtime/configureProductionRuntime.ts` | `src/shared/api/apiClient.ts` | value × 1 | #362 |
| application-bridge | `src/application/runtime/configureProductionRuntime.ts` | `src/shared/api/authTokens.ts` | value × 1 | #362 |
| domain-public-api | `src/application/runtime/configureProductionRuntime.ts` | `src/v2/features/notifications/services/fcmTokenLifecycle.ts` | value × 1 | #362 |
| domain-public-api | `src/v2/app/navigation/notificationIntent.ts` | `src/v2/features/notifications/model/notification.types.ts` | type × 1 | #358 |
| domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/notifications/hooks/useFcmTokenSync.ts` | value × 1 | #358 |
| domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/notifications/hooks/useForegroundNotifications.ts` | value × 1 | #358 |
| domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/notifications/hooks/useNotificationOpenSync.ts` | value × 1 | #358 |
| domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/notifications/model/notification.types.ts` | type × 1 | #358 |
| domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/settings/hooks/useSettingsNavigation.ts` | value × 1 | #358 |
| domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/home/screens/HomeScreen.tsx` | value × 1 | #360 |
| domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/map/screens/MapScreen.tsx` | value × 1 | #361 |
| domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/my-page/screens/CouponBoxScreen.tsx` | value × 1 | #358 |
| domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/my-page/screens/CouponDetailContainer.tsx` | value × 1 | #358 |
| domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/my-page/screens/MyPageScreen.tsx` | value × 1 | #358 |
| domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/my-page/screens/ProfileEditScreen.tsx` | value × 1 | #358 |
| domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/place-list/screens/PlaceListExampleScreen.tsx` | value × 1 | #361 |
| domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/place-detail/screens/PlaceDetailScreen.tsx` | value × 1 | #361 |
| domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/reservations/screens/CreateReservationScreen.tsx` | value × 1 | #359 |
| domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/reservations/screens/ReservationBoxScreen.tsx` | value × 1 | #359 |
| domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/reservations/screens/ReservationDetailScreen.tsx` | value × 1 | #359 |
| domain-public-api | `src/v2/features/current-activity-intent/model/currentActivityIntentQueryKeys.ts` | `src/v2/features/travel-purposes/model/travelPurposeQueryKeys.ts` | value × 1 | #360 |
| domain-public-api | `src/v2/features/map/components/MapBottomSheet.tsx` | `src/v2/features/place-detail/components/PlacePhotoViewer.tsx` | value × 1 | #361 |
| domain-public-api | `src/v2/features/map/hooks/useConfirmedRecentSearchOwner.ts` | `src/v2/features/my-page/model/profile.types.ts` | type × 1 | #358 |
| domain-public-api | `src/v2/features/map/hooks/useMapDiscovery.ts` | `src/v2/features/place-detail/hooks/usePlaceDetail.ts` | value × 1 | #361 |
| domain-public-api | `src/v2/features/map/hooks/usePlaceRecommendations.ts` | `src/v2/features/travel-purposes/model/travelPurposeQueryKeys.ts` | value × 1 | #360 |
| domain-public-api | `src/v2/features/map/model/mapDiscovery.ts` | `src/v2/features/place-detail/model/placeDetail.types.ts` | type × 1 | #361 |
| screen-no-api | `src/v2/features/map/screens/MapScreen.tsx` | `src/v2/shared/api/index.ts` | value × 1 | #361 |
| domain-public-api | `src/v2/features/map/screens/MapScreen.tsx` | `src/v2/features/reservations/components/ReservationBottomSheet.tsx` | value × 1 | #359 |
| domain-public-api | `src/v2/features/map/screens/MapScreen.tsx` | `src/v2/features/my-page/hooks/useProfile.ts` | value × 1 | #358 |
| domain-public-api | `src/v2/features/my-page/components/TravelCalendar.tsx` | `src/v2/features/onboarding-preferences/model/onboardingPreference.ts` | type × 1 | #360 |
| domain-public-api | `src/v2/features/my-page/components/TravelCalendar.tsx` | `src/v2/features/onboarding-preferences/model/travelScheduleCalendar.ts` | value × 1 | #360 |
| domain-public-api | `src/v2/features/my-page/model/myPageTravel.ts` | `src/v2/features/onboarding-preferences/model/onboardingPreference.ts` | value × 1 | #360 |
| domain-public-api | `src/v2/features/my-page/model/profileQueryKeys.ts` | `src/v2/features/travel-purposes/model/travelPurposeQueryKeys.ts` | value × 1 | #360 |
| domain-public-api | `src/v2/features/my-page/model/verifiedPlaceEntries.ts` | `src/v2/features/place-detail/model/placeDetail.types.ts` | type × 1 | #361 |
| domain-public-api | `src/v2/features/my-page/screens/MyPageScreen.tsx` | `src/v2/features/onboarding-preferences/model/travelScheduleCalendar.ts` | value × 1 | #360 |
| domain-public-api | `src/v2/features/my-page/screens/MyPageScreen.tsx` | `src/v2/features/onboarding-preferences/model/onboardingPreference.ts` | type × 1 | #360 |
| domain-public-api | `src/v2/features/my-page/screens/MyPageScreen.tsx` | `src/v2/features/place-detail/hooks/usePlaceDetail.ts` | value × 1 | #361 |
| domain-public-api | `src/v2/features/my-page/screens/MyPageScreen.tsx` | `src/v2/features/check-ins/hooks/useCheckIns.ts` | value × 1 | #361 |
| domain-public-api | `src/v2/features/my-page/screens/MyPageScreen.tsx` | `src/v2/features/offers-coupons/hooks/useOffersCoupons.ts` | value × 1 | #359 |
| domain-public-api | `src/v2/features/my-page/screens/MyPageScreen.tsx` | `src/v2/features/reservations/hooks/useReservations.ts` | value × 1 | #359 |
| domain-public-api | `src/v2/features/my-page/screens/MyPageScreen.tsx` | `src/v2/features/travel-schedules/hooks/useTravelSchedules.ts` | value × 1 | #360 |
| screen-no-api | `src/v2/features/my-page/screens/MyPageScreen.tsx` | `src/v2/shared/api/index.ts` | value × 1 | #358 |
| screen-no-api | `src/v2/features/my-page/screens/ProfileEditScreen.tsx` | `src/v2/shared/api/index.ts` | value × 1 | #358 |
| domain-public-api | `src/v2/features/my-page/screens/VerifiedPlacesScreen.tsx` | `src/v2/features/place-detail/hooks/usePlaceDetail.ts` | value × 1 | #361 |
| domain-public-api | `src/v2/features/my-page/screens/VerifiedPlacesScreen.tsx` | `src/v2/features/check-ins/hooks/useCheckIns.ts` | value × 1 | #361 |
| domain-public-api | `src/v2/features/place-detail/hooks/usePlaceDetailPresentation.ts` | `src/v2/features/place-exploration/hooks/usePlaceExploration.ts` | value × 1 | #361 |
| domain-public-api | `src/v2/features/place-detail/hooks/usePlaceDetailPresentation.ts` | `src/v2/features/place-visit-verification/hooks/usePlaceReviews.ts` | value × 1 | #361 |
| domain-public-api | `src/v2/features/place-detail/model/placeDetailPresentation.ts` | `src/v2/features/place-visit-verification/api/visitVerificationApi.ts` | type × 1 | #361 |
| domain-public-api | `src/v2/features/place-detail/model/placeDetailPresentation.ts` | `src/v2/features/place-exploration/model/placeExploration.types.ts` | type × 1 | #361 |
| no-upward-composition | `src/v2/features/place-detail/screens/PlaceDetailScreen.tsx` | `src/v2/app/navigation/types.ts` | type × 1 | #362 |
| no-upward-composition | `src/v2/features/place-detail/screens/PlaceDetailScreen.tsx` | `src/v2/app/navigation/types.ts` | value × 1 | #362 |
| domain-public-api | `src/v2/features/place-list/screens/PlaceListExampleScreen.tsx` | `src/v2/features/place-detail/model/placePresentation.ts` | value × 1 | #361 |
| domain-public-api | `src/v2/features/place-visit-verification/components/VisitVerificationMapCta.tsx` | `src/v2/features/map/components/GlassSurface.tsx` | value × 1 | #361 |
| domain-public-api | `src/v2/features/place-visit-verification/hooks/useSubmitVisitVerification.ts` | `src/v2/features/my-page/model/profileQueryKeys.ts` | value × 1 | #358 |
| domain-public-api | `src/v2/features/place-visit-verification/hooks/useSubmitVisitVerification.ts` | `src/v2/features/my-page/model/profile.types.ts` | type × 1 | #358 |
| domain-public-api | `src/v2/features/place-visit-verification/hooks/useVisitVerificationCandidates.ts` | `src/v2/features/place-exploration/hooks/usePlaceExploration.ts` | value × 1 | #361 |
| domain-public-api | `src/v2/features/place-visit-verification/hooks/useVisitVerificationCandidates.ts` | `src/v2/features/place-exploration/model/placeExploration.types.ts` | type × 1 | #361 |
| domain-public-api | `src/v2/features/place-visit-verification/screens/VisitVerificationReviewScreen.tsx` | `src/v2/features/place-exploration/hooks/usePlaceExploration.ts` | value × 1 | #361 |
| domain-public-api | `src/v2/features/reservations/components/ReservationBottomSheet.tsx` | `src/v2/features/map/hooks/useBottomSheet.ts` | type × 1 | #361 |
| domain-public-api | `src/v2/features/reservations/components/ReservationBottomSheet.tsx` | `src/v2/features/map/components/MapSheetBottomNavigation.tsx` | value × 1 | #361 |
| domain-public-api | `src/v2/features/reservations/components/ReservationBottomSheet.tsx` | `src/v2/features/map/components/MapBottomSheet.tsx` | value × 1 | #361 |
| domain-public-api | `src/v2/features/reservations/components/ReservationBottomSheet.tsx` | `src/v2/features/map/hooks/usePlacePreviewImages.ts` | value × 1 | #361 |
| domain-public-api | `src/v2/features/reservations/components/ReservationBottomSheet.tsx` | `src/v2/features/map/utils/placeCategory.ts` | value × 1 | #361 |
| domain-public-api | `src/v2/features/reservations/components/ReservationBottomSheet.tsx` | `src/v2/features/map/styles/BottomSheetGlass.styles.ts` | value × 1 | #361 |
| screen-no-api | `src/v2/features/reservations/screens/CreateReservationScreen.tsx` | `src/v2/shared/api/index.ts` | value × 1 | #359 |
| domain-public-api | `src/v2/features/reservations/screens/CreateReservationScreen.tsx` | `src/v2/features/place-detail/hooks/usePlaceDetail.ts` | value × 1 | #361 |
| domain-public-api | `src/v2/features/reservations/screens/ReservationDetailScreen.tsx` | `src/v2/features/payments/hooks/usePayments.ts` | value × 1 | #359 |
| domain-public-api | `src/v2/features/reservations/screens/ReservationDetailScreen.tsx` | `src/v2/features/payments/model/paymentPresentation.ts` | value × 1 | #359 |
| domain-public-api | `src/v2/features/settings/components/AccountInformation.tsx` | `src/v2/features/my-page/hooks/useProfile.ts` | value × 1 | #358 |
| domain-public-api | `src/v2/features/settings/screens/AccountManagementScreen.tsx` | `src/v2/features/my-page/hooks/useProfile.ts` | value × 1 | #358 |
| domain-public-api | `src/v2/features/settings/screens/AccountManagementScreen.tsx` | `src/v2/features/offers-coupons/hooks/useOffersCoupons.ts` | value × 1 | #359 |
| domain-public-api | `src/v2/features/settings/screens/AccountManagementScreen.tsx` | `src/v2/features/check-ins/hooks/useCheckIns.ts` | value × 1 | #361 |
| domain-public-api | `src/v2/features/settings/screens/DataExportScreen.tsx` | `src/v2/features/account/hooks/useAccount.ts` | value × 1 | #358 |
| domain-public-api | `src/v2/features/settings/screens/SettingsScreen.tsx` | `src/v2/features/my-page/hooks/useProfile.ts` | value × 1 | #358 |
| domain-public-api | `src/v2/features/settings/screens/SettingsScreen.tsx` | `src/v2/features/notifications/screens/NotificationSettingsScreen.tsx` | value × 1 | #358 |
| domain-public-api | `src/v2/features/travel-schedules/hooks/useTravelSchedules.ts` | `src/v2/features/travel-purposes/model/travelPurposeQueryKeys.ts` | value × 1 | #360 |
| domain-public-api | `src/v2/features/travel-schedules/model/travelScheduleQueryKeys.ts` | `src/v2/features/travel-purposes/model/travelPurposeQueryKeys.ts` | value × 1 | #360 |
| shared-no-domain | `src/v2/shared/api/mock/features/account/fixtures.ts` | `src/v2/features/account/model/account.types.ts` | type × 1 | #358 |
| domain-public-api | `src/v2/shared/api/mock/features/account/fixtures.ts` | `src/v2/features/account/model/account.types.ts` | type × 1 | #358 |
| shared-no-domain | `src/v2/shared/api/mock/features/place-menus/fixtures.ts` | `src/v2/features/place-menus/model/placeMenu.types.ts` | type × 1 | #361 |
| domain-public-api | `src/v2/shared/api/mock/features/place-menus/fixtures.ts` | `src/v2/features/place-menus/model/placeMenu.types.ts` | type × 1 | #361 |
| production-cycle | `src/v2/features/account/model/account.types.ts` | `src/v2/shared/api/index.ts` | type × 1 | #360 |
| production-cycle | `src/v2/features/place-menus/model/placeMenu.types.ts` | `src/v2/shared/api/index.ts` | type × 1 | #360 |
| production-cycle | `src/v2/shared/api/apiClient.ts` | `src/v2/shared/api/mock/mockApiClient.ts` | value × 1 | #360 |
| production-cycle | `src/v2/shared/api/index.ts` | `src/v2/shared/api/apiClient.ts` | value × 1 | #360 |
| production-cycle | `src/v2/shared/api/index.ts` | `src/v2/shared/api/mock/mockApiClient.ts` | value × 1 | #360 |
| production-cycle | `src/v2/shared/api/index.ts` | `src/v2/shared/api/apiClient.ts` | type × 1 | #360 |
| production-cycle | `src/v2/shared/api/mock/features/account/fixtures.ts` | `src/v2/features/account/model/account.types.ts` | type × 1 | #360 |
| production-cycle | `src/v2/shared/api/mock/features/account/handlers.ts` | `src/v2/shared/api/mock/features/account/fixtures.ts` | value × 1 | #360 |
| production-cycle | `src/v2/shared/api/mock/features/index.ts` | `src/v2/shared/api/mock/features/account/handlers.ts` | value × 1 | #360 |
| production-cycle | `src/v2/shared/api/mock/features/index.ts` | `src/v2/shared/api/mock/features/place-menus/handlers.ts` | value × 1 | #360 |
| production-cycle | `src/v2/shared/api/mock/features/place-menus/fixtures.ts` | `src/v2/features/place-menus/model/placeMenu.types.ts` | type × 1 | #360 |
| production-cycle | `src/v2/shared/api/mock/features/place-menus/handlers.ts` | `src/v2/shared/api/mock/features/place-menus/fixtures.ts` | value × 1 | #360 |
| production-cycle | `src/v2/shared/api/mock/mockApiClient.ts` | `src/v2/shared/api/apiClient.ts` | type × 1 | #360 |
| production-cycle | `src/v2/shared/api/mock/mockApiClient.ts` | `src/v2/shared/api/mock/features/index.ts` | value × 1 | #360 |
| public-no-export-star | `src/v2/features/onboarding-entry/index.ts` | `src/v2/features/onboarding-entry/hooks/useOnboardingEntry.ts` | value × 1 | #360 |
| public-no-export-star | `src/v2/features/onboarding-entry/index.ts` | `src/v2/features/onboarding-entry/model/onboardingEntry.ts` | value × 1 | #360 |
| public-no-export-star | `src/v2/features/onboarding-entry/index.ts` | `src/v2/features/onboarding-entry/services/onboardingCompletionStorage.ts` | value × 1 | #360 |
| public-no-export-star | `src/v2/features/place-visit-verification/index.ts` | `src/v2/features/place-visit-verification/model/visitVerification.ts` | value × 1 | #361 |

## Cycles

The retained SCC has the following exact internal directed edges (not an invented linear
cycle through sorted member names). #360 coordinates the shared mock/type boundary cleanup
with the account (#358) and place-menus (#361) moves:

```text
src/v2/features/account/model/account.types.ts -> src/v2/shared/api/index.ts (type)
src/v2/features/place-menus/model/placeMenu.types.ts -> src/v2/shared/api/index.ts (type)
src/v2/shared/api/apiClient.ts -> src/v2/shared/api/mock/mockApiClient.ts (value)
src/v2/shared/api/index.ts -> src/v2/shared/api/apiClient.ts (value)
src/v2/shared/api/index.ts -> src/v2/shared/api/mock/mockApiClient.ts (value)
src/v2/shared/api/index.ts -> src/v2/shared/api/apiClient.ts (type)
src/v2/shared/api/mock/features/account/fixtures.ts -> src/v2/features/account/model/account.types.ts (type)
src/v2/shared/api/mock/features/account/handlers.ts -> src/v2/shared/api/mock/features/account/fixtures.ts (value)
src/v2/shared/api/mock/features/index.ts -> src/v2/shared/api/mock/features/account/handlers.ts (value)
src/v2/shared/api/mock/features/index.ts -> src/v2/shared/api/mock/features/place-menus/handlers.ts (value)
src/v2/shared/api/mock/features/place-menus/fixtures.ts -> src/v2/features/place-menus/model/placeMenu.types.ts (type)
src/v2/shared/api/mock/features/place-menus/handlers.ts -> src/v2/shared/api/mock/features/place-menus/fixtures.ts (value)
src/v2/shared/api/mock/mockApiClient.ts -> src/v2/shared/api/apiClient.ts (type)
src/v2/shared/api/mock/mockApiClient.ts -> src/v2/shared/api/mock/features/index.ts (value)
```

The removed i18n SCC had these edges:

```text
src/v2/features/offers-coupons/i18n/offerCouponResources.ts -> src/v2/shared/i18n/index.ts (value)
src/v2/shared/i18n/index.ts -> src/v2/shared/i18n/resources.ts (value)
src/v2/shared/i18n/index.ts -> src/v2/shared/i18n/language.ts (value)
src/v2/shared/i18n/index.ts -> src/v2/shared/i18n/language.ts (value)
src/v2/shared/i18n/index.ts -> src/v2/shared/i18n/resources.ts (type)
src/v2/shared/i18n/language.ts -> src/v2/shared/i18n/resources.ts (value)
src/v2/shared/i18n/resources.ts -> src/v2/features/offers-coupons/i18n/offerCouponResources.ts (value)
```

The four removed shared resource imports targeted:

- `src/v2/features/voice-assistant/i18n/voiceAssistantResources.ts`
- `src/v2/features/offers-coupons/i18n/offerCouponResources.ts`
- `src/v2/features/reservations/i18n/reservationResources.ts`
- `src/v2/features/place-visit-verification/i18n/visitVerificationResources.ts`

App now imports each resource via its public `i18n/index.ts`. No resource contents were
copied into shared. The two remaining production shared reversals are explicitly listed
above (`mock/features/account/fixtures.ts` and `mock/features/place-menus/fixtures.ts`).

The exact ten application-to-legacy bridge edges are also listed above under
`application-bridge`; #362 reviews their removal only after #124/#139 parity.


## #361 working-tree migration update

The tables above retain the historical #357 baseline. Current Place ownership, exact file moves,
exception removals, compatibility consumers and verified before/after graph metrics are recorded
in [the #361 handoff](0001-place-migration-handoff.md). Run `audit:v2-boundaries` for the current
feature and module inventory. #361 has no remaining exception; no manifest capacity was added.
