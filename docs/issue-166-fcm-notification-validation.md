# #166 FCM token and notification settings validation

## Contract source

- Upstream source of truth: `http://54.116.166.107:8080/v3/api-docs`
- Focused snapshot: `docs/api/server-notifications.openapi.json`
- Generated types: `src/v2/shared/api/generated/notifications.ts`
- Refresh from the server with `npm run generate:notification-api`.
- Verify the committed generated file with `npm run check:notification-api-types`.

The upstream OpenAPI marks `PATCH /firebase/fcm-token` as deprecated and recommends
`POST /firebase/fcm-tokens`. It does not publish a sunset date. The compatibility method and
legacy V1 implementation therefore remain in place; new V2 token registration uses the plural
endpoint.

## Automated verification

```sh
npm run check:notification-api-types
npm run check:v2
npm run typecheck
npm run test:v2-api
```

The API and hook regression tests cover the plural POST/DELETE paths, DELETE request bodies,
AbortSignal forwarding, concurrent registration coalescing, settings query/update behavior,
optimistic cache rollback, mocks, and the common 400/401/403/404/409/410/422/426 error mapping.

## Physical-device smoke test

FCM token issuance and push delivery require a Firebase-configured iOS or Android build and cannot
be established by unit tests.

1. Install a development build on a physical device and grant OS notification permission.
2. Sign in and confirm one `POST /firebase/fcm-tokens` succeeds without delaying navigation.
3. Force an FCM token refresh (reinstall or clear app data as appropriate) and confirm the new token
   is registered. Confirm duplicate refresh callbacks do not create concurrent duplicate requests.
4. Change each server notification setting, restart the app, and confirm GET returns the saved server
   values. OS permission must remain a separately observed state and must not be inferred from these
   values.
5. Send a test push and verify foreground, background, and quit-state receipt using the existing
   payload routing.
6. Sign out and confirm `DELETE /firebase/fcm-tokens` runs before credentials are removed. Repeat
   with the API unreachable and confirm sign-out still completes after the best-effort cleanup fails.
