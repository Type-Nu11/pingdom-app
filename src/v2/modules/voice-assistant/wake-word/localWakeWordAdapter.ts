import type { MicrophonePermission } from '../model/voiceInput';
import type { WakeWordAdapter, WakeWordError } from './wakeWord';

/** Implemented by the selected native KWS driver, never by network/general STT.
 * The driver owns model validation, audio focus/call/recording exclusion and native
 * interruption callbacks on BOTH platforms. No raw audio leaves this boundary. */
export interface LocalKeywordDetector {
  start(): Promise<void>;
  stop(): Promise<void>;
  dispose(): Promise<void>;
}
export type LocalWakeWordRuntime = {
  readonly ready: boolean;
  requestPermission(): Promise<MicrophonePermission>;
  isAudioAvailable(): Promise<boolean>;
  createDetector(options: { phrase: 'Hey Pingdy'; signal: AbortSignal; onDetected(): void; onSuspended?(): void; onError(error: WakeWordError): void }): Promise<LocalKeywordDetector>;
};

/** Native driver injection keeps provider keys/models out of JS/env and supports
 * delayed model loading. Missing runtime stays unavailable, without STT fallback. */
export function createLocalWakeWordAdapter(runtime: LocalWakeWordRuntime): WakeWordAdapter {
  return {
    get available() { return runtime.ready; },
    requestPermission: () => runtime.requestPermission(),
    createSession({ signal, onDetected, onSuspended, onError }) {
      let detector: LocalKeywordDetector | undefined;
      let stopped = false;
      let startup: Promise<void> | undefined;
      let teardown: Promise<void> | undefined;
      const isLive = () => !stopped && !signal.aborted;
      const stop = () => {
        stopped = true;
        signal.removeEventListener('abort', cancel);
        return teardown ??= (async () => {
          try { await startup; } catch { /* Still release a partially started driver. */ }
          const owned = detector; detector = undefined;
          if (!owned) return;
          try { await owned.stop(); } finally { await owned.dispose(); }
        })();
      };
      const cancel = () => { void stop().catch(() => { onError('release'); }); };
      return {
        start() {
          if (startup) return startup;
          if (!isLive()) return Promise.resolve();
          signal.addEventListener('abort', cancel, { once: true });
          return startup = (async () => {
            if (!runtime.ready || !await runtime.isAudioAvailable()) throw new Error('WAKE_WORD_UNAVAILABLE');
            if (!isLive()) return;
            detector = await runtime.createDetector({ phrase: 'Hey Pingdy', signal,
              onDetected: () => { if (isLive()) onDetected(); },
              onSuspended: () => { if (isLive()) onSuspended?.(); },
              onError: error => { if (isLive()) onError(error); },
            });
            if (isLive()) await detector.start();
          })();
        },
        stop,
      };
    },
  };
}
