# #358 User/Settings migration handoff

## Starting point and scope

- Implementation: **V2**, with production composition import changes in `src/application` only.
- Branch: `refactor/358-user-settings-domain-module`.
- Starting HEAD and fetched `origin/dev`: `793f0a20a000818b2b1f4c1cea57737507234eeb`.
- Starting working tree clean; behind/ahead **0/0** after `git fetch origin`.
- #348 (#370), #361 (#371), #357 and #319/#320/#321 are merged. No prerequisite blocker.
- Read the complete repository AGENTS.md, #358 and related #356/#357/#319–#321/#348/#359–#362,
  ADR, boundary audit, Place handoff and production-entrypoint document before implementing.
- The initial implementation run made no commit or push. The subsequent user-approved split commits are recorded below.
- No package addition, V1 source edit, generated type edit or UI redesign; no push.

## Ownership and structure

```text
src/v2/modules/user/
  index.ts                     headless profile identity/cache and notification route types
  account/                     OAuth, data export, account query keys and adapters
    auth/                      V2 auth API/mutations and logout/cache cleanup
    mock/                      account/auth development fixtures and handlers
  profile/                     profile API, edits, image flow, review stats and query identity
    my-page/
      screens/                 My Page statistics and section composition
      travel/                  calendar presentation and date/error selectors
      verified-places/         user-facing verified-place cards, grid and route
      coupons/                 coupon-box/detail presentation and enrichment hooks
      hooks/                   existing user's bookmark membership/cache mutations
  settings/                    route resolver, supported/unsupported states, settings UI
  notifications/               settings query/mutation and generated notification aliases
    lifecycle/                 FCM register/unregister/foreground/open public entry
    background/                isolated background registration entry
    routing/                   pure payload parsing, initial candidate selection and route type
    mock/                      development notification preferences and FCM handlers
  scout-profile/               generated profile aliases, selectors, query and mutations
    mock/                      development Scout response fixtures and handlers
  mock/                        named domain mock handler exports for app composition
```

Exact before/after file inventory and every public export are in
[the inventory](0001-user-migration-inventory.md). Profile data lives outside My Page because
Settings and Place need user identity/cache without importing the My Page route composition.
Travel, verified places and coupons are presentation subareas; their domain contracts are not copied.
The pre-existing bookmark membership API/cache is retained as the user's collection view; no
Place visit-verification, detail, claim, Booking or Travel contract implementation moved into User.

Settings owns language/appearance/location/privacy presentation. Shared retains the generic theme
store, language instance/storage and OS permission adapter. V1 Auth routes, secure token storage,
Axios refresh/replay, generated types and application NavigationContainer retain their existing owners.

## Public API and consumers

- App/application imports public User submodule indexes only, including type-only dependencies.
- Place map consumes `user/profile`; visit verification consumes `user/profile/data`
  for the unchanged profile-owned review cache identity.
- User siblings consume each other's indexes. The checker now enforces this separately from
  external-module rules, including type-only imports and tests.
- User consumes Place detail, exploration and check-in public APIs, Booking's existing
  `features/offers-coupons` / `features/reservations` indexes, and Travel's public indexes.
- `modules/travel/calendar/index.ts` now publishes only consumed date/calendar
  helpers and types, without loading the onboarding screen/store barrel. #360 moved this
  responsibility to Travel; no duplicated contract or implementation was introduced.
- Screen API-error interpretation moves into profile/travel presentation models. Error codes,
  precedence, localized keys and fallbacks remain unchanged. Travel candidate fields now use
  `Pick<TravelSchedule, ...>` from the existing domain public contract instead of repeating its enum.
- `__tests__/index.ts` supports spies/fixtures without adding test-only production exports.
  Production imports of these files fail the checker. Shared's existing recording transport
  constructs Axios test errors; domain tests do not import Axios.
- Notification-only Hook and FCM concurrency assertions move out of mixed app integration tests
  into `notifications/__tests__`. Multi-domain composition assertions remain app-owned.

## Mock composition and remaining SCC

Account, notification and Scout fixtures/handlers move from shared mock feature folders to User.
`app/configureDomainMocks.ts` installs the same handler objects into the shared generic registry.
Standalone AppProviders, production runtime composition and app test providers use that composition.
Node mock tests explicitly install the required handlers. Real transport selection is unchanged.
Shared imports no User code, and production imports no test support.

The first Node API run exposed a mock-registration module-instance mismatch when importing the
registry directly alongside the shared API barrel. The Scout test now configures through the same
shared public API instance as its client. The complete API and full PR suites subsequently pass.

The previous seven-file mock/client/type SCC shrinks to the existing client↔mock type boundary
(two files, two directed edges), still owned by #360. There is no new SCC or value-only SCC.

## Compatibility and follow-up

These exact V2 compatibility files contain named re-exports only. V1 is frozen by this task's scope;
removing them requires changing those consumers. Remove in **#362**, respecting #124/#139 parity.
They preserve the same component/function/API object identity and add no user behavior.

