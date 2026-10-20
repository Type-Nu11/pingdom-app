# Android blur rendering

`expo-blur+55.0.16.patch` crops SDK 31+ hardware blur to each view's visible
region, with three radii of sampling padding. Strong blur runs at quarter
resolution with its physical radius preserved. It preserves tint and noise,
and uses the original controller for older Android and software drawing.
The effect and recorded source are reused until geometry or radius changes.

`expo.autolinking.android.buildFromSource` in `package.json` must retain
`expo-blur`; otherwise Expo's prebuilt AAR bypasses the patched sources.
`npm install` applies the patch through the existing `postinstall` script.
When upgrading Expo Blur/BlurView, review the package-private controller and
RenderNode integration, then verify scrolling, moving/clipped glass, themes,
and app background/resume on a device. Android release builds must include
`:expo-blur:compileReleaseJavaWithJavac` rather than only consuming the AAR.
