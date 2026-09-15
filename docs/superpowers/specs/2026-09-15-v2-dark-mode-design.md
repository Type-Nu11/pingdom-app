# V2 system and user dark mode design

## Scope and ownership

Issue #333 is implemented in `src/v2/**` with composition changes in `src/application/**` and
native/application configuration where the operating system owns appearance. No V1 screen, hook,
store, API client, or style is imported by V2. Existing V1 composition bridges remain unchanged.

The production target is every reachable V2 screen in the active production navigation graph.
Legacy bridge screens are outside this issue. The V1 dependency delta is `none`.

## Appearance contract

The stored user preference and the rendered scheme are separate types:

- `SYSTEM`, `LIGHT`, and `DARK` are persistent preferences.
- `light` and `dark` are resolved schemes.

Pure functions normalize unknown stored values and resolve a preference against the React Native
system color scheme. Invalid stored values become `SYSTEM`; a missing or unsupported system value
becomes `light`. A system change affects the resolved scheme only while the preference is `SYSTEM`.

## Persistence and state

Appearance is a device-local application preference, not an account or server setting. It uses the
installed AsyncStorage package through a V2 shared storage service and remains unchanged on logout,
matching the current language, onboarding-completion, and map-setting ownership policies.

A small V2 shared Zustand store owns only the preference and hydration state; it does not store the
theme object or system scheme. Hydration catches storage read failures or a bounded read timeout,
resolves to `SYSTEM`, and always completes. Preference changes update memory
immediately. Writes are serialized and coalesced so an older slow write cannot overwrite the last
rapid selection. A rejected write is logged once per failed attempt without rolling back the
visible selection or terminating the app.

The common appearance provider starts hydration alongside existing i18n and font initialization,
not after them. It withholds themed children only until its first storage attempt completes. Because
i18n and font already gate application rendering, this minimizes an incorrect-theme flash without
adding a sequential boot stage. Read failure or timeout releases the gate with the safe fallback.
No forced light application frame is rendered while the stored preference remains unknown.

## Theme structure

Light and dark themes implement one exact semantic color-token type. Required roles include:

- application background; base, elevated, muted, pressed, and selected surfaces;
- strong, primary, secondary, muted, disabled, inverse, and on-brand text;
- default, emphasized, selected, and focus borders;
- primary, pressed, selected, and soft brand states;
- success, warning, danger, and info foregrounds and soft backgrounds;
- input, disabled, focus, overlay, scrim, and shadow states;
- Glass/Liquid tint, rim, highlight, blur, and opaque fallback roles.

Existing semantic keys remain available during migration, but both schemes must provide every key.
Physical names and screen-specific tokens are not introduced. Brand pink is tuned independently for
each background; status colors, disabled combinations, image scrims, and inverse text are selected
for practical WCAG AA contrast rather than mechanically inverted.

Typography, spacing, and radius remain scheme-independent. `createTheme(fontFamily, scheme)` combines
the scheme palette with the active Pretendard/system font family so #312 behavior is preserved.

## Provider and native synchronization

One shared `AppThemeProvider` is used by production, standalone development, and test helpers. It
publishes the preference, resolved scheme, active styled-components theme, and preference setter.
Production and development retain stable QueryClient instances. Theme changes update provider
values without keys or conditional replacement of the auth/navigation tree, preserving cache,
authentication, and navigation state.

The resolved scheme controls:

- styled-components `ThemeProvider`;
- Expo/React Native status-bar content and background;
- React Navigation's theme colors in both production and standalone V2 roots;
- modal and screen backgrounds;
- native system appearance configuration owned by the app;
- `GlassView.colorScheme`, Expo blur tint, translucent tint/rim/highlight, and opaque fallback.

The Expo configuration changes from forced `light` to `automatic`. The checked-in native projects are
Expo Prebuild outputs with local native modules, so they are inspected but are not regenerated or
directly rewritten unless a minimal source-controlled correction is proven necessary. Android
navigation/status regions are updated only through APIs or native theme resources already available
in the project; no package is added and no large generated native diff is accepted.

## Settings UI

The existing SettingsScreen internal page model gains an `appearance` page. The preferences section
shows a localized row with the current human-readable value. The detail page renders three radio
options: system setting, light mode, and dark mode.

Pressing an option updates the whole screen immediately and requests persistence. Each option exposes
the radio role and selected accessibility state, with localized Korean and English labels. Internal
enum strings are never displayed. This does not add fake support to unfinished #319 rows or redesign
the settings navigation graph.

## V2 screen migration

Production-reachable V2 components are searched for direct hex, named colors, rgba values, local
color objects, fixed status-bar styles, and fixed Glass schemes. Colors representing application UI
roles move to semantic theme consumption. Layout-only styles and intentional external/brand artwork
remain unchanged.

The following are reviewed rather than blindly replaced:

- PingDom and external brand colors;
- image overlays and readable inverse text;
- transparent SVG fills and intentional illustration colors;
- Kakao map tiles and SDK-rendered content.

Large existing map components retain their data flow, gestures, animation, hit targets, and #318
recommendation presentation. Color-only factories or styled-components receive the current theme so
the migration does not restructure those behaviors.

## Kakao map limitation

The installed Android KakaoMaps SDK is 2.13.1 and iOS is 2.12.19. Kakao's public Android contract
documents `mapStyle: default` and says other styles require consultation; no public supported dark-map
style contract was found for these installed versions. The app therefore does not filter, dim, or
recolor map tiles. Only app-owned overlays, markers where their design is app-owned, sheets, search,
and navigation surfaces follow dark mode. This limitation is reported in the handoff.

## Error handling

- Invalid storage data normalizes to `SYSTEM`.
- Storage read failure completes hydration with `SYSTEM`.
- Storage write failure leaves the immediate in-memory choice active and reports a warning.
- Missing system scheme resolves to `light`.
- Font or i18n initialization failure keeps their existing fallback behavior.
- No appearance failure may leave the root permanently blank.

## Test strategy

Tests are written and observed failing before each production behavior is added.

1. Pure model tests cover every preference/system combination, null and invalid values.
2. Storage/store tests cover restore, read/write failure, hydration completion, and rapid selections.
3. Provider tests cover shared policy, scheme-to-theme delivery, live system changes, explicit-mode
   immunity to system changes, initialization fallback, stable QueryClient/child state, status bar,
   and navigation theme synchronization.
4. Settings tests cover all three localized options, selected accessibility state, immediate updates,
   persistence, restoration, rapid selection, and Korean/English output.
5. Component regression tests cover light/dark Glass paths, blur and opaque fallbacks, chips, map
   overlays, bottom navigation, sheets, modals, inputs, image scrims, and status/error states.
6. Final verification runs targeted tests, `npm run check:v2`, `npm run typecheck`,
   `npm run validate:pr`, and `git diff --check`. Available Android/iOS runtime checks are reported
   separately from automated verification; unavailable physical-device QA is not claimed.

## Non-goals

- V1 screen dark-mode migration;
- server or account synchronization;
- arbitrary Kakao tile recoloring;
- new dependencies;
- broad settings-navigation redesign;
- changes to map discovery data, recommendation reasons, or Liquid Glass interaction behavior.
