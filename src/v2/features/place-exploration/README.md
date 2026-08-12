# Place exploration API boundary

This feature connects the seven server endpoints in issue #161 without changing the map UI or the
native Kakao bridge. Data flows from a screen to the exported hooks, then through
`placeExplorationApi` and the shared `apiClient`.

## Cache policy

- All place data is rooted at `['v2', 'places']`.
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
