# V2 native map

The production `MapCanvas` renders `NaverMapAdapter` → `NaverMapNativeView`.
Android and iOS use NAVER Map SDK 3.24.0 through the app's native view managers.

## Configuration

Set `NAVER_MAP_CLIENT_ID` in the root `.env` (or the build environment). Register
`com.rmdka.pingdomapp` as both the Android package and iOS bundle identifier in
NAVER Cloud Maps, and enable Dynamic Map.

- Android reads the identifier while configuring Gradle.
- Run `pod install` in `ios/` after changing the identifier. The Podfile generates
  the ignored `ios/Config/NaverMap.generated.xcconfig`, included by Debug and Release.
- Rebuild/reinstall the native app after SDK or identifier changes. A Metro reload
  alone cannot install the native view managers.
- `NAVER_MAP_CLIENT_SECRET` is reserved for server REST calls. It is not read by
  Gradle, CocoaPods, the JavaScript configuration, or the native map SDK.

## Behavior

- Category artwork is reused for default/hot/search markers, as in the existing V2 UI.
- Place marker IDs and press events are preserved. Both platforms offer a 54-point/dp
  nearest-marker touch fallback, with direct marker taps consumed once.
- Camera props are batched so latitude/longitude changes do not animate through an
  intermediate coordinate. Following can be re-enabled to recenter after a gesture.
- When location is unavailable, the map displays Seoul City Hall. This display-only
  coordinate is never substituted for the user's location or nearby API requests;
  the user marker is hidden until a valid coordinate is available.
- Android renders through a SurfaceView. The glass backdrop captures only a visible
  map surface; it supports both the Naver view and existing Kakao compatibility views.
- The Naver logo remains clickable beneath the top controls on the left.

## Migration boundary

Kakao Local search, coordinate-to-address requests, and external directions remain
unchanged in this first stage. Existing V1 callers still use the shared Kakao native
host, so the Kakao SDK and initialization remain until those callers are retired.
No new V1 dependency is introduced.

## Verification

Run `npm run check:v2`, `npm run typecheck`, `npm run test:v2-map`, and native builds.
If changing imports, regenerate the reviewed graph with
`node scripts/production-dependencies.mjs --write` before the V2 check.

On each platform, check initial display, category/selected/search markers, tapping,
repeated locate presses, panning/zooming, background/foreground, unmount/remount,
location denial, and glass/attribution visibility. Full iOS linking and device QA
require a usable Xcode iOS platform installation.

SDK references:
- https://navermaps.github.io/android-map-sdk/guide-ko/1.html
- https://navermaps.github.io/ios-map-sdk/guide-ko/1.html

Implementation verification (2026-09-26): V2 boundary checks (76), map regression
tests (50), TypeScript, Android debug APK build, and direct Swift typechecking of
the two new Swift files passed. Android showed authenticated Naver tiles and the
Seoul fallback with location permission denied. Full iOS build was blocked by
Xcode reporting no eligible iOS destination (iOS 26.2 platform). Location following
and live place-marker selection still require device QA with location/data available.
