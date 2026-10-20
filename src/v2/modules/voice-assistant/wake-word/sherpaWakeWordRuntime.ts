import type { MicrophonePermission } from '../model/voiceInput';
import type { LocalWakeWordRuntime } from './localWakeWordAdapter';

export const SHERPA_WAKE_WORD = {
  phrase: 'Hey Pingdy', keyword: 'Hey_Pingdy', engineVersion: '1.13.8',
  modelId: 'sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20',
} as const;
export interface SherpaWakeWordNative {
  getStatus(): Promise<{ ready: boolean; phrase?: string; modelId?: string; engineVersion?: string }>;
  isAudioAvailable(): Promise<boolean>;
  initialize(sessionId: string, phrase: string): Promise<void>;
  start(sessionId: string): Promise<void>;
  stop(sessionId: string): Promise<void>;
  dispose(sessionId: string): Promise<void>;
}
export type WakeWordEventSource = {
  addListener(name: 'PingdomWakeWordEvent', listener: (event: unknown) => void): { remove(): void };
};
export const isSherpaWakeWordReady = (status: Awaited<ReturnType<SherpaWakeWordNative['getStatus']>>) =>
  status.ready === true && status.phrase === SHERPA_WAKE_WORD.phrase
  && status.modelId === SHERPA_WAKE_WORD.modelId && status.engineVersion === SHERPA_WAKE_WORD.engineVersion;

let sequence = 0;
export function createSherpaWakeWordRuntime(native: SherpaWakeWordNative, events: WakeWordEventSource,
  requestPermission: () => Promise<MicrophonePermission>, ready: boolean): LocalWakeWordRuntime {
  const runtimeId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return {
    ready, requestPermission,
    isAudioAvailable: () => native.isAudioAvailable(),
    async createDetector({ signal, phrase, onDetected, onSuspended, onError }) {
      if (!ready || signal.aborted || phrase !== SHERPA_WAKE_WORD.phrase) throw new Error('WAKE_WORD_UNAVAILABLE');
      const id = `pingdom-kws-${runtimeId}-${++sequence}`;
      let disposed = false;
      const subscription = events.addListener('PingdomWakeWordEvent', value => {
        if (disposed || signal.aborted || !value || typeof value !== 'object') return;
        const event = value as Record<string, unknown>;
        if (event.sessionId !== id) return;
        if (event.type === 'detected' && event.keyword === SHERPA_WAKE_WORD.keyword) onDetected();
        if (event.type === 'suspended') onSuspended?.();
        if (event.type === 'error') onError(event.reason === 'interrupted' || event.reason === 'release' ? event.reason : 'engine');
      });
      const dispose = async () => {
        if (disposed) return;
        disposed = true; subscription.remove();
        await native.dispose(id);
      };
      try {
        await native.initialize(id, phrase);
        if (signal.aborted) {
          try { await native.stop(id); } finally { await dispose(); }
          throw new Error('WAKE_WORD_CANCELED');
        }
      } catch (error) {
        await dispose();
        throw error;
      }
      return {
        async start() { if (!disposed && !signal.aborted) await native.start(id); },
        async stop() { if (!disposed) await native.stop(id); },
        dispose,
      };
    },
  };
}
