# Production composition migration — #262 / #362

Current code audit: 2026-09-19, #362 starts at `62e3b621a2f777c2e1fad77dfbe66dd91f1f8736`
(fetched `origin/dev`, ahead/behind 0/0). #357/#361/#358/#359/#360 were merged by
PR #366/#371/#372/#373/#374 respectively. Implementation ownership: **shared migration boundary + V2**.

Production uses `src/application/ProductionApp.tsx`. Code-level root cutover is complete;
**bridge-free standalone V2 and changed-build physical-device QA are incomplete**. GitHub #124,
#139 and #262 were CLOSED when read on 2026-09-19; that administrative state does not prove the
remaining code/QA conditions below. #362 does not claim complete V1 removal.

## Actual production graph

```text
index.ts ── User notifications/background public API (registration before registerRootComponent)
└─ App.tsx → application/ProductionApp
   ├─ runtime/configureProductionRuntime → installProductionRuntime(interface)
   │  ├─ existing authStore + Axios api + live Keychain token-cache reader
   │  └─ V2 transport / token session / User notification beforeLogout
   ├─ ProductionProviders → V2 QueryClient, theme, fonts, i18n, PlaceMapComposition
   └─ navigation/RootNavigator
      ├─ application navigation policy: types, intents, deep links, Android back
      ├─ V2 Onboarding hydration, Place settings, User notification lifecycle
      ├─ legacy AuthNavigator → first-run UI / auth landing / login / signup
      └─ explicit legacy MainNavigator injection bridge
         ├─ auth selectors / CheckInScreen / Merchant RoutePlaceholderScreen
         └─ application/createProductionMainNavigator
            └─ Place / Booking / User / Merchant public APIs
```

Reproduce: `node scripts/production-dependencies.mjs --write`.
[Machine-readable graph](architecture/adr/0001-production-dependency-graph.json) enumerates every
reachable local dependency, A/B/C/D classification, owner, removal issue, value/type reachability
and every directed edge. It contains 536 dependencies, 1,349 edges and **0 SCCs including types**.
This is conservative static import reachability: lazy/type-only and development mock registration
imports are included; it does not imply every screen/conditional branch executes. External packages
are excluded. Six roots are checked; the actual provider path is
`src/application/ProductionProviders.tsx`, not a nonexistent `providers/ProductionProviders.tsx`.

`App.v1.tsx`, `src/app/navigation/RootNavigator.tsx`, `src/app/providers/AppProvider.tsx` and
`src/app/providers/queryClient.ts` are unreachable from production. They remain deletion candidates,
not deleted code: #139 still requires support-version/rollback and native-flow evidence.
`App.v2.tsx` remains an alias of the production shell, not a session-dependent alternate root.

## Route parity and reachability

The executable manifest is `src/application/migration/routeParity.ts`.

| Capability | Classification | Production owner / actual reachability |
|---|---|---|
| First-run onboarding | B / COMPOSITION_BRIDGE | AuthNavigator → V1 UI, V2 completion/hydration model; reachable before completion |
| Auth landing/login/signup | B / COMPOSITION_BRIDGE | AuthNavigator; reachable when unauthenticated |
| Map/search/categories/place detail/favorites/recommendations | A / V2_READY | `modules/place/map` public API; initial Main route and place deep links |
| Reservation list/create/detail/payment | A / V2_READY | `modules/booking/reservations/routes` + map-sheet; registered callbacks unchanged |
| CouponBox/CouponDetail | A / V2_READY | `modules/user/profile/my-page` + Booking; MyPage → coupons and reserve callbacks |
| Visit sessions/recent visits/reviews | A / V2_READY | `modules/place/visit-verification`; foreground/place modes and route params preserved |
| MyPage/profile edit/verified places | A / V2_READY | User public APIs; role lookup now uses User `useProfile`, same GET `/users/me` and query identity |
| Merchant MyPage | A / V2_READY | `modules/merchant`; distinct from the unsupported Merchant deep-link placeholder |
| Settings/account/notification settings | A / V2_READY | User settings public API; existing logout callback and local back behavior |
| Push foreground/background/open | A / V2_READY | User notifications public entrypoints; same lifecycle and ordering |
| CheckIn | B / COMPOSITION_BRIDGE | registered legacy location check-in UI; `pingdom://places/:id/check-in` reaches it |
| Merchant placeholder | C / REMOVE candidate | still registered; `pingdom://merchants/:id` reaches it; retain until #139 decision |
| CouponWallet | absent | no registered route or implementation; `/coupons` already maps to MyPage → V2 CouponBox |
| ApiCheck | absent | no registered route or implementation; no deletion claimed by #362 |

Absence of CouponWallet/ApiCheck is supported by repository-wide source/route search and navigation
tests; it is not a claim of parity for a hypothetical legacy route. Unknown supported-scheme links
retain the existing Map fallback. No route names or params changed.

## Explicit bridges and removal conditions

