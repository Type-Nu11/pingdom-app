# Place exploration API boundary

This feature connects the server place-exploration endpoints without changing the native Kakao
bridge. Data flows from a screen to the exported hooks, then through
`placeExplorationApi` and the shared `apiClient`.

## Cache policy

- All place data is rooted at `['v2', 'places']`.
- Lists and autocomplete results are cached independently by normalized query parameters.
- Viewports are cached by the exact generated `west`, `south`, `east`, `north`, and `zoom` object.
- Detail, card, visit decision, operating notices, and verification media share the same place
  entity prefix but keep distinct leaf keys because the server returns different DTOs.
- Recommendation explanations use `requestId`, independently of place identifiers.
- Card and visit-decision resource hooks reuse the same notice and media keys, so concurrent or
  fresh consumers are deduplicated by TanStack Query.
- Map-link conversion success does not invalidate place content because the endpoint records an
  event and returns no representation. It never retries automatically because the current server
  contract defines neither an idempotency key nor duplicate-event semantics.

All query functions forward TanStack Query's `AbortSignal`. The conversion mutation accepts an
optional signal in its variables for callers that own a navigation or link-opening lifecycle.

Mock responses are selected only when `EXPO_PUBLIC_API_MODE=mock`. Real mode never falls back to
fixtures after a server error, so loading, empty, and error UI reflects the real request outcome.
The `EXPO_PUBLIC_ENABLE_PLACE_LIST` runtime flag gates list and registered-place search consumers;
disabled is a distinct presentation state and does not issue either request.
