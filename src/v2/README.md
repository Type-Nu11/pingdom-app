# PingDom V2

V2 is isolated from the legacy application and follows a feature-first structure.

## Import boundaries

- `app` composes providers and feature screens.
- `features` may import from `shared` and `types`.
- `shared` may import from `types`, but never from `features` or legacy code.
- V2 code must not import legacy screens, stores, hooks, API clients, or styles.
- `App.v2.tsx` is the composition boundary that injects the existing authenticated transport into
  V2. This keeps both versions on one access-token cache, refresh lock, and logout path without
  allowing feature code to cross the V2 boundary.
- V2 screens use `styled-components`; `StyleSheet.create` and screen-local design values are not allowed.
- V2 application code reads environment values only through `shared/config/env.ts`.

## Feature data flow

Feature data flows from `Screen` to `Hook` to `API`. The reference implementation lives in
`features/place-list` and is opt-in through
`EXPO_PUBLIC_ENABLE_PLACE_LIST=true`.

## OpenAPI types

`docs/api/mvp.openapi.json` is the single source for MVP request, response, enum, and error types.

```sh
npm run generate:api-types
npm run check:api-types
```

The generated file is `shared/api/generated/mvp.ts`. Do not edit it directly. Feature model aliases
must point to `ApiSchema`, `OperationQuery`, `OperationRequestBody`, or `OperationResponse` from
`shared/api/contract.ts`; change the OpenAPI document and regenerate when the wire model changes.
