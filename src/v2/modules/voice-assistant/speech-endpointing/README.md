# Pingdy speech endpointing

Android 13+ native builds use the existing 16 kHz mono PCM16 microphone stream for
both STT and WebRTC GMM VAD (`android-vad:webrtc:2.0.10`, NORMAL mode). No second
recorder is opened. The integration lives in the existing Expo speech native
bridge patch; new application behavior stays in V2. Older native binaries,
Android <=12, and iOS retain the existing recognition/volume fallback.

- A frame is 20 ms (320 samples / 640 bytes). Partial reads are joined in order.
- Three consecutive speech frames (60 ms) publish speech start. Ten consecutive
  non-speech frames (200 ms) publish quiet. Shorter gaps publish no quiet edge.
- The quiet event includes the confirmed 200 ms; the app subtracts this from its
  4 s wait rather than adding another 200 ms. Repeated quiet never resets it.
- Every utterance uses a fixed 4 s quiet window. Repeated quiet events and
  duplicate recognition results do not extend it. Speech resumption resets it.
- iOS additionally uses 4 s without a changed recognition transcript as a fallback
  when native quiet events are missing or background energy stays high. This is
  a transcript inactivity heuristic, not an independent acoustic VAD. A delayed
  final matching the latest partial does not restart this fallback.
- At the cutoff, capture is cancelled and the latest nonempty recognized text
  (partial or final) is submitted once. Late native results cannot submit again.
  No raw audio is sent to the AI transport.
- While PCM VAD is enabled, STT speech edges and RMS events cannot override it.
- Unsolicited STT end/timeouts stop capture, preserve only finalized text for
  editing and report interruption. They never submit automatically or restart.
- Capture is bounded to 60 s. After an explicit stop, final-result waiting is
  bounded to 10 s. Cancel/background remove listeners before aborting capture.
- Audio is not persisted or passed to JavaScript. Native VAD resources are closed
  when the PCM worker exits; late events from stopped recorders are suppressed.

`completion.ts` defines the fixed four-second duration; it does not infer whether
an utterance or reservation is complete. `silenceTimer.ts` owns a monotonic quiet
clock. Recognized text reaches the existing AI transport after the cutoff. Clarification context is captured
at explicit microphone start and is never inferred from AI prose across turns.
The legacy `audioActivity.ts` fallback enters activity at level >=3 and quiet at
<=1, preserving its prior state between those values; it is not independent VAD.

## Verification

Native `PingdyVadFramesTest` checks framing, debounce, resumption and isolated
classifier decisions. Jest tests inject native edges and check timing, STT
interruption, single submission and Android-version fallback. These tests do not
prove the model recognizes quiet voices correctly in actual microphone audio.

Build and install a new Android development APK (a Metro reload alone cannot add
VAD). On Android 13+, verify using the physical microphone:

1. Say “안녕”, then stop: capture ends about 4 s after speech stops.
2. Say “내일…” and pause less than 4 s, then “오후 두 시에”: no cut at the
   intermediate pause; resumption resets quiet timing.
3. Repeat with a quiet voice and ordinary background noise: no mid-speech cut;
   persistent activity reaches the capture limit rather than waiting forever.
4. Check a recognizer that closes early: interruption is shown, stable text is
   editable, no automatic AI request is sent. Confirm cancel and background
   release the microphone. Repeat legacy behavior on Android <=12 separately.

Device/model tuning of the 60/200 ms thresholds remains dependent on these
acoustic checks. A 4 s or longer intermediate pause can end an uncertain utterance
by design. 4 s measures capture release, not the latency of STT finalization or an
AI/server response.
