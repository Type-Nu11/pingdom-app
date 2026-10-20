# Issue #211 production i18n audit

## Render graph scope

The audit starts at `index.ts` and follows local `import` and `export ... from` edges through
`App.tsx`, `ProductionApp`, providers, root/auth/main navigators, and every reachable screen,
component, hook, selector, mapper, formatter, dialog, toast, and accessibility prop. The scanner
excludes tests, test utilities, generated contracts, mocks, and files outside that graph.

The authenticated graph covers map discovery/search/categories/favorites/place preview/place
detail, reservations and payments, visit verification, my page/profile/settings/notifications,
coupon/check-in compatibility routes, merchant deep links, error/empty/loading/retry states, and
notification/deep-link routing. The unauthenticated graph covers first launch, onboarding,
language selection, login, signup, and password reset.

`TemporaryAccountSessionApiCheckFlow` was removed from the production navigator. Its files are
development diagnostics and are no longer user-reachable. Other archive/placeholder source that
is not imported by this graph is excluded. The merchant deep-link placeholder remains reachable
and is translated.

## Functional audit

| Feature | Main files audited or changed | Previous hardcoded copy | Canonical keys (examples) | Korean | English | Excluded literal and reason |
| --- | --- | --- | --- | --- | --- | --- |
| First launch/onboarding/auth | `src/features/onboarding/**`, `src/features/auth/**`, `AuthNavigator.tsx` | first screen title/CTA, language options, progress semantics | `loginForeign.*`, `selectLanguage.*`, `auth.*` | 언어 선택 / 시작하기 | Select Language / Get Started | asset IDs and SVG path data are technical |
| Navigation/deep links | `MainNavigator.tsx`, `RoutePlaceholderScreen.tsx`, Android back hooks | back/exit and merchant placeholder copy | `common.navigation.*`, `merchant.*` | 뒤로 가기 | Go back | route keys and deep-link schemes are contracts |
| Map home/search/categories | `MapTopOverlay.tsx`, `MapSearchOverlay.tsx`, `MapScreen.tsx` | search, filters, dates, alerts, loading/empty/error/a11y | `map.search.*`, `map.searchOverlay.*`, `map.categories.*`, `map.recommendations.*` | 장소 검색 / 내 위치 | Search places / My location | server place names and addresses remain verbatim |
| Favorites/place preview | `FavoritePlacesBottomSheet.tsx`, `MapBottomSheet.tsx` | sheet navigation, buttons, counts, fallback and a11y copy | `map.favorites.*`, `map.sheet.*`, `map.detail.*` | 즐겨찾기 / 리뷰 {{count}}개 | Favorites / {{count}} reviews | Korean category aliases are server-value normalization inputs |
| Place detail/operating status | `placeDetailPresentation.ts`, `MapBottomSheet.tsx` | CTA/state/review author/verification labels | `placeDetail.*`, existing `placeDetail.operating.*` | 영업 중 / 예약하기 | Open / Reserve | #279 operating keys are reused without duplicate definitions; notices are server content |
| Reservations/payments | `reservationResources.ts`, reservation screens/components | feature-local runtime resource registration consolidated | `reservation.*` | 예약 상세 / 결제 내역 | Reservation details / Payments | `R` reservation monogram is decorative and explicitly allowlisted |
| Visit verification | `visitVerificationResources.ts`, verification screens | feature-local runtime resource registration consolidated | `visitVerification.*` | 검증하기 / 다시 시도 | Verify / Try again | review input and server place/category content are not translated |
| Merchant/my page | `mappers.ts`, `MerchantMyPageContainer.tsx` | synthesized author/date/relative-time strings | `merchantMyPage.review.*` | 이용인 #{{id}} | Visitor #{{id}} | offer/review content from the server remains unchanged |
| Settings/language | `SettingsScreen.tsx`, `language.ts`, `index.ts` | no in-app language selector; profile changed language directly | `settings.language.*` | 언어 / 한국어 | Language / Korean | stored language value remains stable `ko`/`en` |
| Native permissions | `app.json`, `Info.plist`, localized `InfoPlist.strings` | one-language permission descriptions | native localized keys | 위치/사진 접근 설명 | Location/photo access description | permission identifiers are platform contracts |
| Formatters | `src/v2/shared/i18n/formatters.ts` | string-built distance/date/count/relative time | resource interpolation plus `Intl` | 2시간 전 / 1.2km | 2 hours ago / 0.7 mi | phone numbers and server date-only payloads are preserved |

## Source of truth and persistence

- One canonical i18next instance: `src/v2/shared/i18n/index.ts`.
- One canonical catalog: `src/v2/shared/i18n/resources.ts`, including V2 feature resource modules.
- One persisted preference key: AsyncStorage `language`.
- Resolution order: valid stored preference, supported profile language, device locale, English
  product fallback.
- `setLanguage` changes the in-memory UI first and persists second. Storage failure does not undo
  the UI selection or block startup. Profile synchronization only applies when no explicit local
  preference exists. Player translation packs are not coupled to the app UI instance.

Both catalogs contain 808 leaf keys and have exact parity. Unsupported locale fallback, restore
priority, persistence failure, interpolation, pluralization, missing-key fallback, locale
formatters, English visible text, and translated accessibility labels are covered by tests.

## Automated audit and exclusions

`check:a11y-i18n` now walks the production TypeScript graph through imports and barrel exports and
uses the TypeScript AST to reject visible JSX text, literal `title`/`label`/`placeholder`/helper/
accessibility props, and literal Alert/Toast messages. A separate catalog test checks key parity,
English-resource Korean leakage, and every static production `t('...')` call.

Remaining Korean literals in reachable source are non-display normalization aliases, icon mapping
inputs, internal errors/logs, server contract examples, or canonical Korean resources. Server
place names, addresses, descriptions, notices, reviews, enum wire values, endpoints, query/route
keys, test IDs, asset IDs, generated OpenAPI, fixtures, and debug logging are intentionally not
translated.

## Migration boundary

The production app no longer initializes or merges the legacy i18n instance/resources. V2 code
does not import V1 i18n. Active V1-owned onboarding/auth/check-in/coupon compatibility screens
consume the canonical instance supplied by composition. This issue changes the V1 onboarding
language selector, first screen, progress component, and language type; these are a minimal V1
exception pending removal under #139 and require the `legacy-exception` PR label.
