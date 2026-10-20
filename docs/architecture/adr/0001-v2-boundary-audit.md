# V2 boundary audit for ADR 0001

Current: **#362**, branch `refactor/362-production-composition-boundary`, clean start at fetched
`origin/dev` `62e3b621`, ahead/behind 0/0. See [#362 handoff](0001-production-composition-handoff.md)
and [current production graph](0001-production-dependency-graph.json).

| #362 metric | Before | After |
|---|---:|---:|
| Exception entries / occurrences | 15 / 15 | 6 / 6 |
| Production / test exceptions | 10 / 5 | 6 / 0 |
| Production SCC including types | 0 | 0 |
| Flat feature compatibility files | 29 | 0 |
| Production reachable local dependencies / edges | re-audited below | 536 / 1349 |

No new exception tuples or maxCount increases. The remaining six exact imports preserve auth UI,
CheckIn/Merchant injection and session/transport/token runtime; each reason specifies #124/#139.
No V2 upward/legacy test exceptions remain. All compatibility consumer replacements are public APIs.
Device QA remains incomplete; V1 dependency delta `removed`, `legacy-exception` required for V1 edits.

The following #360 measurements are historical, not the current folder/exception inventory.

Historical #360 snapshot: branch `refactor/360-remaining-v2-domain-modules`, clean start at fetched `origin/dev` `0f43336`; behind/ahead 0/0. Prior audits are in Git history and the Place/User/Booking handoffs.

See [remaining migration handoff](0001-remaining-migration-handoff.md) and [full inventory / exact compatibility consumers](0001-remaining-migration-inventory.md).

## Production graph

All non-test V2/application files plus transitive local dependencies are audited, including type-only and lazy imports.

| Metric | Before #360 | After #360 |
|---|---:|---:|
| Production sources | 505 | 510 |
| Production import occurrences | 1920 | 1874 |
| Resolved local imports | 1430 | 1384 |
| Type-inclusive SCCs | 1 | 0 |
| Value-only SCCs | 0 | 0 |

Before:

```text
shared/api/apiClient.ts --value--> shared/api/mock/mockApiClient.ts
shared/api/apiClient.ts <--type--- shared/api/mock/mockApiClient.ts
```

After:

```text
shared/api/apiClient.ts --value--> shared/api/mock/mockApiClient.ts
shared/api/apiClient.ts --type---> shared/api/transport.ts
shared/api/mock/mockApiClient.ts --type--> shared/api/transport.ts
```

The common domain-independent ApiClient/GetRequestOptions/MutationRequestOptions declarations move verbatim to transport.ts. Client and mock no longer import one another in both directions. Runtime client selection, abort and error behavior are unchanged. No new SCC, including types.

## Exceptions and forbidden edges

| Owner | Entries before → after | Allowed occurrences before → after |
|---|---:|---:|
| #360 | 22 → 0 | 22 → 0 |
| #362 | 15 → 15 | 15 → 15 |
| Total | 37 → 15 | 37 → 15 |

All retained #362 tuples, reasons and maxCounts are byte-for-byte unchanged. #358/#359/#361 remain zero. Production feature implementation deep imports, shared → modules, modules → app/application, new V1 dependencies, new wildcard public exports and implementations left in flat features are all zero. Tests retain only the existing #362 production-bridge assertions and shared API retry → app query-client assertion.

## Current folder inventory

| Kind | Name | Files | Production sources | Test sources |
|---|---|---:|---:|---:|
| module | booking | 85 | 58 | 27 |
| module | merchant | 20 | 13 | 7 |
| module | onboarding | 25 | 17 | 8 |
| module | place | 209 | 153 | 54 |
| module | travel | 34 | 25 | 8 |
| module | user | 131 | 94 | 36 |
| module | voice-assistant | 32 | 21 | 11 |
| feature | check-ins | 2 | 1 | 1 |
| feature | map | 4 | 3 | 1 |
| feature | merchant-my-page | 1 | 1 | 0 |
| feature | my-page | 6 | 5 | 1 |
| feature | notifications | 2 | 1 | 1 |
| feature | offers-coupons | 2 | 1 | 1 |
| feature | onboarding-entry | 2 | 1 | 1 |
| feature | onboarding-preferences | 1 | 1 | 0 |
| feature | place-visit-verification | 2 | 2 | 0 |
| feature | reservations | 3 | 3 | 0 |
| feature | settings | 3 | 3 | 0 |
| feature | travel-purposes | 1 | 1 | 0 |

All feature rows are #362 compatibility exports, not implementations. Three previously unclassified test-only adapters are now excluded from production and have GREEN/RED fixtures.

`npm run audit:v2-boundaries` emits the full directed graph without rewriting exceptions. Local before/after graph evidence: `/private/tmp/360-before-audit.json`, `/private/tmp/360-after-audit.json`.
