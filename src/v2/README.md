# PingDom V2

V2 is isolated from legacy implementation. The current flat features migrate incrementally
to the domain structure in [ADR 0001](../../docs/architecture/adr/0001-v2-domain-module-boundaries.md).

Production entrypoint ownership and active composition bridges are documented in
[`docs/v2-production-entrypoint-migration.md`](../../docs/v2-production-entrypoint-migration.md).

## Import boundaries

The target is `app → modules → shared`, with Place, Booking, User, Onboarding, Travel,
Merchant and Voice Assistant modules. Existing `features` directories remain until their
individual migration issues. See the ADR's [inventory and graph audit](../../docs/architecture/adr/0001-v2-boundary-audit.md)
for all 28 feature owners, counts and removal issues #361/#358/#359/#360/#362.

- External callers use a feature/module or subfeature public `index.ts`; internal
  screen/hook/API/model/service/store/style/component indexes are not public entrypoints.
- Public APIs use named exports, not `export *`. Type-only imports obey the same rules.
- Shared cannot import domains or app; domains cannot import app. Module-internal relative
  imports are allowed subject to data flow, cycle and legacy restrictions.
- V2 must not import legacy source or escape V2, except static `src/assets/v2` assets.
- Screens access APIs through hooks; feature/module hooks access shared API through domain API/model.
- Production import cycles (including types/dynamic imports) and production imports of tests are forbidden.
- `src/application` owns production composition/runtime injection only. Existing bridges are
  frozen individually; semantic domain ownership also requires review.
- V2 uses styled-components, reads environment values via `shared/config/env.ts`, and
  imports axios only in `shared/api`. Comments and strings are not syntax violations.

`npm run check:v2` checks the graph and runs its fixture tests; `validate:pr` includes both.
`npm run test:v2-boundaries` runs the fixtures separately. `npm run audit:v2-boundaries`
prints current inventory, graph and SCCs without modifying the baseline.
[Exact migration exceptions](../../scripts/v2-boundaries/exceptions.json) include source,
target, specifier, type/test flags, maximum count, reason and removal issue. New violations,
extra occurrences and stale exceptions fail. Tests are checked too; existing integration
imports have explicit exceptions, not a blanket test bypass.

`app/i18n` composes feature-owned resources and registers them with the shared instance.
Production and development providers use that initializer; the app test provider consumes
that same resource object. Shared owns language hydration, base copy and formatters.
The shared test-provider path is a test-only compatibility entrypoint until #360.

## Feature data flow

Feature data flows from `Screen` to `Hook` to `API`. The reference implementation lives in
`features/place-list`. Place list/search defaults on whenever `EXPO_PUBLIC_API_MODE=real` and can
be overridden with `EXPO_PUBLIC_ENABLE_PLACE_LIST=true|false`.

## OpenAPI types

`docs/api/mvp.openapi.json` is the single source for MVP request, response, enum, and error types.

```sh
npm run generate:api-types
npm run check:api-types
```

The generated file is `shared/api/generated/mvp.ts`. Do not edit it directly. Feature model aliases
must point to `ApiSchema`, `OperationQuery`, `OperationRequestBody`, or `OperationResponse` from
`shared/api/contract.ts`; change the OpenAPI document and regenerate when the wire model changes.

The place exploration endpoints introduced for #161 are sourced from the currently deployed
server's `/v3/api-docs`, not from the older MVP document. The scoped server snapshot keeps the seven
relevant paths and all recursively referenced schemas without hand-written DTOs:

```sh
npm run sync:place-exploration-openapi -- https://server.example/v3/api-docs
npm run generate:place-exploration-api-types
npm run check:place-exploration-api-types
```

The snapshot is `docs/api/place-exploration.openapi.json`, and its generated types are
`shared/api/generated/placeExploration.ts`. Feature aliases must use
`placeExplorationContract.ts`; update the snapshot from the server before regenerating.

Tourist place menus are an independent domain and use a dedicated scoped snapshot. This also
avoids the deployed document's duplicate `list_5` operation ID for menus and availabilities:

```sh
npm run sync:place-menus-openapi -- https://www.typenull.xyz/v3/api-docs
npm run generate:place-menus-api-types
npm run check:place-menus-api-types
```

The snapshot is `docs/api/place-menus.openapi.json`; feature aliases use
`placeMenusContract.ts`. The generated DTO remains optional where the upstream schema omits its
`required` array.

The stay-based visit verification endpoints use their own live-server scoped snapshot because
their lifecycle and release cadence are independent from place exploration:

```sh
npm run sync:visit-verification-openapi -- https://www.typenull.xyz/v3/api-docs
npm run generate:visit-verification-api-types
npm run check:visit-verification-api-types
```

The snapshot is `docs/api/visit-verification.openapi.json`; feature aliases use
`visitVerificationContract.ts`. A session-detail query must not be implemented until the GET 200
response schema exists in that snapshot.
