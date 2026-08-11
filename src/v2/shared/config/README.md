# V2 environment configuration

- Only `env.ts` may read `process.env` in V2 application code.
- Application modules consume the typed `env` object.
- `EXPO_PUBLIC_*` values are embedded in the client bundle and must never contain server secrets.
- Deployment tooling supplies values for development, staging, and production.
- Copy `.env.example` to a local ignored env file for development.
- Missing or invalid required values fail with an `EnvironmentConfigurationError` when configuration is loaded.

## Real API / Mock switching

Set one value and restart Expo:

```dotenv
EXPO_PUBLIC_API_MODE=mock
```

Use `real` to send requests to `EXPO_PUBLIC_API_BASE_URL`. Mock mode never sends API
requests. Its default scenario is `success`; set `EXPO_PUBLIC_MOCK_SCENARIO` to
`empty`, `forbidden`, `expired`, or `network-error` to reproduce screen states.
`EXPO_PUBLIC_MOCK_LATENCY_MS` controls artificial latency. Mock mode is rejected in
staging and production builds.

During development a scenario picker can call `setMockScenario(...)` from
`src/v2/shared/api`. Invalidate the affected TanStack Query keys after changing it
so mounted screens refetch.

New mocks use a feature-local pair under
`src/v2/shared/api/mock/features/<feature>/`:

```text
features/<feature>/
  fixtures.ts   # OpenAPI-generated type checked synthetic responses
  handlers.ts   # method/path matching and response selection
```

Export the feature handler array from `mock/features/index.ts`. Use the shared
`MockHandler` type so GET, PATCH, POST, and PUT routes use the same registration
path. `travel-purposes` is the reference GET/PUT implementation. The existing
`mock/fixtures.ts` contains the initial cross-feature MVP fixtures and can be moved
into feature folders as those features are changed.

Fixtures must contain synthetic names, UUIDs, contact values, and metrics only.
Never copy production responses, access tokens, customer identifiers, email or
phone values, precise visit histories, or merchant operating data into fixtures.
Prefer conspicuous values such as `Fixture`, `Mock`, reserved UUIDs, and
`example.com`; do not anonymize production payloads and reuse them.

Contract-backed fixtures use `satisfies ApiSchema<...>` (or the corresponding
`OperationResponse<...>` type). Run `npm run check:mock-contract`; type checking
then detects drift after OpenAPI type generation.
