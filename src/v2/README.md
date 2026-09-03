# PingDom V2

V2 is isolated from the legacy application and follows a feature-first structure.

Production entrypoint ownership and active composition bridges are documented in
[`docs/v2-production-entrypoint-migration.md`](../../docs/v2-production-entrypoint-migration.md).

## Import boundaries

- `app` composes providers and feature screens.
- `features` may import from `shared` and `types`.
- `shared` may import from `types`, but never from `features` or legacy code.
- V2 code must not import legacy screens, stores, hooks, API clients, or styles.
- `src/application` is the composition boundary that injects the production transport and active
  bridge screens. `App.v2.tsx` is only an alias to that single production root.
- V2 screens use `styled-components`; `StyleSheet.create` and screen-local design values are not allowed.
- V2 application code reads environment values only through `shared/config/env.ts`.

## Feature data flow

Feature data flows from `Screen` to `Hook` to `API`. The reference implementation lives in
`features/place-list`. Place list/search defaults on only for app-linked development
(`EXPO_PUBLIC_APP_ENV=development` and `EXPO_PUBLIC_API_MODE=real`) and can be overridden with
`EXPO_PUBLIC_ENABLE_PLACE_LIST=true|false`.

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
