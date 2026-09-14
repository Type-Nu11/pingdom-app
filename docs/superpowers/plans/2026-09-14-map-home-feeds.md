# Map Home Feeds Implementation Plan

> **For agentic workers:** Execute inline with `superpowers:executing-plans`. Create focused commits; do not push.

**Goal:** Restore independent live data for the V2 map home's local-hot and nationwide-trends feeds.

**Architecture:** A new V2 `map-home-feeds` feature owns the scoped live OpenAPI contract, API functions, query keys, validation, hooks, presentation models, and feed-specific error mapping. `MapScreen` keeps nearby place exploration data for markers/search while composing the two ranking-shaped home feeds for `MapBottomSheet`; selecting a feed card resolves real detail by `placeId` rather than inventing coordinates.

**Tech Stack:** React Native, TypeScript, TanStack Query, Axios-backed V2 API client, Jest/tsx node tests, React Native Testing Library, openapi-typescript.

**Spec:** GitHub issue #306 and the approved in-chat design on 2026-09-14.

## Global Constraints

- All implementation belongs in V2; V1 dependency delta must remain `none`.
- Never restore removed `/map/**` API paths or production mock fallback.
- Preserve generated optional/nullable contract exactly, including the server's generic `Item` schema limitation.
- Every query forwards TanStack Query's `AbortSignal` to the common API client.
- Do not synthesize coordinates, coerce ranking items to `DecisionPlace`, or add detail N+1 calls.
- Create focused commits after each independently verified task; do not push.

---

### Task 1: Scoped live OpenAPI contract

**Files:**
- Create: `scripts/sync-map-home-feeds-openapi.mjs`
- Create: `scripts/check-generated-map-home-feeds-api-types.mjs`
- Create: `docs/api/map-home-feeds.openapi.json`
- Create: `src/v2/shared/api/generated/mapHomeFeeds.ts`
- Create: `src/v2/shared/api/mapHomeFeedsContract.ts`
- Modify: `package.json`
- Modify: `src/v2/shared/api/index.ts`
- Test: `src/v2/shared/api/__tests__/mapHomeFeeds.contract.types.ts`
- Test: `src/v2/shared/api/__tests__/mapHomeFeeds.test.mjs`

- [ ] Write contract tests for both operations, parameters, content types, statuses, recursive schemas, and generated aliases; verify they fail because the scoped contract is absent.
- [ ] Add a focused extraction script for `GET /places/local-hot` and `GET /places/trends`, preserving recursively referenced schemas and source hash.
- [ ] Sync the live document, generate types, and add freshness checking to `check:api-types`.
- [ ] Run the focused API tests and generated-type check until green.

### Task 2: Independent API/query boundaries

**Files:**
- Create: `src/v2/features/map-home-feeds/api/mapHomeFeedsApi.ts`
- Create: `src/v2/features/map-home-feeds/model/mapHomeFeeds.types.ts`
- Create: `src/v2/features/map-home-feeds/model/mapHomeFeeds.ts`
- Create: `src/v2/features/map-home-feeds/hooks/useMapHomeFeeds.ts`
- Create: `src/v2/features/map-home-feeds/index.ts`
- Test: `src/v2/features/map-home-feeds/api/__tests__/mapHomeFeedsApi.test.ts`
- Test: `src/v2/features/map-home-feeds/hooks/__tests__/useMapHomeFeeds.test.tsx`

- [ ] Write failing tests for local/trend paths, `WEEK`, mutually exclusive coordinates/regionCode, coordinate validation, distinct keys, location-independent trends, pagination, AbortSignal, and stale-location isolation.
- [ ] Implement contract-derived aliases, request selectors, API functions, query keys, and query option factories.
- [ ] Implement feed hooks and DTO-to-card presentation preserving server rank/order and raw period strings.
- [ ] Run the feature tests until green.

### Task 3: Independent bottom-sheet presentation

**Files:**
- Modify: `src/v2/features/map/components/MapBottomSheet.tsx`
- Modify: `src/v2/features/map/model/mapHomeCategory.ts`
- Test: `src/v2/features/map/components/__tests__/MapBottomSheet.test.tsx`
- Test: `src/v2/features/map/model/__tests__/mapHomeCategory.test.ts`

- [ ] Add failing tests proving the nationwide tab renders nationwide data rather than reversed local data, feed-specific states/retry/category selection, empty-category behavior, accessibility state, and correct `placeId` selection.
- [ ] Replace single `places`/`placesState` home props with `localFeed`/`nationalFeed`; retain nearby places only for search/preview consumers.
- [ ] Render ranking cards from supplied image/bookmark/address fields without distance or coordinates.
- [ ] Run bottom-sheet tests until green.

### Task 4: Production MapScreen composition and detail resolution

**Files:**
- Modify: `src/v2/features/map/screens/MapScreen.tsx`
- Modify: `src/app/navigation/MainNavigator.tsx`
- Test: `src/v2/features/map/__tests__/mapCompositionMigration.test.mjs`

- [ ] Add failing composition tests for independent APIs, location gating, marker/ranking separation, and place-detail selection by numeric ID.
- [ ] Compose both hooks from stable location state and pass independent feeds to `MapBottomSheet`.
- [ ] Resolve a selected ranking card through the existing place detail/card query and keep map markers sourced only from place exploration.
- [ ] Run V2 map composition tests until green.

### Task 5: Bookmark cache synchronization and i18n

**Files:**
- Modify: `src/v2/features/map/hooks/usePlaceBookmark.ts`
- Modify: `src/v2/shared/i18n/resources.ts`
- Test: `src/v2/features/map/hooks/__tests__/usePlaceBookmark.test.ts`
- Test: `src/v2/features/map/components/__tests__/MapBottomSheet.test.tsx`

- [ ] Add failing tests for optimistic local/trend cache updates, rollback, count-only mutation, untouched net growth, and Korean/English error/location strings.
- [ ] Update only matching ranking items across independent feed caches while retaining existing bookmark-list policy.
- [ ] Add status-specific localized copy and accessible retry labels.
- [ ] Run the focused tests until green.

### Task 6: Full verification and Android QA

**Files:** No production changes unless verification reveals a tested defect.

- [ ] Run `npm run check:api-types`, `npm run test:v2-api`, `npm run test:v2-map`, `npm run check:v2`, `npm run typecheck`, `npm run validate:pr`, and `git diff --check`.
- [ ] Search the changed/runtime paths for forbidden `/map/place-rankings`, `/map/posts`, `/map/bookmarks`, `/map/likes`, and `/map/like` calls.
- [ ] Inspect the connected Android device, launch the production composition, and exercise local/national tabs, permission states, categories, sheet states, detail selection, bookmark behavior, locale, and rapid switching where the authenticated session permits.
- [ ] Report exact automated/device evidence, unverified cases, server-contract blockers, V1 dependency delta, and legacy-label decision.
