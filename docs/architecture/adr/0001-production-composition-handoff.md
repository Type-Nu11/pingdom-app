# #362 production composition handoff

Start: `refactor/362-production-composition-boundary`, clean working tree, HEAD and fetched
`origin/dev` both `62e3b621a2f777c2e1fad77dfbe66dd91f1f8736` (ahead/behind 0/0).
No commit or push is performed. Implementation: **shared migration boundary + V2**.

The current structure, exact bridge owners/removal conditions, route reachability and device gates
are in [production migration](../../v2-production-entrypoint-migration.md). The reproducible
[graph](0001-production-dependency-graph.json) classifies every reachable local dependency and
records transitive V1 reasons. Regenerate with `node scripts/production-dependencies.mjs --write`;
`check:v2` verifies that it is current and rejects additional exception tuples.

## Compatibility file inventory

All rows below are deleted. “Consumer” records the former caller now using the existing public API;
no caller still imports the old path. Test mocks target canonical components, preserving function and
object identity. No replacement production compatibility file was introduced for tests.

| 기존 경로 | 실제 canonical 구현 | 현재 consumer | 조치 | 유지/삭제 근거 |
|---|---|---|---|---|
| `src/v2/features/check-ins/api/checkInApi.ts` | `src/v2/modules/place/check-ins/api/checkInApi.ts` | 이전 경로 0; 공개 API 전환: `src/app/navigation/__tests__/SettingsNavigation.test.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/check-ins/index.ts` | `src/v2/modules/place/check-ins/api/checkInApi.ts`<br>`src/v2/modules/place/check-ins/hooks/useCheckIns.ts` | 이전 경로 0; 공개 API 전환: `src/features/place/hooks/__tests__/useLocationCheckIn.test.tsx`<br>`src/features/place/hooks/useLocationCheckIn.ts` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/map/hooks/useCurrentLocation.ts` | `src/v2/modules/place/map/location/hooks/useCurrentLocation.ts` | 이전 경로 0; 공개 API 전환: `src/features/place/hooks/__tests__/useLocationCheckIn.test.tsx`<br>`src/features/place/hooks/useLocationCheckIn.ts` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/map/model/map.types.ts` | `src/v2/modules/place/map/camera/model/map.types.ts` | 이전 경로 0; 공개 API 전환: `src/features/place/hooks/useLocationCheckIn.ts` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/map/screens/MapScreen.tsx` | `src/v2/modules/place/map/screens/MapScreen.tsx` | 이전 경로 0; 공개 API 전환: `src/application/navigation/MainNavigator.tsx`<br>`src/app/navigation/__tests__/MainNavigator.test.tsx`<br>`src/app/navigation/__tests__/SettingsNavigation.test.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/map/utils/mapBack.ts` | `src/v2/modules/place/map/navigation/utils/mapBack.ts` | 이전 경로 0; 공개 API 전환: `src/app/navigation/__tests__/navigation.test.mjs` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/merchant-my-page/screens/MerchantMyPageContainer.tsx` | `src/v2/modules/merchant/screens/MerchantMyPageContainer.tsx` | 이전 경로 0; 공개 API 전환: `src/application/navigation/MainNavigator.tsx`<br>`src/app/navigation/__tests__/MainNavigator.test.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/my-page/api/profileApi.ts` | `src/v2/modules/user/profile/api/profileApi.ts` | 이전 경로 0; 공개 API 전환: `src/app/navigation/__tests__/SettingsNavigation.test.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/my-page/screens/CouponBoxScreen.tsx` | `src/v2/modules/user/profile/my-page/coupons/screens/CouponBoxScreen.tsx` | 이전 경로 0; 공개 API 전환: `src/application/navigation/MainNavigator.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/my-page/screens/CouponDetailContainer.tsx` | `src/v2/modules/user/profile/my-page/coupons/screens/CouponDetailContainer.tsx` | 이전 경로 0; 공개 API 전환: `src/application/navigation/MainNavigator.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/my-page/screens/MyPageScreen.tsx` | `src/v2/modules/user/profile/my-page/screens/MyPageScreen.tsx` | 이전 경로 0; 공개 API 전환: `src/application/navigation/MainNavigator.tsx`<br>`src/app/navigation/__tests__/MainNavigator.test.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/my-page/screens/ProfileEditScreen.tsx` | `src/v2/modules/user/profile/screens/ProfileEditScreen.tsx` | 이전 경로 0; 공개 API 전환: `src/application/navigation/MainNavigator.tsx`<br>`src/app/navigation/__tests__/MainNavigator.test.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/my-page/screens/VerifiedPlacesScreen.tsx` | `src/v2/modules/user/profile/my-page/verified-places/screens/VerifiedPlacesScreen.tsx` | 이전 경로 0; 공개 API 전환: `src/application/navigation/MainNavigator.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/notifications/api/notificationApi.ts` | `src/v2/modules/user/notifications/api/notificationApi.ts` | 이전 경로 0; 공개 API 전환: `src/app/navigation/__tests__/SettingsNavigation.test.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/notifications/services/backgroundNotification.ts` | `src/v2/modules/user/notifications/services/backgroundNotification.ts` | 이전 경로 0; 공개 API 전환: `index.ts` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/offers-coupons/api/offerCouponApi.ts` | `src/v2/modules/booking/offers-coupons/api/offerCouponApi.ts` | 이전 경로 0; 공개 API 전환: `src/app/navigation/__tests__/SettingsNavigation.test.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/offers-coupons/index.ts` | `src/v2/modules/booking/offers-coupons/api/offerCouponApi.ts` | 이전 경로 0; 공개 API 전환: `src/app/navigation/types.ts` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/onboarding-entry/index.ts` | `src/v2/modules/onboarding/entry/hooks/useOnboardingEntry.ts`<br>`src/v2/modules/onboarding/entry/model/onboardingEntry.ts` | 이전 경로 0; 공개 API 전환: `src/app/navigation/AuthNavigator.tsx`<br>`src/app/navigation/RootNavigator.tsx`<br>`src/features/onboarding/OnboardingFlow.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/onboarding-entry/model/onboardingEntry.ts` | `src/v2/modules/onboarding/entry/model/onboardingEntry.ts` | 이전 경로 0; 공개 API 전환: `src/app/navigation/__tests__/navigation.test.mjs`<br>`src/app/navigation/__tests__/productionRoot.test.mjs` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/onboarding-preferences/index.ts` | `src/v2/modules/onboarding/preferences/screens/OnboardingPreferenceFlow.tsx`<br>`src/v2/modules/onboarding/preferences/hooks/useSyncOnboardingTravelSchedule.ts` | 이전 경로 0; 공개 API 전환: `src/app/navigation/RootNavigator.tsx`<br>`src/features/onboarding/OnboardingFlow.tsx`<br>`src/features/onboarding/__tests__/OnboardingFlow.test.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/place-visit-verification/index.ts` | `src/v2/modules/place/visit-verification/screens/VisitVerificationPlacesScreen.tsx`<br>`src/v2/modules/place/visit-verification/screens/VisitVerificationReviewScreen.tsx`<br>`src/v2/modules/place/visit-verification/screens/VisitVerificationSessionScreen.tsx` | 이전 경로 0; 공개 API 전환: `src/application/navigation/MainNavigator.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/place-visit-verification/model/visitVerificationSession.ts` | `src/v2/modules/place/visit-verification/model/visitVerificationSession.ts` | 이전 경로 0; 공개 API 전환: `src/app/providers/AppProvider.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/reservations/screens/CreateReservationScreen.tsx` | `src/v2/modules/booking/reservations/screens/CreateReservationScreen.tsx` | 이전 경로 0; 공개 API 전환: `src/application/navigation/MainNavigator.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/reservations/screens/ReservationBoxScreen.tsx` | `src/v2/modules/booking/reservations/screens/ReservationBoxScreen.tsx` | 이전 경로 0; 공개 API 전환: `src/application/navigation/MainNavigator.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/reservations/screens/ReservationDetailScreen.tsx` | `src/v2/modules/booking/reservations/screens/ReservationDetailScreen.tsx` | 이전 경로 0; 공개 API 전환: `src/application/navigation/MainNavigator.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/settings/hooks/useSettingsNavigation.ts` | `src/v2/modules/user/settings/hooks/useSettingsNavigation.ts` | 이전 경로 0; 공개 API 전환: `src/application/navigation/MainNavigator.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/settings/index.ts` | `src/v2/modules/user/settings/screens/AccountManagementScreen.tsx`<br>`src/v2/modules/user/settings/screens/SettingsDetailScreen.tsx`<br>`src/v2/modules/user/settings/model/settings.types.ts` | 이전 경로 0; 공개 API 전환: `src/application/navigation/MainNavigator.tsx`<br>`src/app/navigation/types.ts` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/settings/screens/SettingsScreen.tsx` | `src/v2/modules/user/settings/screens/SettingsScreen.tsx` | 이전 경로 0; 공개 API 전환: `src/application/navigation/MainNavigator.tsx`<br>`src/app/navigation/__tests__/MainNavigator.test.tsx` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/features/travel-purposes/model/travelPurposeQueryKeys.ts` | `src/v2/modules/travel/purposes/model/travelPurposeQueryKeys.ts` | 이전 경로 0; 공개 API 전환: `src/features/profile/hooks/useMyReviews.ts`<br>`src/features/profile/hooks/useProfile.ts` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |
| `src/v2/shared/testing/testProviders.tsx` | `src/v2/app/testing/testProviders.tsx` | 이전 경로 0; 공개 API 전환: `src/app/navigation/__tests__/MainNavigator.test.tsx`<br>`src/app/navigation/__tests__/SettingsNavigation.test.tsx`<br>`src/v2/shared/components/__tests__/FavoriteIcon.test.tsx`<br>`src/v2/shared/components/__tests__/HeaderBackButton.test.tsx`<br>`src/v2/shared/components/__tests__/TypographyComponents.test.tsx`<br>`src/v2/shared/i18n/__tests__/placeActions.test.ts` | 삭제 | 동일 구현의 named public export로 전환; API/캐시/화면 구현 유지 |

## V1 source scope and label

V1 source modifications are limited to import rewiring, policy extraction and the explicit Main
injection bridge. `src/features/onboarding/OnboardingFlow.tsx`,
`src/features/place/hooks/useLocationCheckIn.ts`, `src/features/profile/hooks/useProfile.ts` and
`useMyReviews.ts` change public import paths only. Related V1 tests follow the canonical imports.
The now test-only V1 `src/app/navigation/androidBack.ts` path is deleted; its test consumes the
application-owned policy directly. The unreachable `src/app/providers/AppProvider.tsx` also changes only its visit-session import so
it remains compilable after compatibility deletion. AuthNavigator and the retained old Root switch
the existing onboarding imports. No V1 screen behavior or native file was added.

V1 dependency delta: **removed** (four application policy imports and the production legacy profile
hook chain removed), with existing auth/onboarding/CheckIn/session/Merchant bridges still explicit.
A **legacy-exception label is required** for these V1 source modifications; removal owner #139,
with #124 parity prerequisites. No PR/label was created or changed in this task.

`check:v1-changes -- --base origin/dev` inspects committed `origin/dev...HEAD` and only `src/features`.
Because this task intentionally leaves work uncommitted, its passing result alone cannot approve
this working-tree diff. The actual unstaged V1 file list was separately inspected and is recorded
above. Do not interpret that checker result as “no V1 modifications”.

## Verification

See the final verification table below. Before structural edits, `check:v2` passed with 15 exceptions
and 0 SCCs; `test:regression` and targeted Jest (4 suites / 38 tests) passed. Existing assertions were
preserved while adapting canonical paths; retry assertions moved intact. A new actual-root test
failed on stale logout cache before the application cleanup was added, then passed.

Boundary fixtures still reject test support in production. The new graph regression rejects V1
roots/providers, compatibility paths, production test imports, module deep imports, SCCs and any
change to the exact six retained exception tuples/maxCounts. It also checks all 19 route names and
background registration order. Runtime tests pin transport/token/logout function identity and
installation order. Native/device/server-mutation QA remains unperformed.

| Command | Final result |
|---|---|
| `npm run check:v2` | PASS — 6 exceptions, 0 SCCs; 76 boundary tests |
| `npm run typecheck` | PASS |
| `npm run test:navigation` | PASS — 22 tests |
| `npm run test:v2-notifications` | PASS — 7 tests |
| `npm run test:v2-map` | PASS — 48 tests |
| `npm run test:v2-api` | PASS — 174 tests |
| `npm run test:regression` | PASS — navigation 22, i18n 11, notifications 7, map 48, API 174 |
| `npm run validate:pr` | PASS — Jest 128 suites / 1,233 tests, ownership 2, boundary 76 and regression |
| `npm run check:v1-changes -- --base origin/dev` | PASS for committed diff only; working tree separately reports 6 modified `src/features` files requiring label |
| `git diff --check` | PASS |

Changed paths: 79 including additions, removals and test moves (untracked files included, no staging).
Automated checks initially exposed an obsolete Map compatibility-path assertion; it now asserts
application composition + the same public Map implementation and verifies the bridge forwards to
that composition. No behavioral assertions were removed or relaxed.
