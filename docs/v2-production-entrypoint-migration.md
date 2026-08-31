# #262 V2 production entrypoint migration

## Cutover decision

Production now starts from `src/application/ProductionApp.tsx`. This is a shared application
composition shell, not the standalone `src/v2/app/App.tsx` navigator and not a conditional V1/V2
root. The shell owns bootstrap and injects active V1 screens that still lack V2 route parity.
There is no production flag, mock root, or implicit fallback to `App.v1.tsx`.

Device QA remains a release/PR gate. The code cutover and automated parity checks do not claim that
native integrations have been verified on a physical device.

Current #262 status:

- Code-level production composition root cutover: **complete**.
- Bridge-free standalone V2 cutover: **incomplete**.
- Physical-device QA: **incomplete**.
- iOS simulator build: **complete** after regenerating `Podfile.lock` from the installed React
  Native 0.83.6 dependency graph. The unsigned x86_64 simulator build succeeds; physical-device
  build and QA remain **incomplete**.
- Therefore #262 as a whole is not reported as complete.

## Production dependency graph

```text
index.ts
├─ src/v2/features/notifications/services/backgroundNotification
└─ App.tsx
   └─ src/application/ProductionApp
      ├─ src/application/runtime/configureProductionRuntime
      │  ├─ src/shared/api/apiClient (Axios refresh/replay + Keychain tokens)
      │  ├─ src/app/store/authStore (session hydration/logout)
      │  ├─ src/v2/shared/api/apiClient (V2 transport adapter)
      │  ├─ src/v2/shared/auth/tokenSession
      │  └─ src/v2/features/notifications/services/fcmTokenLifecycle
      ├─ src/application/ProductionProviders
      │  ├─ V2 QueryClient, theme, i18n, and error boundary
      │  └─ legacy translation resource bridge
      └─ src/application/navigation/RootNavigator
         ├─ auth + onboarding hydration gate
         ├─ V2 FCM token/foreground/open lifecycle
         ├─ cold-start + foreground deep-link queue
         ├─ navigation readiness + duplicate-open guard
         ├─ Android hardware-back owner
         ├─ AuthNavigator (composition bridge)
         └─ MainNavigator (V2 screens + composition bridges)
```

`App.v1.tsx` and the previous `src/app/navigation/RootNavigator.tsx` are no longer reachable from
the production graph. `App.v2.tsx` is a QA alias to the same production composition root; it cannot
switch the entire app when auth state changes.

## Root state decision

`resolveProductionRootState` waits for both auth storage and onboarding completion storage:

| Auth hydration | Onboarding hydration | Session | Completion | Root state |
|---|---|---|---|---|
| pending | any | any | any | `loading` (renders no Auth/Onboarding) |
| complete | pending | any | any | `loading` |
| complete | complete | authenticated | any | `main` |
| complete | complete | unauthenticated | incomplete | `onboarding` |
| complete | complete | unauthenticated | completed | `auth` |

Auth and Main are mutually exclusive screens inside one NavigationContainer. Their navigation keys
replace the protected stack after logout/refresh failure without replacing the application root.
Onboarding completion has separate AsyncStorage ownership and is not cleared by token logout.

Pending notification and deep-link intents are delivered only when state is `main`, navigation is
ready, and the ref is ready. Notification message IDs are claimed once per authenticated session.
Deep-link callbacks use a 750 ms native-event dedupe window: an immediate duplicate callback is
collapsed, while reopening the same URL later is allowed and does not depend on logout. Logout
clears pending protected intents. Cold-start FCM, Expo notification,
and background-storage candidates are collapsed into one intent in that priority order.

## Route parity

The executable copy of this table is `src/application/migration/routeParity.ts`.

| User route/capability | Standalone V2 | Classification | Active production implementation / removal |
|---|---|---|---|
| Onboarding first run | completion model only | `COMPOSITION_BRIDGE` | V1 UI + V2 #258 storage; remove in #139 after #124 parity |
| Auth landing/login/signup | no screens | `COMPOSITION_BRIDGE` | V1 auth UI; remove in #139 after #124 parity |
| Map/search/category/markers/bottom sheet | yes | `V2_READY` | V2 map composition owns the production route |
| Place detail | yes | `V2_READY` | V2 map injects the V2 place-detail presentation contract |
| Favorites/recommendations | yes | `V2_READY` | V2 map owns the production sections and API hooks |
| Reservation list | yes | `V2_READY` | V2 reservations owns the production map sheet |
| Create reservation | yes | `V2_READY` | V2 screen |
| Reservation detail/payment move | screen exists | `V2_READY` | V2 detail/payment registered by production MainNavigator |
| Visit verification/recent visit/review | yes | `V2_READY` | V2 #257 screens |
| CheckIn | not equivalent | `COMPOSITION_BRIDGE` | V1 route retained; removal decision in #139/#124 |
| CouponWallet | API only | `COMPOSITION_BRIDGE` | V1 route retained; removal decision in #139/#124 |
| Profile/My Page | yes | `V2_READY` | V2 My Page owns production and profile deep-link routes |
| Settings/logout | yes | `V2_READY` | V2 settings owns the production route |
| Merchant placeholder | absent | `REMOVE` | no parity claim; remove route/deep link under #139 |
| ApiCheck development flow | absent | `REMOVE` | remove after device/API verification under #139 |

