# Account/session API integration

The request and response types come from `docs/api/account.openapi.json`, a focused snapshot of the current server OpenAPI document. Regenerate them with `npm run generate:api-types`; never edit `generated/account.ts` directly.

## OAuth return contract

The server contract exposes the Google authorization start URL and the server-owned `/auth/oauth2/success` callback, but no app callback URL or OAuth code contract. The app therefore opens only the returned `authorizationUrl` (resolved against the API base URL when relative), never calls the callback directly, and never manufactures a code. When the app returns to the foreground after starting OAuth, active `users/me` and OAuth-account queries are invalidated and refetched.

## Logout order

Server logout is attempted first. Whether it succeeds or fails, authenticated queries are then canceled, the existing token session clears memory plus Keychain state, and cached queries are removed. A server error is rethrown after local cleanup so the shared `ApiError` UI policy can still report it.

## PR verification

1. Run `npm run check:api-contract` and `npm run check:api-types`.
2. Run `npm run typecheck` and `npm run test:v2-api`.
3. On iOS and Android, confirm a relative Google URL opens as an absolute API-base URL and returning to the app refetches active account queries.
4. Confirm export opens the native JSON file share sheet; on web, confirm a `.json` download is created.
5. Exercise reset request/confirm, resend, logout failure, Google unlink 401/404/409, and export 401/404 using the common `ApiError` state pattern.
