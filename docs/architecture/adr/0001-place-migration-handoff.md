# #361 Place/Map migration handoff

## Status and stacked base

- Implementation location: **V2**. Application changes only compose providers and consume public Map settings.
- Branch: `refactor/361-place-map-domain-module`; starting stacked HEAD: `fd2cd14ce78ce9c81aca83f36dd57f36472fd2bd`.
- Historical validation/commit notes below describe the #361 implementation run.
- Current base update (2026-09-18, #358 inspection): #348 PR #370 and #361 PR #371 are merged.
  Fetched `origin/dev` is `793f0a2`; the #358 starting branch is aligned 0/0 and clean.
  The former pending #348 merge/base synchronization blocker is resolved.
- Current User paths, reduced exceptions and mock SCC are recorded in
  [the User handoff](0001-user-migration-handoff.md) and [current audit](0001-v2-boundary-audit.md).

## Ownership before / after

Before: 10 flat Place features, 166 files; Map alone had 93 files.

```text
src/v2/modules/place/
  index.ts                 headless read queries / facts / identity
  core/                    Place identity, categories, common types, pure mappers, Query keys
  search/                  list, autocomplete, viewport queries, recent search, search UI
  detail/                  detail / availability facts, operating summaries, media presentation
  exploration/             bookmarks, recommendations, explanations, conversion recording
  home-feeds/              local hot and national ranking feeds
  claims/                  merchant-owner Place claims contract
  menus/                   generated-alias menu model, menu query and presentation
  check-ins/               location check-in and status-vote evidence
  visit-verification/      sessions, dwell observations, review/media submission, i18n
  verification-reports/    report paging, statuses and correction contracts
  map/
    screens/               Map route orchestration
    native/                Kakao adapter and canvas
    camera/                center projection, zoom constants, coordinate contracts
    location/              current location and permission workflow
    markers/               marker payload identity and recommendation marker mapping
    selection/             selected place and preview resolution
    sheet/                 transitions, gestures, Map sheets and reservation slot contract
    presentation/          overlays, glass surfaces and visual primitives
    assistant/             FAB/modal lifecycle integration (Voice remains external)
    actions/               sharing and native directions
    navigation/            local Android-back decisions
    settings/              persisted Map settings
```

The scoped place-exploration server adapter remains a single implementation; search owns its
list/autocomplete/viewport query functions and generated parameter aliases. No duplicate query
or endpoint implementation was introduced. The existing MVP example list remains separate and
unchanged under search; its public names explicitly identify it as the example.

See [complete before/after file mapping](0001-place-migration-files.md) and
[pre-move inventory including exact exceptions](0001-place-migration-inventory.md).

## Public API and composition

- `modules/place/index.ts`: `placeQueryKeys`, `parsePlaceId`, `parseCheckInId`, identity/facts types,
  `createPlaceListQueryOptions`, `createPlaceDetailQueryOptions`. Headless; no screen/native exports.
- `search/queries/index.ts`: active list/autocomplete/viewport query options, hooks and generated aliases.
- `detail/index.ts`: detail hooks/options, facts, presentation selectors, photos, preview images and screen.
- `exploration/index.ts`: bookmark and recommendation hooks, media and conversion operations;
  `exploration/presentation/index.ts` supplies the narrow headless recommendation presentation API.
- Remaining subfeature indexes export explicit named domain contracts and route entries. No new public wildcard.
- `map/index.ts` exports the Map screen; `map/settings` exposes the settings store;
  `map/location` and `map/navigation` preserve the required legacy runtime entry contracts.
- `map/sheet/index.ts` publishes the reservation slot and the presentation pieces Booking currently needs.
  `app/PlaceMapComposition` selects `reservations/map-sheet` and injects it through a stable context provider.
  Both `ProductionProviders` and standalone `AppProviders` install that provider. Booking logic stays in Booking.
- #359 owns further consolidation of the existing Booking read/presentation APIs. Map still uses public
  reservation availability hooks and Offer UI; Booking uses public Place detail and sheet presentation.
  There is no direct Place import of ReservationBottomSheet, no Booking deep import of Map, and no new
  production file SCC. This is a documented transitional public boundary, not a completed Booking migration.
- User profile/cache and Travel query-key consumers use named public APIs. Their domain ownership is unchanged.
- Cross-domain API integration tests move to `app/testing/integration`; small headless `data/index.ts` entries
  in remaining flat features publish only contracts used there. They expose no test-only helpers.
- Voice Command Registry consumes Place root query options/facts and the existing Booking public API.
  Its execution, cancellation, deadline and provenance code is unchanged.

## Compatibility exports

V1 source is frozen. These files are needed by `src/app/navigation/MainNavigator`,
`src/app/providers/AppProvider`, `src/features/place/hooks/useLocationCheckIn`, and their existing tests.
They contain no implementation; remove in **#362 when those exact consumers migrate**, subject to #124/#139 parity.

- `src/v2/features/map/utils/mapBack.ts`
- `src/v2/features/map/screens/MapScreen.tsx`
- `src/v2/features/map/hooks/useCurrentLocation.ts`
- `src/v2/features/map/model/map.types.ts`
- `src/v2/features/check-ins/index.ts`
- `src/v2/features/check-ins/api/checkInApi.ts`
- `src/v2/features/place-visit-verification/index.ts`
- `src/v2/features/place-visit-verification/model/visitVerificationSession.ts`

## Boundary audit

No new exception, no increased maxCount, no newly allowed cycle. Every retained manifest entry
is byte-for-byte an existing entry. All #361 entries are removed only after the corresponding edge
is removed or made public; other owners' entries are removed only when their dependency actually disappears.

| Metric | Before | After |
|---|---:|---:|
| Production source files | 419 | 460 |
| Production imports | 1723 | 1852 |
| Resolved production local imports | 1238 | 1363 |
| Type-inclusive SCCs | 1 | 1 |
| Value-only SCCs | 0 | 0 |

| Exception owner | Before entries | After entries | Reason retained |
|---|---:|---:|---|
| #361 | 124 | 0 | None remain. |
| #358 | 94 | 84 | Unmigrated User/Settings imports and account fixture type reversal. |
| #359 | 56 | 46 | Unmigrated Booking screens and integration contracts. |
| #360 | 71 | 42 | Other flat domains, onboarding wildcard exports, existing account/mock SCC. |
| #362 | 24 | 21 | Frozen V1 composition bridges and remaining production/integration navigation edges. |

The existing shared mock SCC shrinks from 10 files to 7. Place menus uses its shared generated
contract directly; the remaining account mock SCC belongs to #358/#360. Shared → Place and
Place → app imports are zero, including tests. V2 → V1 production imports remain zero.

## Behavior-preservation evidence

- Place Query key file is byte-identical to `fd2cd14`, SHA-256:
  `59332f8985e8ecd467dcc4cba0fb9fe11846185b32efede2440c49b0c0b3da31`.
- Route names and `V2StackParamList` declarations are byte-identical. Identity brands/parsers move
  unchanged to core; PlaceDetail accepts the same narrow navigation shape without an app dependency.
- 105 moved production implementations retain identical non-import/re-export AST statement text.
  This includes API endpoint/DTO handling, mutations/invalidation, storage, location policy and native actions.
- Other structural bodies: Map screen receives the sheet slot and delegates identical camera projection;
  zoom constants and marker payload type move to Map; PlaceDetail uses literal values matching the unchanged
  route constants; search query functions/selectors move verbatim out of exploration.
- Generated OpenAPI files, API snapshots, Android/iOS native files, V1 source and deep-link files have no diff.
- All original test assertions are retained; path assertions and public API mocks follow new ownership.
  Added camera regression checks cover selected-place offset, following, dismissed-center precedence and no location.
- `AbortSignal`, query-client reuse, recommendation keys, review upload → submit → cleanup, session lifecycle,
  radius/dwell conditions, photo/reason limits and server error contracts remain covered by the existing tests.

## Verification

Final automated run: **all passed** (`npm run validate:pr`, exit 0).

| Check | Result |
|---|---|
| `audit:v2-boundaries` | Completed; before/after comparison above |
| `check:v2` | Passed; 60 boundary fixtures |
| `typecheck` | Passed |
| Jest including Place, Map, menu, claims/check-in integration, visits, #348 Voice commands | 126 suites / 1,230 tests passed |
| `test:navigation` | 22 passed |
| `test:i18n-formatters` | 11 passed |
| `test:v2-notifications` | 7 passed |
| `test:v2-map` | 48 passed |
| `test:v2-api` | 168 passed |
| `test:regression` | Passed (all five Node suites above) |
| `validate:pr` | Passed (also 2 ownership harness tests) |
| `check:v1-changes -- --base origin/dev` | Passed; no V1 source modifications/additions |
| `git diff --check` | Passed |

All six extracted active search query/hook function bodies compare verbatim with `fd2cd14`.
Validation logs are retained locally at `/private/tmp/361-final-validate-pr.txt`;
pre/post full audits are `/private/tmp/361-before-audit.txt` and `/private/tmp/361-after-audit.txt`.
Some existing React `act()` warnings occur in the full Jest output; no test was skipped or relaxed.

Android: debug package and SM_F966N were detected. The device disconnected before Metro reverse/restart;
subsequent `adb devices -l` was empty. No current-branch UI smoke result is claimed. The temporary Metro was stopped.
iOS: no booted simulator was available; smoke was not performed.

Still unverified on the changed build: app launch, native map/location, category/search, marker tap,
sheet gestures, detail/bookmark, sharing/directions, booking/visit entry and AI Assistant UI on Android/iOS.
No real booking, review, check-in or external share was submitted.

V1 dependency delta: **none**. `legacy-exception`: **unnecessary**.


## Local commit verification (2026-09-18)

The final implementation was preserved while intermediate snapshots were reconstructed in
`/private/tmp/361-commit-build`. Each implementation commit passed `check:v2` and `typecheck`.
Commit messages were explicitly approved through the `rcp` workflow. No existing commit was amended.

| Commit unit | Additional verification |
|---|---|
| Core contracts and Query keys | API 168 passed |
| Search/list | API 168; Jest 2 suites / 8 tests passed |
| Detail | API 168; Jest 1 suite / 7 tests passed |
| Exploration/home feeds | API 168; bookmark Jest 2 suites / 21 tests passed |
| Menus/claims | API 168; menu Jest passed |
| Check-ins/visits/reports | API 168; Jest 4 suites / 44 tests passed |
| Map responsibilities and reservation composition | Map 48; API 168; Jest 36 suites / 246 tests passed |
| External consumers and Voice public API | Voice command Jest and boundary/type checks passed |
| Documentation | Staged whitespace and final clean-tree checks |

The complete final implementation also passed `validate:pr` immediately before the commit split
(`/private/tmp/361-rcp-validate-pr.txt`). Splitting introduced no behavior change; a trailing blank
line in `search/model/placeSearch.ts` was removed after the staged whitespace check identified it.
The historical device smoke-test limitations remain; #348 merge/base synchronization is now resolved as recorded above.

## Current Booking boundary after #359

Place map/detail now consume `modules/booking` headless reservation reads and `modules/booking/offers-coupons` CTA/Offer APIs. App injects `modules/booking/reservations/map-sheet`; the Place slot and route behavior are unchanged.

The earlier #359 migration instructions above are historical. See [Booking handoff](0001-booking-migration-handoff.md) for the implemented boundaries and remaining contract-sync follow-up.

Place availability transport, Hook, generated alias, query identity and reservation CTA selector now belong to Booking. Place detail and Map sheet consume their named Booking public API; both availability cache identities and the original CTA policy are preserved.
