# #359 Booking migration handoff

## Starting state and scope

- Implementation: **V2**, plus application route-parity ownership metadata.
- Branch: `refactor/359-booking-domain-module`.
- Starting HEAD and fetched `origin/dev`: `ea321b90fc3b265b1f430c1cda84885ff2668a9a`.
- Initial working tree clean; behind/ahead **0/0**. #358 PR #372 is in the base.
- Read complete repository AGENTS.md, #359 and #356–#362 relationships, ADR/audit,
  Place/User handoffs and production-entrypoint migration document before edits.
- Sequence: #356 epic → #357 boundaries → #361 Place → #358 User → **#359 Booking** →
  #360 remaining modules → #362 compatibility/production bridge review with #124/#139 parity gates.
- No push, new package, V1 edit, native edit, generated-type or snapshot edit.
- Local feature/page commits were authorized after implementation, using the rcp workflow.

## Ownership before / after

Before: `features/reservations` (25 files), `features/payments` (7),
`features/offers-coupons` (20), plus shared Booking tests and development mocks.
Exact file mapping and production exports: [inventory](0001-booking-migration-inventory.md).

```text
src/v2/modules/booking/
  index.ts                         headless reservation reads for Place/User/Voice
  reservations/
    index.ts                       headless reservation contracts and hooks
    api/                           transport, generated request/response aliases
    hooks/                         queries, mutations, invalidation, Place summary adapter
    model/                         availability/product, dates, idempotency, booker/error/status
    screens/                       create, box, detail (same routes and components)
    routes/index.ts                named route exports, separate from headless reads
    components/                    records and reservation sheet
    map-sheet/index.ts             app-injected Place sheet composition
    i18n/                          unchanged reservation copy
    mock/                          availability, tourist records, merchant compatibility data
    __tests__/                     screens and test-only API entry
  payments/
    api/                           payment transport and generated contract aliases
    hooks/                         paginated queries and all-pages query
    model/                         cache identity and payment status/amount presentation
    i18n/                          payment status copy formerly in shared
    mock/                          nullable/status-rich payment records and handlers
    __tests__/index.ts             test-only API/query entry
  offers-coupons/
    api/                           Offer/Coupon contracts and transport
    hooks/                         queries, issue/redeem, invalidation and cache updates
    model/                         Offer availability, Coupon status/error presentation
    components/                    Place CTA and error state
    i18n/                          Offer/Coupon copy plus Offer statuses formerly in shared
    mock/                          fixtures and registry handlers
    __tests__/                     contracts/errors and test-only API entry
  mock/index.ts                    domain handler list for existing shared registry
  __tests__/                       API/Hook contracts, status/i18n and presentation
```

`routes` is intentionally separate: importing availability reads must not load native route UI.
User continues to own MyPage, CouponBox/CouponDetail/QR UI and account settings composition.
Place continues to own map/detail/search, the sheet slot and Place detail query/cache implementation.
Its availability API, hook, DTO alias, query key and reservation CTA eligibility now belong to Booking.
Booking's internal summary hook delegates the existing Place detail query without duplicating it.
Generated contracts remain in `shared/api/generated`; shared retains transport, generic mock
registry, token/session infrastructure, common primitives and i18n registration.

## Public API and consumers

The inventory lists every named export. No public `export *` is used.

- Booking root: availability query options/types, selectable-availability predicate,
  nearby reservation reads/limit, user's reservation-list hook, Place availability hook/type and CTA state selector.
- Reservations routes: CreateReservationScreen, ReservationBoxScreen, ReservationDetailScreen.
- Reservations map-sheet: ReservationBottomSheet. Reservations i18n: reservationResources.
- Payments: useAllPayments, getPaymentAmount, getPaymentStatusView; separate paymentResources.
- Offers/Coupons: PlaceCouponCta, OfferCouponErrorState, Coupon/Offer/status contracts,
  Coupon usability/status and Offer issuance selectors, Coupon/Offer queries and hooks.
- Resource indexes: offerCouponResources, offerStatusResources, paymentResources, reservationResources.
- Mock index: bookingMockHandlers, composed through `app/configureDomainMocks`.

App uses these indexes for routes, sheet injection, locales and mock registration. Place map/detail
use Booking read APIs and Coupon/Offer UI. User uses Booking reservation statistics and Coupon
queries/status/Offer enrichment. Voice only changes its existing reservation import location;
no #360 feature is moved. Test spies/factories use explicit test-only indexes; production cannot
import those indexes or the frozen Coupon test adapter.

Screen → shared API is removed. Create errors and refresh decisions live in the Booking model;
Place summary access goes through a Booking hook. Reservation detail uses the Payments public
hook/presentation index. Hook → shared API and external → Booking deep imports remain forbidden.

