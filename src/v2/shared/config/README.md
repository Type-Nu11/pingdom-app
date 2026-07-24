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

Fixtures live in `src/v2/shared/api/mock/fixtures.ts`. They contain synthetic names,
UUIDs, contact values, and metrics only. Never copy production responses, access
tokens, customer identifiers, precise visit histories, or merchant operating data
into fixtures. Contract-backed fixtures use `satisfies ApiSchema<...>`; `npm run
check:mock-contract` detects drift after OpenAPI type generation.
