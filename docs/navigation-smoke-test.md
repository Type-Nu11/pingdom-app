# Navigation smoke test

Run these checks on a rebuilt Android development build. Native deep-link configuration changes do
not apply to an already installed build.

## Prerequisites

```bash
npm install
npm run typecheck
npm run test:navigation
npm run android
adb devices -l
```

The device must be listed as `device`, not `offline` or `unauthorized`.

## Authentication stack reset

1. Start while logged out and complete login.
2. Press Android back on the Map screen. The onboarding flow must not reappear.
3. Open Profile, then Settings, and log out.
4. Press Android back. Map, Profile, and Settings must not reappear.
5. Log in again. Main must start on Map with no previous detail or settings history.

## Bookmark and back regression

1. Open Profile and select the Saved tab.
2. Tap a bookmarked place.
3. Confirm Map opens the selected place preview.
4. Press Android back. Profile must not reopen; Map is the root screen.
5. Open a place detail from Map and press Android back. The previous Map state must remain.

## Local back handling

1. In Profile, open Archive and an archive detail. Android back must go detail → archive → profile → Map.
2. Open the likes sheet. Android back must close the sheet before leaving Profile.
3. In Settings, open a subpage. Android back must return to Settings root before returning to Profile.

## Deep links

Run each command while logged in. Repeat one protected link while logged out and confirm it opens
after login.

```bash
adb shell am start -W -a android.intent.action.VIEW -d "pingdom://map" com.rmdka.pingdomapp
adb shell am start -W -a android.intent.action.VIEW -d "pingdom://places/138001" com.rmdka.pingdomapp
adb shell am start -W -a android.intent.action.VIEW -d "pingdom://places/138001/check-in" com.rmdka.pingdomapp
adb shell am start -W -a android.intent.action.VIEW -d "pingdom://coupons" com.rmdka.pingdomapp
adb shell am start -W -a android.intent.action.VIEW -d "pingdom://profile" com.rmdka.pingdomapp
adb shell am start -W -a android.intent.action.VIEW -d "pingdom://settings" com.rmdka.pingdomapp
adb shell am start -W -a android.intent.action.VIEW -d "pingdom://merchants/456" com.rmdka.pingdomapp
```

Invalid IDs must safely open Map:

```bash
adb shell am start -W -a android.intent.action.VIEW -d "pingdom://places/not-a-number" com.rmdka.pingdomapp
adb shell am start -W -a android.intent.action.VIEW -d "pingdom://places/0" com.rmdka.pingdomapp
```

## Notification entry

Test a payload containing `screen=place-detail`, a positive integer `placeId`, and a stable
`messageId` in each app state:

- Foreground: tap the locally presented notification and confirm PlaceDetail opens.
- Background: tap the system notification and confirm PlaceDetail opens once.
- Terminated: force-stop, tap the notification, and confirm PlaceDetail opens after auth hydration.
- Logged out: tap a notification, log in, and confirm the pending PlaceDetail opens once.
- Invalid `placeId`: confirm Map opens and the app does not crash.

Finally, tap the same notification event twice if the provider permits it. A repeated `messageId`
must not add another PlaceDetail route.
