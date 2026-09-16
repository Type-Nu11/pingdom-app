# #357 implementation and validation handoff

Implementation-stage validation HEAD: `27ace6bc71c50c5e9c8c626c7026359e06306827`.
Branch: `refactor/357-v2-domain-boundary`; initial origin/dev ahead/behind 0/0.
This report records validation before the user-authorized three-part commit sequence
(i18n, boundary checks, documentation). No push. No feature directory migration.

Implementation: V2 plus scripts/docs/package.json. The production provider has one
composition import change in `src/application/ProductionProviders.tsx`. The user explicitly
approved moving only the catalog regression test from the old shared location into V2 app.
Its four test bodies are unchanged; only resource imports and repository-root resolution change.

See [ADR](0001-v2-domain-module-boundaries.md), [ownership/graph audit](0001-v2-boundary-audit.md),
and [exact exceptions](../../../scripts/v2-boundaries/exceptions.json).

## Final validation

| Command | Result |
|---|---|
| `npm run check:v2` | PASS; graph and 60 fixture tests |
| `npm run test:v2-boundaries` | PASS; 60 tests separately |
| `npm run typecheck` | PASS |
| `npm run test:navigation` | PASS; 22 tests |
| `npm run test:v2-map` | PASS; 47 tests |
| `npm run test:v2-api` | PASS; 145 tests |
| `npm run test:regression` | PASS; 232 tests = navigation 22 + i18n 11 + notifications 7 + map 47 + API 145 |
| `npm run validate:pr` | PASS; boundary 60 + ownership 2; Jest 120 suites / 1,063 tests; all 232 regression tests |
| `npm run check:v1-changes -- --base origin/dev` | PASS |
| `git diff --check` | PASS |

The V1 policy command checks committed changes. At the implementation-stage validation, changes were uncommitted, so
we also inspected the working-tree diff against origin/dev: no V1 feature additions or
modifications. The only removed old test is the explicitly approved catalog-test move.
Existing React act warnings remain; unrelated UI tests were not changed to suppress them.
The first regression run exposed the old catalog test's shared-resource assumption;
after the approved test move, the final complete runs above passed. No test was removed
from the executed regression suite. tsx runs required sandbox escalation for local IPC.

The assembled ko/en catalog exactly matches the baseline resource object; its SHA-256,
key parity, hydration/persistence/fallback and shared test/application bundles have dedicated
regression coverage. The added Jest suite contains seven tests (baseline 119/1,056 → 120/1,063).

## Contracts and remaining work

No user functionality, screen design, navigation route/param, deep link, query key/cache
identity, persisted storage key, API endpoint/generated DTO, auth/session hydration,
notification lifecycle, map/place, booking/payment/coupon, permissions/verification,
language selection/fallback or theme contract changes. No new dependency package.
No native-device test is claimed for this structural change.

V1 dependency delta: `none`. `legacy-exception`: not required.

No implementation blocker remains. Existing migration debt is deliberately frozen:
370 exact exception entries / 374 rule occurrences, including 112 production and 262 test
occurrences. The remaining type-inclusive mock SCC has 10 files / 14 directed edges;
value-only production cycles are zero. Both remaining shared-to-feature imports are mock
fixture types. These are not new dependencies. Follow-up ownership:

- #361: Place/Map, Place contracts and verification public exports.
- #358: User/Settings/auth account contracts.
- #359: Booking/reservation/payment/coupon contracts.
- #360: remaining domains, analytics transport, test-support compatibility path,
  public export cleanup, and shared mock/type SCC with #358/#361.
- #362: application composition imports, navigation contract inversion and active V1 bridges;
  actual bridge removal still requires #124/#139 parity.

## Changed files

- `docs/architecture/adr/0001-v2-boundary-audit.md`
- `docs/architecture/adr/0001-v2-boundary-validation.md`
- `docs/architecture/adr/0001-v2-domain-module-boundaries.md`
- `docs/v2-production-entrypoint-migration.md`
- `package.json`
- `scripts/__tests__/v2Boundaries.test.mjs`
- `scripts/check-v2-boundaries.mjs`
- `scripts/v2-boundaries/audit.mjs`
- `scripts/v2-boundaries/exceptions.json`
- `scripts/v2-boundaries/graph.mjs`
- `scripts/v2-boundaries/rules.mjs`
- `src/application/ProductionProviders.tsx`
- `src/shared/i18n/__tests__/resources.test.mjs` (old location deleted; moved to V2 app)
- `src/v2/README.md`
- `src/v2/app/AppProviders.tsx`
- `src/v2/app/i18n/__tests__/composition.test.ts`
- `src/v2/app/i18n/__tests__/resources.test.mjs`
- `src/v2/app/i18n/index.ts`
- `src/v2/app/i18n/resources.ts`
- `src/v2/app/testing/testProviders.tsx`
- `src/v2/features/offers-coupons/i18n/index.ts`
- `src/v2/features/place-visit-verification/i18n/index.ts`
- `src/v2/features/reservations/i18n/index.ts`
- `src/v2/features/voice-assistant/i18n/index.ts`
- `src/v2/shared/i18n/__tests__/statusLabels.test.ts`
- `src/v2/shared/i18n/index.ts`
- `src/v2/shared/i18n/resources.ts`
- `src/v2/shared/testing/testProviders.tsx`