| Boundary / current consumer | Owner | Why retained | Removal condition / issue |
|---|---|---|---|
| AuthNavigator / application RootNavigator | application navigation + auth/onboarding | no V2 login/signup/first-run screen parity | #124 parity, then #139 support-version and device-flow checks |
| legacy MainNavigator / application RootNavigator (also unreachable V1 root/tests) | application navigation | injects the existing auth hook and two legacy screens only; creates stable route components once at module initialization | #124 CheckIn parity and #139 Merchant/deep-link removal decision |
| authStore / RootNavigator, Main injection, runtime installer | application runtime | preserve login/hydration, refresh-failure behavior, FCM-before-token logout ordering | #124 session parity and #139 tested neutral runtime migration |
| shared/api/apiClient / configureProductionRuntime, legacy auth API | application runtime | existing Axios single-flight refresh and one replay | #124/#139 transport/session migration, real login/refresh/logout QA |
| shared/api/authTokens + authStorage / installer and existing auth runtime | application runtime | one Keychain owner and live refreshed access-token cache | #124/#139 secure-storage migration without changing keys or semantics |
| legacy components/styles beneath retained screens | corresponding bridge owner | transitive UI support for Auth, CheckIn or Merchant | delete with owning bridge under #139; each path appears in graph |
| legacy navigation policy export paths / old roots and AuthNavigator | application navigation | stable callers import application-owned policies; no copied implementations | delete remaining callers and re-export paths under #139 |

The frozen Main bridge is still a real production V1 dependency, not counted as removed just because
its route composition moved. No new exception, maxCount increase or hidden replacement bridge was
introduced. The installer defines the `ProductionRuntime` interface and injects existing functions;
it does not copy token/session implementation into V2. Legacy translation values already live in
V2 app-composed resources; there is no production import of V1 translation bundles.

## Preserved lifecycle contracts

Both auth and onboarding storage must hydrate before routes render. Authenticated users enter
Main; unauthenticated users see first onboarding or Auth according to persisted completion. Auth/Main
remain mutually exclusive screens in one NavigationContainer with the existing navigation keys.

Protected intents wait for Main and navigation readiness. Notification message IDs are claimed once
per authenticated session. The 750 ms native deep-link event dedupe window permits later reopening
of the same URL. Logout clears pending intents and notification IDs. Cold-start FCM/Expo/background
storage precedence is unchanged. Android handling still runs the shared local override first, then
stack back, then double-back exit, with the same i18n hint and timing.

A new actual-root regression exposed a preexisting gap: the persistent production QueryClient was
not cleared on logout. The authenticated → unauthenticated effect now clears its queries/mutations
(and cancels queries through QueryClient.clear) and active foreground visit-session state alongside
navigation intents. Token/FCM/logout ordering is unchanged; onboarding completion is retained.
No query key, storage key, METHOD/PATH/DTO, appearance or i18n value changed.

## Compatibility and boundary measurements

- `src/v2/features/**`: **29 → 0 files**, **0 remaining consumers**.
- Shared test-provider compatibility adapter: removed; tests use `v2/app/testing/testProviders`.
- NotificationProduction integration test: application test boundary, actual production route
  factory with test-only injected legacy dependencies; existing assertions preserved.
- API retry assertion: moved to app integration test ownership; shared API has no upward import.
- #362 exceptions: **15 → 6**, production **10 → 6**, test-only **5 → 0**. Every surviving tuple and
  maxCount is unchanged; reasons now name concrete #124/#139 removal conditions.
- Production SCC: **0 → 0**. Domain public API and production-no-test checks remain enforced.

See [#362 handoff and full compatibility table](architecture/adr/0001-production-composition-handoff.md).

## Current server contract evidence

On 2026-09-19, a read-only download of [live OpenAPI](https://www.typenull.xyz/v3/api-docs) confirmed
all four visit-verification path items and all included schemas exactly match `docs/api/visit-verification.openapi.json`:
POST sessions, POST foreground sessions, POST observations, GET session. Session responses expose
`requiredDwellSeconds` (example 30), `verifiedDwellSeconds`, `remainingSeconds`, `reviewEligible` and
`completedCheckInId`. The server selects the required duration; 30 is an example, not a hardcoded guarantee.
The old statement that dwell verification awaits server #1402 is obsolete.

The live contract also includes POST `/places/{placeId}/reviews/media` (multipart) and review submission
with `reviewMediaIds`, consistent with the repository place-exploration snapshot and current V2
implementation. Both review POST path items also match the repository snapshot. The downloaded
OpenAPI SHA-256 is `f71efadddc493c9e9b0f3c1ee264f986d099128308806ff2a0a20a1371b1cdba`.
Arbitrary local file URIs are not server media IDs. No generated contract files were
changed. Read-only schema confirmation does **not** verify successful GPS observation, upload or
review mutation on a device.

## Remaining #124 / #139 / #262 conditions and QA

- #124: V2 authentication/first-run UI, equivalent CheckIn route decision, and session runtime
  independence remain unresolved despite the issue being closed. Map, profile and settings parity
  already exists and is no longer listed as missing.
- #139: retained bridges, unreachable roots/providers, stable navigation export paths, Merchant link
  policy, support versions/rollback, native builds and core-flow deletion evidence remain.
- #262: code composition-root cutover is complete; standalone bridge-free execution and changed-build
  device QA are not. Prior iOS simulator build evidence is historical and was not rerun for #362.
- #362 device check: `adb devices -l` returned no attached devices; `xcrun simctl list devices booted`
  returned no booted simulator. Android/iOS changed-build smoke and native builds were not performed.

Pending manual checklist: app start; real login/relaunch hydration/refresh/logout; fresh onboarding;
map/location permission; place detail; reservation; coupons; visit verification/photo review;
MyPage/settings/appearance; foreground/background/quit notifications; cold/foreground deep links;
Android local-back/stack-back/double-back exit. Automated tests do not satisfy this checklist.

Rollback remains an explicit reviewed source change and new build using the retained `App.v1.tsx`;
there is no runtime fallback switch. Background registration must stay paired with its consumer.
