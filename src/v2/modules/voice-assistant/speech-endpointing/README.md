# Pingdy speech endpointing

Android 13+ native builds use the existing 16 kHz mono PCM16 microphone stream for
both STT and WebRTC GMM VAD (`android-vad:webrtc:2.0.10`, VERY_AGGRESSIVE mode). No second
recorder is opened. The integration lives in the existing Expo speech native
bridge patch; new application behavior stays in V2. Older native binaries,
Android <=12, and iOS retain the existing recognition/volume fallback.

- A frame is 20 ms (320 samples / 640 bytes). Partial reads are joined in order.
- Three consecutive speech frames (60 ms) publish speech start. Ten consecutive
  non-speech frames (200 ms) publish quiet. Shorter gaps publish no quiet edge.
- The quiet event includes the confirmed 200 ms; the app subtracts this from its
  1 s / 3 s wait rather than adding another 200 ms. Repeated quiet never resets it.
- Greetings, complete requests/questions and contextual quantity answers wait 1 s;
  uncertain or incomplete text waits 3 s. Transcript updates choose a duration;
  STT final results alone never start quiet. Speech resumption resets the timer.
- While PCM VAD is enabled, STT speech edges and RMS events cannot override it.
- Unsolicited STT end/timeouts stop capture, preserve only finalized text for
  editing and report interruption. They never submit automatically or restart.
- Capture is bounded to 60 s. After an explicit stop, final-result waiting is
  bounded to 10 s. Cancel/background remove listeners before aborting capture.
- At the capture limit, finalized text remains editable with an interruption
  message; uncertain partial text is discarded and no AI request is sent automatically.
- Audio is not persisted or passed to JavaScript. Native VAD resources are closed
  when the PCM worker exits; late events from stopped recorders are suppressed.

`completion.ts` uses conservative text clues, not a grammar classifier or a
reservation confirmation. `silenceTimer.ts` owns a monotonic quiet clock. Only
final STT text reaches the existing AI transport. Clarification context is captured
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

1. Say “안녕”, then stop: capture ends about 1 s after speech stops.
2. Say “내일…” and pause less than 3 s, then “오후 두 시에”: no cut at the
   intermediate pause; resumption resets quiet timing.
3. Repeat with a quiet voice and ordinary background noise: no mid-speech cut;
   persistent activity reaches the capture limit rather than waiting forever.
4. Check a recognizer that closes early: interruption is shown, stable text is
   editable, no automatic AI request is sent. Confirm cancel and background
   release the microphone. Repeat legacy behavior on Android <=12 separately.

Device/model tuning of the 60/200 ms thresholds remains dependent on these
acoustic checks. A 3 s or longer intermediate pause can end an uncertain utterance
by design. 1 s measures capture release, not the latency of STT finalization or an
AI/server response.

In #350 Android SM-N981N testing, NORMAL and AGGRESSIVE repeatedly published
speech after the user's completed second utterance during reported quiet, resetting
the three-second endpoint. VERY_AGGRESSIVE passed a subsequent greeting/second
utterance trial and the user reported normal recognition/end for a quiet-voice trial.
This is one device/user observation; controlled background noise, voice level/distance
and additional devices remain required before treating the tuning as fully validated.