| Compatibility file | Consumer / reason |
|---|---|
| `src/v2/features/my-page/screens/MyPageScreen.tsx` | V1 MainNavigator; V1 navigator mock |
| `src/v2/features/my-page/screens/ProfileEditScreen.tsx` | V1 MainNavigator; V1 navigator mock |
| `src/v2/features/my-page/screens/CouponBoxScreen.tsx` | V1 MainNavigator |
| `src/v2/features/my-page/screens/CouponDetailContainer.tsx` | V1 MainNavigator |
| `src/v2/features/my-page/screens/VerifiedPlacesScreen.tsx` | V1 MainNavigator |
| `src/v2/features/settings/index.ts` | V1 MainNavigator and navigation/types |
| `src/v2/features/settings/hooks/useSettingsNavigation.ts` | V1 MainNavigator |
| `src/v2/features/settings/screens/SettingsScreen.tsx` | V1 MainNavigator; V1 navigator mock |
| `src/v2/features/notifications/services/backgroundNotification.ts` | frozen root `index.ts` background registration |
| `src/v2/features/my-page/api/profileApi.ts` | V1 `SettingsNavigation.test.tsx` only |
| `src/v2/features/notifications/api/notificationApi.ts` | V1 `SettingsNavigation.test.tsx` only |

The final two paths are explicitly classified as test adapters, export from User test support,
and cannot be imported by production. A negative boundary fixture enforces that restriction.
This preserves frozen V1 tests without exposing their spy targets as a new production API.

#359 has no new compatibility export. It must migrate the existing public Booking entries consumed by:

- `modules/user/profile/my-page/screens/MyPageScreen.tsx` (`useCoupons`, `useReservations`).
- `modules/user/settings/screens/AccountManagementScreen.tsx` (`useCoupons`).
- `modules/user/profile/my-page/coupons/screens/CouponBoxScreen.tsx` and `CouponDetailContainer.tsx`.
- `modules/user/profile/my-page/coupons/hooks/useCouponBoxEntries.ts` and `model/couponBoxEntries.ts`.

These consumers need current Booking queries, status/Offer/Coupon contracts and selectors. Moving
Booking implementations here would violate #359 ownership. Their public boundary is valid today;
#359 changes the public import locations when the domain moves, preserving query/cache identity.

## Contract preservation evidence

- 74 moved production implementations have identical non-import/non-re-export AST statement text
  versus `793f0a2`, including auth mutations/logout ordering, notification lifecycle/storage,
  API endpoints/bodies, query keys and invalidation, settings route resolution, export adapters and Scout.
- The only three moved implementation bodies with structural differences are ProfileEditScreen
  (two error-display helpers extracted verbatim), MyPageScreen (same error-key selection delegated),
  and myPageTravel (that pure error-key selector plus the generated Travel type projection).
- Profile and account key declarations, `notificationSettingsQueryKeys`, Scout query keys and
  bookmark membership keys are preserved; mutations retain the same cache writes/invalidations.
- Notification registration coalescing, unregister ordering, foreground/background/open callbacks,
  cold-start selection and deduplication remain covered by existing assertions.
- Production auth hydration/logout/refresh failure is still owned by unchanged legacy runtime
  implementations injected in composition. Application lifecycle/navigation bodies are unchanged.
- Route names, params, deep-link files, Android back behavior, AsyncStorage/Keychain key strings,
  language precedence/ko-en resources/fallback and light-dark-system persistence are unchanged.
- V1 source, generated OpenAPI types, server snapshots, i18n resource values and native source have no diff.
- Mock success is not evidence of a live-server operation. No real account mutation, FCM delivery,
  coupon redemption, Scout application or data export was performed during this refactor.

## Boundary result

| Owner | Exception entries before → after | Allowed occurrences before → after |
|---|---:|---:|
| #358 | 84 → 0 | 84 → 0 |
| #359 | 46 → 35 | 48 → 37 |
| #360 | 42 → 22 | 42 → 22 |
| #362 | 21 → 16 | 21 → 16 |

No maxCount increase or new production exception. Four pre-existing #362 test tuples retain
exact targets/specifiers/caps with only their source relocated to app integration testing.
The migration assertion first failed with `84 !== 0`, then passed after the edges were corrected
and their stale exceptions removed. See [current full audit](0001-v2-boundary-audit.md).

## Validation

Final implementation validation: `npm run validate:pr`, exit **0**.

| Command / area | Exact result |
|---|---|
| `npm run audit:v2-boundaries` | Before/after graph captured; new SCC 0, User deep/reverse production imports 0 |
| `npm run check:v2` | Passed; 63 boundary tests |
| `npm run typecheck` | Passed |
| User/settings/notification + app integration targeted Jest | 27 suites / 233 tests passed before final presentation path split; all also pass in final full run |
| Full Jest (`validate:pr`) | 126 suites / 1,230 tests passed; no skipped tests |
| `npm run test:navigation` | 22 passed |
| `npm run test:i18n-formatters` | 11 passed |
| `npm run test:v2-notifications` | 7 passed |
| `npm run test:v2-map` | 48 passed |
| `npm run test:v2-api` | 168 passed |
| `npm run test:regression` | Passed inside final validate:pr (all five Node suites above) |
| `npm run validate:pr` | Passed, including 2 ownership harness tests |
| `npm run check:v1-changes -- --base origin/dev` | Passed: no V1 source additions/modifications |
| `git diff --check` | Passed |