## Contract preservation evidence

- The extracted Place availability API forwards the same path and AbortSignal, retains the existing
  PlaceExploration generated response alias and preserves `[v2, places, entity, placeId, availabilities]`.
  Reservation-create availability keeps its distinct existing key. No cache identity is merged and
  existing invalidation scope is not broadened. Place reservation CTA state selection moves verbatim;
  its disabled/error/empty/full behavior is unchanged. Two existing standalone Node assertions move
  from Place tests to Booking without changing their bodies. The mixed Place/Booking API test keeps
  its full path/signal assertions and uses Booking's test API factory.
- Reservation API, Offer/Coupon API, Payment API and query/mutation implementations preserve
  their non-import statement bodies. Endpoints, methods, DTOs, AbortSignal forwarding, ApiError
  normalization, pagination, query keys, mutation invalidations and cache updates are unchanged.
- Reservation availability/date/idempotency helpers, product selectors, booker validation,
  payment amount/status presentation and Offer/Coupon policy selectors move unchanged.
- Create screen retains quantity/availabilityId/idempotencyKey fields, maximum key length 100,
  per-entry initialization, duplicate-submit guard, same-key network retries and existing reset policy.
  Error-key selection and the two-code availability refresh predicate were extracted without changes.
- Local timezone dates, disabled past/unavailable dates, real slot IDs, quantity/refetch selection
  clearing, all load/error/empty/capacity states and GENERAL/TICKET/CLASS restriction are preserved.
- Payment amountMinor/currency and nullable fields remain untouched; no conversion is introduced.
  Payment pages, failureCode display and reservation-detail linkage retain their original behavior.
- Multiple Offers, stock/period/benefit presentation, Coupon state filters and actual coupon.code QR
  contracts are covered by retained tests. User QR UI remains User-owned and never treats used/expired
  coupons as valid; no Coupon policy is redesigned.
- 23 moved production files have byte-identical non-import/non-re-export AST statements versus HEAD.
  The three structural differences are CreateReservationScreen (extracted helpers/summary delegation),
  payment.types (identical generated aliases moved to api/paymentContract), and Offer resource initialization
  (only its lazy shared-i18n import path changes). Evidence: `/private/tmp/359-preservation.json`.
- Offer/payment status resources move verbatim from shared to Booking. The complete assembled ko/en
  catalog equals HEAD structurally. Canonical sorted JSON SHA-256:
  `75ae828fa6091fb03a79e50ed35e0211202ad4dcba1e03ef5538bc36dc68a410`.
  Existing spread precedence, keys, copy, language persistence and fallback are preserved.
- Regenerating both OpenAPI snapshots into `/private/tmp` produces files identical to checked-in
  `generated/reservationPayment.ts` and `generated/offersCoupons.ts`. Neither snapshot nor generated
  source is modified. Route names/params/deep links/storage keys and analytics are unchanged.

## Live OpenAPI follow-up (not mixed into this refactor)

Read-only fetch of `https://www.typenull.xyz/v3/api-docs/app` succeeded during preflight.
Reservation/payment operations and referenced schemas match their scoped snapshot (operation IDs
are intentionally normalized by the existing sync script).

Live CouponResponse additionally requires four **nullable** fields: offerTitle, benefitDescription,
placeId and placeName. Those fields are absent from the stored Offer/Coupon snapshot and generated
type. GET /coupons and POST /offers/{offerId}/coupons descriptions also differ. Existing Booking
fields, states and methods remain available; no required contract for the existing behavior is missing.
This additive drift is a separate contract-sync follow-up, not permission to change DTOs here.
No GitHub follow-up issue was created. Evidence: `/private/tmp/359-live-openapi.json`.

## Mock registry and boundaries

The #358 shared registry is reused; there is no parallel mock framework. App installs Booking
handlers before the remaining feature fallbacks. Availability's mixed product list priority and
tourist-before-merchant transition precedence are preserved. Shared imports no Booking code.
Generic errors/latency/abort behavior stays shared; Offer detail under empty scenario retains 404.
Two unreferenced duplicate availability fixtures and unreachable shared fallback branches are removed;
active responses and every pre-existing assertion remain intact.

| Owner | Exception entries | Allowed occurrences |
|---|---:|---:|
| #359 | 35 → **0** | 37 → **0** |
| #360 | 22 → 22 | 22 → 22 |
| #362 | 16 → 15 | 16 → 15 |

No retained tuple changes or maxCount increases. The removed #362 tuple was the shared status-label
suite's upward app-resource import. New production SCCs: **0**. The original two-file/two-edge
shared client/mock type SCC stays unchanged. External/Place/User → Booking internals, shared →
Booking, Booking → app/application production imports, and new V1 dependencies: **0**.
[Current audit](0001-v2-boundary-audit.md) records the full graph and exact exception inventory.

