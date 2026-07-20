# PingDom V2

V2 is isolated from the legacy application and follows a feature-first structure.

## Import boundaries

- `app` composes providers and feature screens.
- `features` may import from `shared` and `types`.
- `shared` may import from `types`, but never from `features` or legacy code.
- V2 code must not import legacy screens, stores, hooks, API clients, or styles.
- V2 screens use `styled-components`; `StyleSheet.create` and screen-local design values are not allowed.
- V2 application code reads environment values only through `shared/config/env.ts`.

## Feature data flow

Feature data flows from `Screen` to `Hook` to `API`. The example flow will be added in the API foundation phase.