Full Jest includes profile edit/My Page/verified-place/coupon states, Settings support/navigation,
notification preference/lifecycle, theme preference persistence, language hydration/fallback,
logout/deep link, session runtime and the unchanged V1 navigation consumers. Account/auth and Scout
contract/mutation assertions run directly in test:v2-api. Existing React act warnings remain;
no assertion was dropped or relaxed to suppress them. tsx initially hit a sandbox IPC restriction;
those suites were rerun with the required permission and passed.

Local logs: `/private/tmp/358-validate-pr.txt`, `/private/tmp/358-api.txt`,
`/private/tmp/358-user-jest.txt`, `/private/tmp/358-preservation.json` and the before/after audits.

## Manual QA not performed

Android: `adb devices -l` detected one SM_F966N. Only connectivity was checked; the changed build
was not installed/launched for smoke QA, so no current-code Android runtime result is claimed.
iOS: `xcrun simctl list devices booted` showed no booted simulator; no iOS runtime QA.

Still unverified on both platforms: real login/relaunch hydration, refresh failure/logout cleanup,
profile edit/image upload, My Page stats/calendar/verified places/coupon routes, Settings navigation,
language/theme persistence, OS notification/location permissions, FCM registration/unregistration
and foreground/background/quit-open delivery, deep links and Android back on a running changed build.
Real-server Scout apply/update and export/share are likewise unverified. These are release/device-QA
limitations, not successful mock smoke tests. No remaining automated implementation blocker.

V1 dependency delta: **none**. `legacy-exception`: **not required**.

## Local split commits (2026-09-18)

The user invoked `rcp` and explicitly approved all ten Korean commit messages. Nine code
snapshots were assembled in `/private/tmp/358-rcp` without changing the final source worktree.
Each passed `check:v2` and `typecheck`; the ninth source tree is byte-identical to the verified
implementation. Common imports, mock registration and exception removals accompany their
respective feature moves so intermediate commits resolve and type-check. Temporary intermediate
exports are removed by the My Page commit and do not add final compatibility paths.

| Commit | Approved unit |
|---|---|
| `beec72d` | Refactor: #358 계정 및 인증 API를 User 도메인으로 분리 |
| `06c83b1` | Refactor: #358 프로필 조회와 편집 페이지 분리 |
| `2231ca0` | Refactor: #358 검증 장소와 북마크 기능 분리 |
| `585ae8b` | Refactor: #358 쿠폰함과 쿠폰 상세 페이지 분리 |
| `b9628f9` | Refactor: #358 마이페이지 통계와 여행 달력 분리 |
| `90f9ea4` | Refactor: #358 알림 설정과 FCM lifecycle 분리 |
| `6258ede` | Refactor: #358 설정 및 계정 관리 페이지 분리 |
| `4367708` | Refactor: #358 Scout 프로필 계약과 Query 분리 |
| `13c0a32` | Refactor: #358 User 공개 API 조립과 mock 및 경계 검사 정리 |

This tenth documentation commit records the final structure, validation and split history.
No earlier commit was amended and no push was performed. Additional split verification:
account-stage API 168 passed; profile-stage related Jest 23 suites / 191 tests passed;
notification-stage API 168 passed. Final snapshot `validate:pr` passed with 126 Jest suites /
1,230 tests plus navigation 22, i18n 11, notifications 7, map 48 and API 168.
The manual device-QA limitations above remain unchanged.

## Current Booking boundary after #359

User My Page reads reservation statistics through `modules/booking`; Coupon presentation and Settings read `modules/booking/offers-coupons`. User retains CouponBox/CouponDetail/QR UI ownership; Booking owns the generated contracts, queries and Coupon state selectors. API spies use Booking test-only indexes.

The earlier #359 migration instructions above are historical. See [Booking handoff](0001-booking-migration-handoff.md) for the implemented boundaries and remaining contract-sync follow-up.

## Current remaining-domain boundary after #360

The [#360 handoff](0001-remaining-migration-handoff.md) and [exact compatibility inventory](0001-remaining-migration-inventory.md) supersede earlier pending #360 instructions. Travel implementations now live in `modules/travel`; User and Onboarding share `travel/calendar`. Place consumes Travel query keys and `shared/analytics/conversion`; its assistant consumes `modules/voice-assistant`. Onboarding hydration is `modules/onboarding`, Merchant presentation is `modules/merchant`, and Home is app-owned.

All previously listed V1 compatibility paths remain required by their frozen consumers and contain named re-exports only. V2 test-provider callers now use app/testing; the V1 test adapter stays for #362. Remaining Place development handlers/fixtures move into Place and app registers them in the unchanged precedence. #360 exceptions and the final client/mock SCC are both zero; #362 retains 15 occurrences. These are automated structural results, not new device/live-server QA.
