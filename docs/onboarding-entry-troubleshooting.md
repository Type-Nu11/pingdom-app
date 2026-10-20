# Onboarding entry troubleshooting

## Symptom and cause

The unauthenticated navigator previously registered only `Onboarding` and always used it as
the initial route. Completion was not stored separately from the in-memory flow, so relaunching
the app or logging out restarted onboarding.

## Completion storage contract

- Key: `@pingdom/onboarding-completed:v1`
- Payload version: `1`
- Payload: `{ version: 1, completed: true, signupContext: { language, country, birthYear,
  entryVariant } }`
- `entryVariant` is `kr` for `country: "KR"`; otherwise it is `foreign`.
- Gender is not stored because the active signup request does not send it. Travel purposes and
  dates remain exclusively owned by `@pingdom/v2/onboarding-preferences:v1`.

Completion is written only after language, country, birth year, gender, travel purpose, and
travel schedule steps have finished and the existing preference storage write has succeeded.
Opening the app or pressing the first Start button does not write completion. If either the
preference write or completion write fails, the user stays in onboarding and can retry.

## Initial route decision

| State | Route |
| --- | --- |
| Auth or completion hydration pending | Splash/loading boundary |
| Valid login session | Main |
| Logged out and completion absent/invalid/unreadable | Onboarding |
| Logged out and valid v1 completion present | Auth landing |

The root navigator does not render until both hydration operations settle, preventing an
Onboarding flash. Changing completion or login state changes the root screen navigation key,
discarding the previous auth stack. Logout does not remove either onboarding storage key, so it
returns to Auth landing. Pending notification/deep-link intents remain in the root coordinator
and are delivered only after authentication as before.

## Storage failure fallback

- Missing, malformed, or unsupported completion payloads are treated as incomplete.
- A read error settles hydration as incomplete instead of loading forever or assuming completion.
- A completion write error leaves state incomplete and keeps the preference completion screen
  visible with a retryable save error.
- Logs contain only generic storage/navigation errors; signup context values are not logged.

## Safely retesting first launch

Prefer removing only `@pingdom/onboarding-completed:v1` through a debug build or AsyncStorage
inspector, then fully relaunch the app while logged out. Clear
`@pingdom/v2/onboarding-preferences:v1` as well only when the travel-purpose/schedule steps also
need a clean-state test.

As a last resort, Android QA can run `adb shell pm clear com.rmdka.pingdomapp` (or use the OS app
data reset UI), and iOS QA can uninstall/reinstall the app. **A full app-data reset deletes auth
tokens, preferences, notification settings, cached state, and every other user value owned by
the app—not only onboarding completion.**