There are no `MISSING` entries in the active production graph: incomplete V2 routes remain explicit
composition bridges. A bridge is not a claim of standalone V2 parity.

Protected route assertions are:

```text
Map → Map.PlaceDetail → CreateReservation → ReservationDetail → Map/back
Map → VisitVerificationPlaces → VisitVerificationReview → Map/complete
Map → Profile → Settings → logout → AuthLanding
```

## Provider and runtime service ownership

| Responsibility | Single owner | Notes |
|---|---|---|
| Auth/session hydration | application RootNavigator + authStore | invoked once at root mount |
| Onboarding hydration | application RootNavigator + V2 onboarding-entry | independent of logout |
| API transport | configureProductionRuntime | V2 client receives production Axios transport |
| Access/refresh token | shared Axios/Keychain session | single-flight refresh, one replay; failure calls logout |
| Logout cleanup | authStore + configured beforeLogout | best-effort FCM DELETE, then token removal |
| Query/theme/i18n | ProductionProviders | V2 defaults; legacy strings are an explicit bridge |
| FCM token/foreground/open | application RootNavigator using V2 hooks | authenticated token/presentation paths only |
| Notification/deep-link pending intent | application RootNavigator | hydration/readiness gate; message-ID or 750 ms event dedupe |
| Android hardware back | application RootNavigator | local override, stack pop, double-back exit |
| Map/location native boundary | `src/v2/shared/native` + V2 map adapter | V2 production map owns the Kakao boundary |

## Composition bridges

- `AuthNavigator`: onboarding and authentication screens.
- `MainNavigator.CheckIn` and `CouponWallet`.
- legacy translation resources needed by injected screens.
- auth store and production Axios/Keychain session injected into V2 APIs at the application boundary.
- local Android-back override used by active Map and Settings screens.

V2 screen, hook, store, API, and style modules do not import these V1 modules.

## Production and rollback conditions

Automated cutover gates are `check:v2`, V1 change policy, typecheck, navigation/notification/map/API
tests, `validate:pr`, and `git diff --check`. Release still requires the device checklist below.

The checked-in iOS lockfile must be regenerated with `npx pod-install` whenever JavaScript native
dependencies change. GoogleMLKit 8.0.0 excludes arm64 for the simulator, so the current Apple
Silicon verification uses an x86_64 simulator build. Do not remove that generated exclusion as a
local workaround; revisit the constraint when the MLKit dependency is upgraded. A clean native
build also needs several gigabytes of free disk space for Pods and Xcode DerivedData.

Rollback is a one-line entrypoint change: make `App.tsx` export `App.v1.tsx`. This is an explicit
code rollback that requires review and a new build; production contains no runtime fallback flag.
If rollback is needed, retain the V2 background registration in `index.ts` only with a matching
consumer, or revert both sides together.

## Device QA checklist (not satisfied by automated tests/builds)

- [ ] Fresh install onboarding once; completion opens the correct Korean/foreign auth entry.
- [ ] Real login and relaunch hydration; no Auth/Onboarding frame before Main.
- [ ] Access-token refresh; failed refresh removes tokens and the protected stack.
- [ ] Logout unregisters FCM best-effort, lands on Auth, and does not repeat onboarding.
- [ ] Location permission deny/allow/settings and current-location recenter.
- [ ] Kakao Map camera, category/search, markers, selected detail, and bottom-sheet gestures.
- [ ] Favorites, recommendations, reservation list/create/detail, and real-server reservation.
- [ ] FCM foreground, background open, quit open, and duplicate-open suppression.
- [ ] `pingdom://` foreground and cold-start deep links.
- [ ] Android local sheet/settings back, stack back, and double-back exit.
- [ ] Location check-in based recent-visit lookup and review submission within the public contract.
- [ ] Profile/My Page and Settings production routes.

## #139 deletion candidates after bridge removal

- `App.v1.tsx`.
- `src/app/navigation/RootNavigator.tsx` and V1 notification store/hooks/utilities.
- `src/app/providers/AppProvider.tsx` and `src/app/providers/queryClient.ts`.
- V1 auth/onboarding UI after #124 owns equivalent V2 routes.
- `RoutePlaceholderScreen`, Merchant placeholder route, and temporary ApiCheck route.
- V1 Firebase notification implementation after device QA confirms the V2 lifecycle.

Do not delete `src/app/store/authStore`, `src/shared/api/apiClient`, or token storage until #124/#139
moves the production session contract behind a version-neutral boundary; they are injected runtime
dependencies, not unreachable legacy.

## Visit-verification server-contract limit

- A 30-second dwell verification is unsupported until server issue #1402 is implemented.
- Tourist review photo upload is unsupported because there is no public upload contract.
- Current device QA covers location check-in based recent-visit retrieval and review submission only
  within the published request contract.
- Mock responses and local file URIs must never be reported as a successful real-server upload.

## Follow-up blockers to a bridge-free V2 navigator

- #124: standalone V2 Auth and full Map/favorites/recommendations/reservation-list parity.
- #139: remove explicit bridges and unreachable V1 roots after the above land.
- Physical-device QA for login, native map/location, FCM/deep links, location check-in recent visits,
  contract-covered review submission, and real reservation remains a required PR/release gate.