## V1 compatibility and #362

All five compatibility files contain only comments and named re-exports (including the named
`as default` alias required by frozen V1 component imports). They preserve original identities.

| Compatibility path under src/v2/features | Actual consumer | Kind |
|---|---|---|
| reservations/screens/CreateReservationScreen.tsx | src/app/navigation/MainNavigator.tsx | production component |
| reservations/screens/ReservationBoxScreen.tsx | src/app/navigation/MainNavigator.tsx | production component |
| reservations/screens/ReservationDetailScreen.tsx | src/app/navigation/MainNavigator.tsx | production component |
| offers-coupons/index.ts | src/app/navigation/types.ts | production Coupon type |
| offers-coupons/api/offerCouponApi.ts | src/app/navigation/__tests__/SettingsNavigation.test.tsx | test-only API spy object |

Remove with those precise consumers in #362, respecting #124/#139 parity. No #359 exception remains
for compatibility and no #362 exception is added. Positive/negative checker fixtures prevent the
Coupon test adapter from entering production and enforce Booking sibling indexes.

## Validation

Final full source validation: `npm run validate:pr`, exit **0**. No assertions relaxed or deleted.

| Command / coverage | Result |
|---|---|
| audit:v2-boundaries | Completed; graph/exception results above |
| check:v2 | Passed, 68 boundary tests (previous 63 + 5) |
| typecheck | Passed |
| Direct Booking Node API/Hook/presentation + mock registry | 21 passed |
| Direct Booking/User/settings/Place detail Jest | 41 suites / 375 tests passed |
| Direct Booking/Place detail/map Jest after final availability extraction | 38 suites / 351 tests passed |
| Direct i18n composition/status Jest | 2 suites / 44 tests passed |
| Full Jest in validate:pr | 126 suites / 1,230 tests passed, unchanged count |
| test:v2-api | 172 passed (previous 168 + 4 registry tests) |
| test:v2-map | 48 passed |
| test:navigation | 22 passed |
| test:i18n-formatters | 11 passed |
| test:regression | Passed, including 7 notification tests |
| validate:pr | Passed, including 2 ownership harness tests |
| check:v1-changes -- --base origin/dev | Passed, no V1 additions/modifications |
| git diff --check | Passed |
| Snapshot → generated type comparison | Both identical |
| Complete ko/en resource comparison | Identical keys and values |

Direct suites include reservation APIs/hooks/models and create/box/detail/sheet, payment API/hooks/
presentation, Offer/Coupon APIs/hooks/error UX/CTA/status, MyPage/CouponBox/CouponDetail/QR and Place
CTA. Existing tests cover idempotency, duplicate submission, selection and invalidation. Added app
integration tests verify Booking registration, handler priority, records, empties, errors and aborts.

The first Node run was blocked by sandbox IPC; permitted reruns passed. The first API run exposed
UI imports in a test barrel, corrected by keeping the test API headless. Extracting shared status copy
also exposed the catalog's serialization-order assertion; app insertion order was restored and the
original hash assertion passes unchanged. Existing React act warnings
remain in Jest output; no skipped tests were introduced. Logs: `/private/tmp/359-validate-pr.txt`,
`359-targeted-jest.txt`, `359-api.txt`, `359-regression.txt`, `359-map.txt`, `359-navigation.txt`,
`359-i18n.txt` and before/after audit files in the same temporary directory.

## Change size

Pre-commit final inventory: **202 paths** — 58 modified, 56 removed, 88 new. This counts source and
destination separately for unstaged moves. Booking contains 85 files (58 production sources and
27 test/support sources). The subsequent user-approved split uses 11 local commits: reservation
contracts, payments, create/box/detail pages, map sheet, Offer/Coupon contracts, Coupon UI consumers,
mocks/i18n, public boundaries and documentation. No push is included.

Intermediate snapshots preserve named compatibility re-exports until the public-boundary commit
removes temporary adapters. Each snapshot is checked with `check:v2` and `typecheck`; the final
source also passed `validate:pr` again before committing.

## Manual QA and remaining work

Android/iOS changed-build installation, launch and UI smoke were **not performed**. Native map,
reservation navigation, date/person/slot selection, submit/retry, payment linkage, Coupon issuance/
QR, back/deep links and localization on a running changed build remain device QA work.

No live-server reservation creation/cancellation, payment or Coupon issuance/redemption was executed.
Read-only OpenAPI inspection and mock success are not a real-server transaction smoke test.
No remaining automated implementation blocker. Follow-ups: additive Coupon contract synchronization,
#360 remaining domain/SCC work, #362 compatibility removal and Android/iOS/live-server QA.

V1 dependency delta: **none**. `legacy-exception`: **not required**.
