# V2 boundary audit for ADR 0001

Current audit: #359 on `refactor/359-booking-domain-module`, based on merged `origin/dev`
`ea321b9` (#358 PR #372). Starting working tree clean, fetched origin/dev behind/ahead 0/0.
Historical #357/#358 audit results remain in Git history and the Place/User handoffs.

- [Booking inventory and public API](0001-booking-migration-inventory.md)
- [Booking handoff and contract evidence](0001-booking-migration-handoff.md)
- [Place handoff](0001-place-migration-handoff.md)
- [User handoff](0001-user-migration-handoff.md)

## Production graph

All non-test V2/application sources and their transitive local dependencies are audited;
SCCs include type-only and lazy imports.

| Metric | Before #359 | After #359 |
|---|---:|---:|
| Production sources | 481 | 505 |
| Production import occurrences | 1900 | 1920 |
| Resolved local imports | 1411 | 1430 |
| SCCs including types | 1 | 1 |
| Value-only SCCs | 0 | 0 |

The single SCC is unchanged: `shared/api/apiClient.ts` ↔ `shared/api/mock/mockApiClient.ts`.
Its two frozen #360 edges and member set are unchanged. New production SCCs: **0**.
External → Booking internal, Place/User → Booking internal, shared → Booking and Booking → app/application
production imports are **0**. Domain tests use the established app/testing provider boundary only.
Booking siblings now enforce named public indexes, with positive and negative fixtures.

## Exception ownership

| Owner | Entries before → after | Allowed occurrences before → after |
|---|---:|---:|
| #359 | 35 → 0 | 37 → 0 |
| #360 | 22 → 22 | 22 → 22 |
| #362 | 16 → 15 | 16 → 15 |

#358/#361 remain at zero. Every retained tuple and maxCount is unchanged. #362 drops one
shared status-label test → app resources exception because Booking now composes its own test resources.
Compatibility re-exports have no boundary exception and no implementation; #362 owns their removal.
Test-only Coupon compatibility is classified as test support and blocked from production.

## Current production exceptions

| Owner | Rule | Source | Target | Count |
|---|---|---|---|---:|
| #362 | application-bridge | `src/application/navigation/RootNavigator.tsx` | `src/app/navigation/AuthNavigator.tsx` | 1 |
| #362 | application-bridge | `src/application/navigation/RootNavigator.tsx` | `src/app/navigation/deepLink.ts` | 1 |
| #362 | application-bridge | `src/application/navigation/RootNavigator.tsx` | `src/app/navigation/MainNavigator.tsx` | 1 |
| #362 | application-bridge | `src/application/navigation/RootNavigator.tsx` | `src/app/navigation/navigationIntent.ts` | 1 |
| #362 | application-bridge | `src/application/navigation/RootNavigator.tsx` | `src/app/navigation/types.ts` | 1 |
| #362 | application-bridge | `src/application/navigation/RootNavigator.tsx` | `src/app/navigation/useAndroidBackHandler.ts` | 1 |
| #362 | application-bridge | `src/application/navigation/RootNavigator.tsx` | `src/app/store/authStore.ts` | 1 |
| #362 | application-bridge | `src/application/runtime/configureProductionRuntime.ts` | `src/app/store/authStore.ts` | 1 |
| #362 | application-bridge | `src/application/runtime/configureProductionRuntime.ts` | `src/shared/api/apiClient.ts` | 1 |
| #362 | application-bridge | `src/application/runtime/configureProductionRuntime.ts` | `src/shared/api/authTokens.ts` | 1 |
| #360 | domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/home/screens/HomeScreen.tsx` | 1 |
| #360 | domain-public-api | `src/v2/features/current-activity-intent/model/currentActivityIntentQueryKeys.ts` | `src/v2/features/travel-purposes/model/travelPurposeQueryKeys.ts` | 1 |
| #360 | domain-public-api | `src/v2/features/travel-schedules/hooks/useTravelSchedules.ts` | `src/v2/features/travel-purposes/model/travelPurposeQueryKeys.ts` | 1 |
| #360 | domain-public-api | `src/v2/features/travel-schedules/model/travelScheduleQueryKeys.ts` | `src/v2/features/travel-purposes/model/travelPurposeQueryKeys.ts` | 1 |
| #360 | production-cycle | `src/v2/shared/api/apiClient.ts` | `src/v2/shared/api/mock/mockApiClient.ts` | 1 |
| #360 | production-cycle | `src/v2/shared/api/mock/mockApiClient.ts` | `src/v2/shared/api/apiClient.ts` | 1 |
| #360 | public-no-export-star | `src/v2/features/onboarding-entry/index.ts` | `src/v2/features/onboarding-entry/hooks/useOnboardingEntry.ts` | 1 |
| #360 | public-no-export-star | `src/v2/features/onboarding-entry/index.ts` | `src/v2/features/onboarding-entry/model/onboardingEntry.ts` | 1 |
| #360 | public-no-export-star | `src/v2/features/onboarding-entry/index.ts` | `src/v2/features/onboarding-entry/services/onboardingCompletionStorage.ts` | 1 |

## Current module / transitional feature inventory

| Kind | Name | Files | Production sources | Test sources |
|---|---|---:|---:|---:|
| module | booking | 85 | 58 | 27 |
| module | place | 200 | 144 | 54 |
| module | user | 131 | 94 | 36 |
| feature | check-ins | 2 | 2 | 0 |
| feature | conversion | 5 | 5 | 0 |
| feature | current-activity-intent | 6 | 6 | 0 |
| feature | home | 2 | 2 | 0 |
| feature | map | 4 | 4 | 0 |
| feature | merchant-my-page | 17 | 14 | 3 |
| feature | my-page | 6 | 5 | 1 |
| feature | notifications | 2 | 1 | 1 |
| feature | offers-coupons | 2 | 1 | 1 |
| feature | onboarding-entry | 5 | 4 | 1 |
| feature | onboarding-preferences | 19 | 12 | 7 |
| feature | place-visit-verification | 2 | 2 | 0 |
| feature | reservations | 3 | 3 | 0 |
| feature | settings | 3 | 3 | 0 |
| feature | travel-purposes | 6 | 6 | 0 |
| feature | travel-schedules | 6 | 5 | 0 |
| feature | voice-assistant | 30 | 21 | 9 |

Run `npm run audit:v2-boundaries` to reproduce the complete directed graph; it never rewrites exceptions.
Local evidence: `/private/tmp/359-before-audit.txt`, `/private/tmp/359-after-audit.txt`.
