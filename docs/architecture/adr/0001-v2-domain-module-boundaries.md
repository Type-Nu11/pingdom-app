# ADR 0001: V2 domain modules and import boundaries

- Status: accepted; Place #361, User #358 and Booking #359 implemented. Remaining migrations are #360/#362.
- Baseline: `refactor/357-v2-domain-boundary`, `27ace6bc71c50c5e9c8c626c7026359e06306827`.
- Parent: #356. Sequence: #357 → #361 → #358 → #359 → #360 → #362.
- Inspected: AGENTS.md, complete bodies/comments of #356–#362, V2 README,
  production entrypoint migration document, existing boundary script, tsconfig and Metro config.
  #358's prerequisites #319/#320/#321 are already merged; HEAD vs origin/dev was 0/0.
- No existing ADR naming scheme was found; this starts the numbered ADR directory.
- See [the baseline/current graph audit](0001-v2-boundary-audit.md) and the executable
  [exact exception inventory](../../../scripts/v2-boundaries/exceptions.json).

## Decision and ownership

```text
src/application/       production composition and injected runtime infrastructure only
src/v2/
├── app/               providers, navigation, module and i18n composition
├── modules/
│   ├── place/
│   ├── booking/
│   ├── user/
│   ├── onboarding/
│   ├── travel/
│   ├── merchant/
│   └── voice-assistant/
└── shared/            domain-independent infrastructure, generated contracts and primitives
```

Default dependency direction is `app → modules → shared`. Modules may use another
module's explicitly published API when needed; cross-module cycles remain forbidden.
Shared code must not depend on a domain or app. Domain code must not depend on app.
`src/application` composes production providers/routes and injects runtime services;
it is not a second home for domain logic. Semantic ownership (for example business
calculations in a composition file) requires code review; an import graph cannot prove it.
The checker restricts its imports and freezes its existing V1 bridge edges.

`features` remains the transitional layout. Each existing feature is checked as its
own boundary until its migration, even where two features will share a domain.
There is no blanket exemption for `features`. No existing feature directory moves in #357.

The audit records the current module and transitional-feature inventory. The original #357 inventory of 28 feature folders remains available in Git history. Decisions for ambiguous features:

