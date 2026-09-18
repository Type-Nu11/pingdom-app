# V2 boundary audit for ADR 0001

Current audit: #358 on `refactor/358-user-settings-domain-module`, based on merged
`origin/dev` `793f0a2` (includes #348/#361). The starting tree was clean, behind/ahead 0/0.
The original #357 audit is available in Git history; the current paths and blockers below
supersede its flat-feature inventory and the pre-merge #361 working-tree notes.

User ownership and exact before/after paths: [inventory](0001-user-migration-inventory.md).
Place ownership: [Place handoff](0001-place-migration-handoff.md).
User contracts, compatibility consumers and QA: [User handoff](0001-user-migration-handoff.md).

## Production graph

The graph includes every non-test V2/application source, including development mock transport,
plus transitive legacy composition paths. Type-only and lazy imports count toward SCCs.

| Metric | Before #358 | After #358 |
|---|---:|---:|
| V2/application production sources | 460 | 481 |
| Production import occurrences | 1852 | 1900 |
| Resolved local imports | 1363 | 1411 |
| SCCs including types | 1 | 1 |
| Value-only SCCs | 0 | 0 |

User external deep imports, shared → User, User → app/application **production** imports,
new SCCs and new V1 dependencies are all zero. Tests use the existing app testing provider;
production cannot import that support. User sibling submodules must also use public indexes.

The retained SCC consists only of `shared/api/apiClient.ts` and
`shared/api/mock/mockApiClient.ts`: client → mock value import and mock → client type import.
It is a strict subset of the seven-file pre-migration SCC. #360 owns the remaining type boundary.
There is no value-only cycle. Account fixtures now belong to User; app registers them in a
generic shared registry, and account type aliases use the shared generated-contract adapter.

## Exception ownership

Entries count exact tuples; occurrences sum `maxCount`. No maximum increased.

| Owner | Entries before → after | Occurrences before → after |
|---|---:|---:|
| #358 | 84 → 0 | 84 → 0 |
| #359 | 46 → 35 | 48 → 37 |
| #360 | 42 → 22 | 42 → 22 |
| #362 | 21 → 16 | 21 → 16 |

#361 remains at zero. All removed tuples correspond to deleted or corrected edges.
The only non-identical retained tuples are four existing #362 test rules: the same two
V1 navigation dependencies moved from Settings screen tests to
`app/testing/integration/__tests__/NotificationProduction.test.tsx`; target, specifier,
type/test flags and maxCount=1 are unchanged. No new V1 dependency was introduced.

## Current production exceptions

The executable manifest also enumerates every remaining test exception; no blanket test exemption.

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
| #359 | domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/reservations/screens/CreateReservationScreen.tsx` | 1 |
| #359 | domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/reservations/screens/ReservationBoxScreen.tsx` | 1 |
| #359 | domain-public-api | `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/reservations/screens/ReservationDetailScreen.tsx` | 1 |
| #360 | domain-public-api | `src/v2/features/current-activity-intent/model/currentActivityIntentQueryKeys.ts` | `src/v2/features/travel-purposes/model/travelPurposeQueryKeys.ts` | 1 |
| #359 | screen-no-api | `src/v2/features/reservations/screens/CreateReservationScreen.tsx` | `src/v2/shared/api/index.ts` | 1 |
| #359 | domain-public-api | `src/v2/features/reservations/screens/ReservationDetailScreen.tsx` | `src/v2/features/payments/hooks/usePayments.ts` | 1 |
| #359 | domain-public-api | `src/v2/features/reservations/screens/ReservationDetailScreen.tsx` | `src/v2/features/payments/model/paymentPresentation.ts` | 1 |
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
| feature | offers-coupons | 20 | 11 | 9 |
| feature | onboarding-entry | 5 | 4 | 1 |
| feature | onboarding-preferences | 19 | 12 | 7 |
| feature | payments | 7 | 6 | 1 |
| feature | place-visit-verification | 2 | 2 | 0 |
| feature | reservations | 25 | 17 | 8 |
| feature | settings | 3 | 3 | 0 |
| feature | travel-purposes | 6 | 6 | 0 |
| feature | travel-schedules | 6 | 5 | 0 |
| feature | voice-assistant | 30 | 21 | 9 |

Run `npm run audit:v2-boundaries` to reproduce the entire directed graph. Local before/after
JSON logs: `/private/tmp/358-boundary-before.txt`, `/private/tmp/358-boundary-after.txt`.
The audit never rewrites the exception manifest. `check:v2` additionally rejects stale exceptions.
