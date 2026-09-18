# #360 remaining V2 domain migration handoff

## Starting state and scope

- Branch: `refactor/360-remaining-v2-domain-modules`.
- HEAD and fetched `origin/dev`: `0f43336ff6c6ea2d7ffd1d4f7691e85310b49c7b` (#359 PR #373 merged).
- Initial working tree clean; behind/ahead 0/0. No prerequisite structure missing.
- Read repository AGENTS.md, full #360 and #356–#362 issue bodies, ADR/audit, Place/User/Booking
  handoffs and production-entrypoint migration before editing. Sequence: #356 epic → #357
  boundaries → #361 Place → #358 User → #359 Booking → **#360** → #362 parity-gated bridge work.
- Implementation location: **V2**. Application edits only update the Onboarding public imports
  and Merchant route implementation metadata. V1 source/root, generated contracts, snapshots,
  packages, native source, server endpoints and provider policy are unchanged.
- The implementation run made no commit or push. The subsequent user-approved local split commits are recorded below; no push. No Community, #349 reservation execution, #350 security/E2E expansion or #351 wake word.

## Structure and ownership

Before: 17 flat feature folders, 120 files: nine implementation areas (96 files), plus 24 named
Place/User/Booking compatibility exports. Complete before/after inventory, public indexes and exact
file mapping: [remaining migration inventory](0001-remaining-migration-inventory.md).

```text
src/v2/
  app/
    home/screens/HomeScreen.tsx       existing empty app shell; unused home index removed
    configureDomainMocks.ts          handler order / application registration
    i18n/resources.ts                domain resource composition, same key insertion order
    testing/                        app provider + multi-domain integration assertions
  modules/
    place/                          existing Place; remaining development handlers move here
    user/                           unchanged User ownership; consumes Travel calendar API
    booking/                        unchanged Booking ownership / public contracts
    onboarding/
      index.ts                      hydration/completion entry + preference flow/sync
      entry/                        one-time completion, hydration, auth entry decisions, storage
        __tests__/index.ts          pure existing decisions for frozen V1 navigation tests
      preferences/                  input flow/screens, local preferences, storage, schedule sync
      i18n/                         V2 onboarding ko/en resource values
    travel/
      index.ts                      headless user/purpose/recommendation query keys
      purposes/                     server enum/selection validation, API/hooks/cache
      schedules/                    server list/create/update/cancel, API/hooks/cache
      current-activity-intent/       server intent contract/API/hooks/cache
      calendar/                     date-only parsing/ranges, calendar and timezone calculations
      mock/                         named domain handler exports
      __tests__/                    API/Hook/contract tests; factories in test-only indexes
    merchant/
      index.ts                      MerchantMyPageContainer only
      api/hooks/model/              merchant-owner reads/writes, cache, mapper/presentation
      components/screens/           existing Merchant UI
      __tests__/                    API checks, spy entry and fixtures (no production import)
    voice-assistant/
      index.ts                      VoiceAssistantScreen, VoiceCommandScreen, VoiceCommandContext
      api/hooks/model/              existing #345–#348 sessions/input/commands/policy/provenance
      components/screens/i18n/      existing UI/copy and owned tests
  shared/
    analytics/conversion/           generated batch transport, mutation, retry, fixture and tests
    api/transport.ts                domain-independent client/request option types
    api/mock/                      generic registry, latency/abort/scenario handling
    api/generated/                 unchanged OpenAPI types
  features/                        29 named re-export files only, all owned by #362
```

Onboarding owns first-run completion independently of auth logout, hydration, local preference
state/storage and flow navigation. Travel owns server purpose/schedule/intent contracts and all
shared travel date calculations. Onboarding consumes Travel's named public APIs; User consumes the
same calendar implementation. No helper is copied. Existing option order, omitted NIGHTLIFE UI
option, enum validity and date/calendar selection semantics remain unchanged.

Merchant owns the existing `/merchant-owner` API, profile/owner state and MyPage presentation.
Its owner-specific Place DTO/endpoint is distinct from tourist Place detail and was **not replaced**
with that contract. It currently has no Place claim API call to migrate; no claim/detail contract
was copied and no new call was introduced. Future Place claims/tourist detail consumption must use
Place's public API. User account/session stays User/runtime-owned. Existing hand-written Merchant
DTOs remain unchanged; synchronizing these with server-generated contracts is outside this refactor.

Voice owns text/STT input lifecycle, session create/refresh/message/delete, ProviderEnvelope parsing,
allowlist/validators, policies, provenance, registry and command execution already present in #345–#348.
Place and Booking query commands consume their headless public indexes. Existing user/context facts
are injected through the same command context; no User implementation is copied. PREPARE_WRITE,
confirmation boundaries, replay/requestId rules, expiry/error mapping, text fallback and background
cleanup are unchanged. No AI key, provider policy, endpoint, logging or new command behavior is added.

Conversion is generic analytics transport/retry. Domain callers still choose event names, payloads
and timing. Shared imports no Place/Booking/User/Travel/Voice workflows and interprets none of them.

## Public API / consumer relationships

| Public boundary | Actual consumers |
|---|---|
| `modules/onboarding` | application root hydration/type contract; frozen V1 auth/onboarding adapters |
| `onboarding/entry/__tests__` | frozen V1 navigation tests through the test-only named adapter |
| `onboarding/i18n` | app catalog composition and owned option-label assertions |
| `modules/travel` | User profile query keys, Place recommendation keys, V1 profile/review query-key adapter |
| `travel/purposes`, `travel/current-activity-intent` | Onboarding's enum/selection model |
| `travel/schedules` | User calendar hooks/types and Onboarding post-login schedule sync |
| `travel/calendar` | User calendar presentation and Onboarding date input/storage |
| `travel/mock`, `place/mock` | app development/mock registration |
| `modules/merchant` | frozen V1 MainNavigator via named component re-export |
| `modules/voice-assistant` | Place assistant modal composition |
| `voice-assistant/i18n` | app locale composition |
| `shared/analytics/conversion` | Place conversion/recommendation callers; transport assertions use its narrow data entry |

All exports are named. Pure query-key reads do not load route UI. Test factories/spies use owned
`__tests__` entries; production exports were narrowed rather than expanded for tests. Internal Voice
contract assertions now import their owned models. V2 tests use `app/testing/testProviders` directly.

## Home, Community and compatibility

Home has no domain model and remains the existing app-owned empty shell. No Home module is created.
Community has no implementation folder: no feature or empty skeleton is generated. Future real
implementation starts at `src/v2/modules/community/**`, never `features/community`; app consumes its
public API, and it consumes Place/User/Booking public APIs. No code generation before server API
availability and an actual implementation issue.

All 24 previously existing #361/#358/#359 compatibility files still have frozen V1/root consumers.
They are retained. Five old paths from the newly moved modules must also remain for existing V1
consumers. These 29 files contain only comments and named re-exports, including named `as default`
aliases for existing default imports. No V2/application consumer uses them. The shared test-provider
adapter remains for exactly MainNavigator.test.tsx and SettingsNavigation.test.tsx.

The [exact #362 inventory](0001-remaining-migration-inventory.md#exact-362-handoff) lists every path,
production/test-only consumer and actual implementation. Each file also records these facts in
comments. Direct re-export preserves function/component/store/query object identity; no wrapper or
implementation clone is introduced. #362 removal still depends on #124/#139 parity.

## Mock and i18n composition

App installs handlers in exactly the old precedence: Booking, User account/notification/Scout,
Travel current intent and purposes, Place exploration/menus, Travel schedules, Place reports/visits.
Domain fixtures/handlers move to the corresponding modules; the shared registry never imports them.
Existing generic shared mock fallback responses retain their behavior; conversion batch fixtures now
belong to shared analytics. The unused production Merchant performance fixture export becomes
Merchant test support; no unsupported merchant performance endpoint is invented.

Standalone and production providers already install the app registration; their order and runtime
selection are unchanged. Independent Node Place mock suites explicitly register their owned handlers
through the same shared API instance as the client (avoids tsx direct-import/barrel instance mismatch).
App integration verifies the complete registry, scenario errors, empties, abort and handler priority.

Onboarding resource values move verbatim to its i18n entry. App reinserts `onboarding` before `map`,
retaining existing JSON insertion order, spread precedence, ko/en keys and copy. Voice i18n only
changes location. The complete catalog hash assertion is retained unchanged. Legacy onboarding
resource keys used by the frozen V1 screens stay at their existing shared boundary.

## Contract-preservation evidence

- 72 moved production files have identical non-import/non-re-export AST statement text versus HEAD.
  The only moved implementation with a structural body difference is onboardingPreference.ts:
  its date types/parsing/range/body conversion move verbatim to Travel, leaving UI selection policy
  in Onboarding. Calendar functions move unchanged. Local comparison: `/private/tmp/360-preservation.json`.
- API implementations retain methods, paths, bodies, nullable fields, generated aliases, AbortSignal
  forwarding and ApiError handling. Merchant transport gets two extra path/nullable/error regressions.
- User/purpose/schedule/current-intent query keys, invalidation/cache writes and identity are unchanged.
  The V1 profile/reviews query-key adapter re-exports the exact original object.
- AsyncStorage key strings, completion version, route names/params/deep links, i18n text, analytics
  names/payloads and production provider ordering are unchanged. Auth/logout and onboarding completion
  remain separate. Hydration gating still prevents transient wrong screens.
- Shared client/mock request types move verbatim to transport.ts; no runtime transport function changes.
- Generated OpenAPI, canonical snapshots, Android/iOS files, V1 source and the root index have no diff.
- No original assertion is removed or weakened. Tests are relocated, with API test count 172 → 174
  from the two added Merchant cases; Jest remains 126 suites / 1,230 tests. Boundary tests 68 → 75.

## Boundary and graph result

| Metric | Before | After |
|---|---:|---:|
| #360 exception entries / allowed occurrences | 22 / 22 | 0 / 0 |
| #362 exception entries / allowed occurrences | 15 / 15 | 15 / 15 |
| Total exception occurrences | 37 | 15 |
| Type-inclusive production SCCs | 1 | 0 |
| Value-only SCCs | 0 | 0 |
| Flat feature implementations | 9 folders | 0 |
| New V1 dependencies / wildcard public exports | — | 0 / 0 |

No exception maxCount increases or new exceptions. All retained tuples are unchanged. The 2-file
client↔mock SCC becomes a DAG: client → mock, client → transport types, mock → transport types.
No type-only back edge remains. Full before/after graphs and counts are in [the audit](0001-v2-boundary-audit.md).
GREEN/RED fixtures protect the three newly classified V1 test adapters; a repository invariant
checks #360 zero exceptions, no SCC, named-only compatibility and no V2 compatibility consumers.

## Validation

`npm run validate:pr` passed, exit **0**. After the final test-only Onboarding export was moved
from a production public entry to `entry/__tests__`, boundary/type checks and the entire Node
regression suite passed again. No production implementation changed after the full Jest run.

| Command | Exact result |
|---|---|
| `npm run audit:v2-boundaries` | Passed; 510 production files, 1,874 imports, 1,384 local imports; SCC 0 |
| `npm run check:v2` | Passed; 75 boundary tests (68 existing + 7 new) |
| `npm run typecheck` | Passed |
| `npm run test:v2-api` | 174 passed (172 existing + 2 Merchant cases) |
| `npm run test:v2-map` | 48 passed |
| `npm run test:v2-notifications` | 7 passed |
| `npm run test:navigation` | 22 passed |
| `npm run test:i18n-formatters` | 11 passed; unchanged complete-catalog hash assertion |
| `npm run test:regression` | Passed, including final test-only adapter path |
| `npm run validate:pr` | Passed; ownership harness 2, Jest 126 suites / 1,230 tests, all five Node suites |
| `npm run check:v1-changes -- --base origin/dev` | Passed; no V1 source additions/modifications |
| `git diff --check` | Passed |
| Targeted Onboarding/Travel/Merchant/Voice Jest | 20 suites / 421 tests passed; also included in full Jest |

Final logs: `/private/tmp/360-validate-pr-final.log`, `360-regression-final.log`, `360-api-final.log`,
`360-check-final.log`, `360-typecheck-final.log`, `360-v1-final.log`, `360-diff-check-final.log`.

Change inventory: **350 paths** (107 modified, 111 removed, 132 new; unstaged moves count both ends).
Major entries are the four module roots, shared analytics, app Home/mock/i18n composition,
shared transport contract, boundary fixtures and the two remaining-migration documents.
The initial implementation was unstaged and uncommitted. The later user-approved local split is recorded below; no push.
The first full run passed all Jest tests but found three independent Place mock failures after moving
registration out of shared. Explicit same-instance handler registration corrected them; API rerun
passed 174/174. No expectation was relaxed. Existing React act warnings remain non-failing.

## Unverified runtime work and follow-up

No changed-build Android/iOS install, launch or UI smoke test was performed. Native STT/microphone,
background cleanup, map/location, app hydration/login/logout, onboarding re-entry, Travel date UI,
Merchant permission/network states, Voice/touch coexistence and locale/device presentation remain
manual QA. Automated/mock results do not establish physical-device behavior.

No live-server mutation or AI-provider request was performed. No live API-vs-snapshot comparison is
claimed. The previously recorded #359 additive nullable Coupon fields drift remains a separate
contract-sync follow-up; no snapshot/type change is included here. Existing Merchant hand-written
contracts likewise remain unchanged. No new server discrepancy is inferred from this refactor.

Follow-ups: #362 exact compatibility/production bridge inventory, #124/#139 parity before deleting
V1 paths, and Android/iOS/live-server QA. #349/#350/#351 remain separate Voice feature work.

V1 dependency delta: **none**. `legacy-exception`: **not required**.

## Local split commits (2026-09-19)

The user invoked the rcp skill and explicitly approved all eleven Korean messages. Repository
README/AGENTS, V2 README, PR template, CI workflow and package scripts were checked before staging.
The original final tree was preserved under `/private/tmp/360-rcp/final`; intermediate snapshots
were assembled under `/private/tmp/360-rcp/build` without replacing the user's final working files.

Each of the ten source commits passed `check:v2` and `typecheck`. Import/public-index updates,
mock registration and exact stale-exception removal accompany the respective domain moves.
Temporary broader named indexes preserve intermediate consumers and are narrowed in commit ten.
No boundary rule or test assertion was weakened. Staging found trailing blank lines in four new
files (transport types, conversion fixture, Travel dates, Merchant performance fixture); only those
EOF blank lines were removed from the final snapshot. Runtime implementation bodies are unchanged.

| Commit | Approved unit |
|---|---|
| `1719aa0` | Refactor: #360 API transport 계약 분리 및 mock 순환 의존 제거 |
| `e179da2` | Refactor: #360 Conversion 전송과 재시도를 공통 Analytics로 이동 |
| `be0375c` | Refactor: #360 여행 목적과 현재 활동 의도를 Travel로 분리 |
| `796d574` | Refactor: #360 여행 일정과 공통 달력 계산을 Travel로 분리 |
| `b931ffd` | Refactor: #360 최초 온보딩 완료 및 hydration 경계 분리 |
| `f1cce82` | Refactor: #360 온보딩 목적·일정 선택 페이지와 로컬 상태 분리 |
| `9b82b29` | Refactor: #360 Merchant 마이페이지와 owner API 분리 |
| `6fb2d5e` | Refactor: #360 Voice Assistant 입력·세션·명령 화면 분리 |
| `957bf5b` | Refactor: #360 Home 화면을 앱 조립 경계로 이동 |
| `f5af82e` | Refactor: #360 도메인 mock 조립과 호환 export 경계 정리 |

The eleventh documentation commit records this final structure, compatibility inventory, validation
and split history. No previous commit was amended and no push was performed.

Additional intermediate verification: conversion-stage API 172 passed; Travel-stage API 172 passed;
Onboarding-entry navigation 22 passed; Onboarding pages/calendar/V1 flow Jest 9 suites / 57 tests
passed; Merchant/MainNavigator Jest 4 suites / 30 tests and API 174 passed; Voice/Place assistant
Jest 11 suites / 361 tests passed. The final source snapshot matches the final worktree byte-for-byte.
The pre-commit `validate:pr` run passed 126 Jest suites / 1,230 tests, boundary 75, ownership 2,
navigation 22, i18n 11, notifications 7, map 48 and API 174. Log:
`/private/tmp/360-rcp-validate-pr.log`; per-stage logs are in `/private/tmp/360-rcp/stage-*`.
Final V1 change-policy and base-to-worktree whitespace checks passed. All existing physical-device
and live-server/AI-provider verification limitations above remain unchanged.
