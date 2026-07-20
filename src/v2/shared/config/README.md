# V2 environment configuration

- Only `env.ts` may read `process.env` in V2 application code.
- Application modules consume the typed `env` object.
- `EXPO_PUBLIC_*` values are embedded in the client bundle and must never contain server secrets.
- Deployment tooling supplies values for development, staging, and production.
- Copy `.env.example` to a local ignored env file for development.
- Missing or invalid required values fail with an `EnvironmentConfigurationError` when configuration is loaded.