- `auth`: User account/session API and mutations (#358). Auth route composition stays
  in app; parity-dependent V1 auth screens remain explicit production bridges (#362).
- `check-ins`: Place visit evidence (#361), distinct from booking confirmation.
- `conversion`: Shared analytics ingestion (#360): transport, batch DTO and retry only.
  Domain callers own when an event is emitted; shared must never import a caller or
  interpret Place/Booking business workflows. Preserve the generated event contract.
- `current-activity-intent`: Travel's current user travel intent (#360). User identity in
  its query prefix does not transfer ownership; preserve existing cache identity.
- `home`: App composition (#360); today's empty landing shell owns no domain model.
- `map-home-feeds`: Place discovery/ranking feeds (#361), not app navigation.
- `visitor-verification-reports`: Place verification/report corrections (#361). User's
  verified-place presentation consumes this API; it does not own the report contract.
- `place-claims`: Place claim contract (#361); Merchant consumes its public API.
- Community: no current feature folder. Additional ownership decision is required in
  #360 before adding functionality; do not invent an eighth module in this refactor.

## Public API and data flow

Outside a feature/module, import only its `index.ts` or a subfeature's public `index.ts`.
The target must actually resolve to that file. An `index.ts` underneath `screens`,
`hooks`, `api`, `model`, `services`, `store`, `styles` or `components` is internal, not
an escape hatch. Resource-only `i18n/index.ts` is a supported subfeature entrypoint.
Use named exports; public `export *` is rejected (three existing exports are frozen
until #360). Keep exports small and intentional; review the necessity of each.

Relative imports within the same module are allowed, subject to the data-flow,
cycle and V1 rules. Type-only imports, inline `import { type T }`, type re-exports
and `import('path').T` follow exactly the same boundary rules as value imports.

Forbidden, except for the exact checked-in migration edges:

- `shared → features/modules` and shared/domain → app composition.
- V2 → V1 screens, hooks, store, API, styles or other legacy source.
- External callers → internal feature/module paths (including app and application callers).
- Screen → API; use domain hooks. This includes shared API barrels and types.
- Feature/module hook → shared API surface; use domain API/model contracts.
- V2 relative imports escaping V2. Static assets under `src/assets/v2/` are allowed.
- Production → test/test-support code.
- New production composition → legacy bridge dependencies without explicit migration review.

Screen/hook roles are recognized by their directories and conventional `*Screen` /
`use[A-Z]*` filenames. The architecture rules also apply when files are renamed;
review unconventional roles rather than using names to evade data flow. Re-exporting
an API call under a misleading symbol cannot be semantically detected by this scanner.

## Graph policy and scanner

`npm run check:v2` runs the scanner **and its fixture tests**. `validate:pr` already runs
`check:v2`; no separate CI path can omit the new checks. `npm run audit:v2-boundaries`
prints current feature counts, graph edges, violation counts and cycle components as JSON.
It is read-only and cannot regenerate the exception manifest.

The existing TypeScript compiler API parses TS/TSX/JS/JSX/MJS/CJS/MTS/CTS. It handles
static imports, side effects, export-from, dynamic import, require, multiline and type-only
forms. Comments and ordinary strings are not scanned as imports. Computed module paths
fail closed. Parse errors and unresolved relative/local source imports fail.
Resolution uses the repository tsconfig (including configured paths), then explicit local
extension/index and legacy alias resolution. This repository currently has no custom path
aliases in tsconfig or Metro; `@/`, `~/`, `@features/`, `features/`, and `src/` legacy forms are nevertheless
covered. External npm package internals and arbitrary metaprogramming are outside the graph.

The production graph checks **every non-test V2/application source**, not just routes
reachable today, and follows its local transitive dependencies through composition bridges.
The audit includes root files `index.ts`, `App.tsx`, `App.v2.tsx` in the parsed repository graph.
Tests are identified by `__tests__`, `__mocks__`, `.test.*`, `.spec.*`, and the dedicated
`shared/testing` / `app/testing` support directories. Being a test does not disable import
rules: existing cross-domain contract assertions have exact, test-tagged exceptions.
Tests may consume the explicit app testing support boundary; production cannot.

Tarjan strongly connected components (SCCs) include **type-only and lazy import edges**.
Type erasure prevents some runtime cycles but does not remove architectural coupling;
including types avoids a public barrel becoming a migration trap. The audit also shows
value-only SCCs separately. The baseline had two SCCs; i18n is removed here. One two-file client/mock type
SCC remains with both participating edges frozen for #360. Place/User fixture reversals have
been removed. It contains no value-only cycle. New SCC members or internal edges fail.

The previous StyleSheet, centralized `process.env` and axios-layer rules are preserved,
now on parsed syntax rather than raw comments/strings. These also apply to test code.

## Explicit migration exceptions

The manifest stores **source file, resolved target file, original specifier, rule,
type-only flag, test flag, maxCount, reason, and removal issue**. The full tuple is matched;
no wildcard, filename-only exemption or automatic baseline update is provided.
A duplicate import beyond maxCount fails. A new source/target/specifier fails. Changing a
value edge to a type edge does not silently inherit an exception. Stale exceptions or excess
capacity fail so removals reduce the inventory in the same PR. Duplicate/malformed manifest
entries fail. Counts describe rule occurrences, not unique dependencies: one edge can break
several rules. See the audit for counts and exact production inventory.

- #361: no remaining exceptions.
- #358: no remaining exceptions; User siblings also enforce public indexes.
- #359: no remaining exceptions; Booking siblings enforce public indexes and domain tests/mocks follow their owner.
- #360: remaining domain migration, public wildcard exports, shared mock/type SCC cleanup,
  and remaining integration-test ownership.
- #362: ten active legacy bridge occurrences and production-navigator bridge assertions; User/Place production deep imports and PlaceDetail upward type edges are removed.

The exception manifest is a reviewed migration inventory, not permission to grow debt.
As each domain moves, update callers to public indexes and delete its exceptions.
The test-only `shared/testing/testProviders.tsx` compatibility re-export remains so V1
and existing tests need no churn. Its implementation is now app-owned; move callers and
remove the compatibility path in #360. This is a test-support boundary, not a production
shared-to-domain exception.

## i18n composition

Previously `shared/i18n/resources.ts` imported resources from voice-assistant,
offers-coupons, reservations and place-visit-verification. These four imports are removed.
Each feature retains its resource and exposes a narrowly scoped `i18n/index.ts`.
`app/i18n/resources.ts` assembles the same complete resources with the same spread order;
`app/i18n/index.ts` registers them through `configureI18nResources` before initialization.
Shared owns the instance, base resources, language hydration, formatters and generic
registration interface. It imports no domain resources. Existing monolithic base copy is
not redistributed in this issue; no feature resources are copied back into shared.

Development AppProviders and production ProductionProviders use the same app initializer.
The only `src/application` change is that provider import: required composition wiring,
not new application logic. App's test provider uses the exact same assembled resources.
The old shared test-provider entrypoint is only a compatibility re-export.

The complete assembled JSON equals the baseline byte-for-byte (SHA-256
`729980606c4d19541a82bad8ea99b4820d407253e50f0b3fc5efbb636213dbec`). Tests retain
ko/en key parity, stored/profile/device language precedence, `language` persistence,
English fallback, missing-key handling, idempotent registration and initialization.
The registration interface can update an already initialized instance without changing
its selected language. Feature-specific registration helpers remain for existing callers.

## Scope, limitations and follow-up

No route/param/deep link, query/cache key, persisted storage key, API endpoint/generated
contract, auth/notification lifecycle, location permission, screen design, or theme changes.
No new package. No V1 production source changes: dependency delta `none`; no `legacy-exception` label.
With explicit user approval, the catalog regression test moves from
`src/shared/i18n/__tests__/resources.test.mjs` to `src/v2/app/i18n/__tests__/resources.test.mjs`;
all four assertions remain in `test:i18n-formatters`. The old location is deleted only.
The user subsequently authorized separate i18n, checker and documentation commits; no push. The historical #357 run deferred domain moves to #361/#358/#359/#360; production
bridge deletion remains gated by #124/#139 and reviewed in #362. Automated checks do not
claim physical-device QA. Import checks cannot prove absence of arbitrary business logic
inside `src/application`; review remains necessary for semantic ownership.

## User migration implementation (#358)

[User handoff](0001-user-migration-handoff.md) and [exact inventory/public API](0001-user-migration-inventory.md)
record the six feature moves, separated profile/My Page presentation, mock injection and compatibility consumers.
User sibling submodules consume named indexes; the checker enforces this even within the User module.
Domain tests move with their contracts. Test-only indexes and the two frozen V1 test adapters are
classified as test support and rejected as production dependencies.

Application configures User development mock handlers through the generic shared registry. Shared
imports no User module. The remaining SCC has only the unchanged client/mock type boundary (#360).
V1 MainNavigator/root background consumers retain eleven documented compatibility exports until #362;
no new V1 dependency, maxCount increase or Booking folder move. Device smoke QA remains unverified.

## Booking migration implementation (#359)

[Booking handoff](0001-booking-migration-handoff.md) and [exact inventory/public API](0001-booking-migration-inventory.md)
record Reservations, Payments and Offers/Coupons ownership. App/Place/User/Voice consume named
Booking indexes. Headless root queries are separate from reservation routes, map-sheet, Offer UI,
i18n and mock registration. Tests consume test-only indexes for API spies.

Screen API error interpretation is in a Booking presentation model; Place summary reads pass through
an internal Booking hook without replacing Place query/cache ownership. Reservations use Payments'
public hook/presentation API. Generated payment aliases are at the payment API contract boundary.

App injects Booking handlers through the #358 generic domain registry. Shared has no Booking import.
#359 exceptions are 35 entries/37 occurrences → 0; #360 remains 22/22, #362 falls 16/16 → 15/15.
No SCC growth or V1 dependency is introduced. V1 compatibility files retain identity until #362.
