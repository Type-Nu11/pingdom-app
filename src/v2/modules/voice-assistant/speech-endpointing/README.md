# Voice endpointing

`completion.ts` estimates completion from interim STT text and app-owned clarification
context. Clear Korean requests/questions and quantity answers to a quantity clarification
use 1 second; uncertain, incomplete and unrelated short answers use 3 seconds.
This is a conservative clue policy, not a grammar parser or a reservation confirmation.

`silenceTimer.ts` owns the monotonic quiet clock. Transcript updates choose the timeout
without restarting quiet. Speech resumption cancels the clock even if STT text does not
change. No audio activity evidence means no automatic endpoint; the existing capture
deadline and manual stop remain available. Reset removes text, context and pending timers.

`audioActivity.ts` combines native speech edges with normalized microphone energy through
the adapter. A level >=3 enters activity, <=1 enters quiet, and the band between preserves
the previous state. These are initial energy thresholds, not semantic speech detection.
Low-volume speech, sustained noise and platform differences require real-device testing
and calibration. No audio is stored or sent for this policy.

Only final STT results enter the existing AI transport. Background/cancel/session teardown
clears endpointing through the existing controller lifecycle. Quantity context is captured
at explicit microphone start and never inferred from AI prose or retained across turns.
