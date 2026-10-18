import type { MicrophonePermission } from '../model/voiceInput';

export type WakeWordError = 'permission' | 'interrupted' | 'engine' | 'release';
export type WakeWordPhase = 'unavailable' | 'disabled' | 'initializing' | 'listening' | 'detected' | 'cooldown' | 'suspended' | 'error';
export type WakeWordSnapshot = Readonly<{ phase: WakeWordPhase; enabled: boolean; error: WakeWordError | null }>;
export type WakeWordConditions = { foreground: boolean; focused: boolean; accountId: string | null; assistantBusy: boolean };
export interface WakeWordSession {
  start(): Promise<void>;
  /** Resolves only after startup, native listeners, audio and engine have been released. */
  stop(): Promise<void>;
}
/** Dedicated local keyword detector. No transcripts, PCM, transport or AI tools cross this boundary. */
export interface WakeWordAdapter {
  readonly available: boolean;
  requestPermission(): Promise<MicrophonePermission>;
  createSession(options: { signal: AbortSignal; onDetected(): void; onSuspended?(): void; onError(error: WakeWordError): void }): WakeWordSession;
}
export const unavailableWakeWordAdapter: WakeWordAdapter = {
  available: false,
  requestPermission: async () => 'undetermined',
  createSession: () => { throw new Error('WAKE_WORD_UNAVAILABLE'); },
};

export function createWakeWordController(adapter: WakeWordAdapter, onDetected: () => void) {
  let snapshot: WakeWordSnapshot = { phase: adapter.available ? 'disabled' : 'unavailable', enabled: false, error: null };
  let conditions: WakeWordConditions = { foreground: false, focused: false, accountId: null, assistantBusy: false };
  const listeners = new Set<() => void>();
  let disposed = false;
  let epoch = 0;
  let session: WakeWordSession | undefined;
  let abort: AbortController | undefined;
  let work: Promise<void> = Promise.resolve();
  let teardown: Promise<void> = Promise.resolve();
  let releaseFailed = false;
  let claimed = false;
  let manualPending = false;
  let cooldown: ReturnType<typeof setTimeout> | undefined;
  const update = (patch: Partial<WakeWordSnapshot>) => {
    if (disposed) return;
    snapshot = { ...snapshot, ...patch };
    listeners.forEach(listener => listener());
  };
  const eligible = () => conditions.foreground && conditions.focused && !!conditions.accountId && !conditions.assistantBusy;
  const live = (id: number) => !disposed && epoch === id && snapshot.enabled && eligible();
  const release = () => {
    epoch++;
    abort?.abort(); abort = undefined;
    const owned = session; session = undefined;
    if (owned) teardown = teardown.then(() => owned.stop()).catch(() => {
      releaseFailed = true;
      update({ phase: 'error', enabled: false, error: 'release' });
    });
    return teardown;
  };
  const fail = (error: WakeWordError) => {
    void release();
    update({ phase: 'error', enabled: false, error });
  };
  const start = async () => {
    if (disposed || !snapshot.enabled || !eligible() || claimed || manualPending || cooldown || session || snapshot.phase === 'initializing') return;
    const id = epoch;
    update({ phase: 'initializing', error: null });
    await teardown;
    if (!live(id) || releaseFailed) return;
    try {
      const permission = await adapter.requestPermission();
      if (!live(id)) return;
      if (permission !== 'granted') { fail('permission'); return; }
      abort = new AbortController();
      const owned = adapter.createSession({ signal: abort.signal,
        onDetected() {
          if (!live(id) || claimed || manualPending) return;
          claimed = true;
          update({ phase: 'detected' });
          const stopped = release();
          const activation = epoch;
          work = stopped.then(() => {
            if (!live(activation) || releaseFailed || manualPending) return;
            try { onDetected(); } catch { fail('engine'); }
          });
        },
        onError(error) { if (live(id)) fail(error); },
        onSuspended() {
          if (!live(id)) return;
          // Native lifecycle notifications can arrive before JS AppState changes.
          conditions = { ...conditions, foreground: false };
          void release();
          update({ phase: 'suspended' });
        },
      });
      session = owned;
      await owned.start();
      if (live(id) && !claimed) update({ phase: 'listening' });
    } catch { if (live(id)) fail('engine'); }
  };
  const reconcile = () => {
    if (disposed || !snapshot.enabled) return;
    if (!eligible()) {
      void release();
      update({ phase: 'suspended' });
    } else work = start();
  };
  const disable = async () => {
    if (cooldown) clearTimeout(cooldown);
    cooldown = undefined; claimed = false; manualPending = false;
    const stopped = release();
    update({ enabled: false, phase: adapter.available ? 'disabled' : 'unavailable', error: null });
    await stopped;
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    async enable() {
      if (disposed || releaseFailed) return;
      if (snapshot.enabled) { await work; return; }
      if (!adapter.available) { update({ phase: 'unavailable' }); return; }
      update({ enabled: true, error: null, phase: 'disabled' });
      reconcile(); await work;
    },
    disable,
    setConditions(next: WakeWordConditions) {
      const previous = conditions;
      conditions = next;
      if (previous.accountId !== null && previous.accountId !== next.accountId) { void disable(); return; }
      if ((!next.foreground || !next.focused) && !next.assistantBusy) { claimed = false; manualPending = false; }
      if (previous.assistantBusy && !next.assistantBusy && (claimed || manualPending)) {
        claimed = false; manualPending = false;
        if (snapshot.enabled) {
          update({ phase: 'cooldown' });
          if (cooldown) clearTimeout(cooldown);
          cooldown = setTimeout(() => { cooldown = undefined; reconcile(); }, 2000);
        }
      }
      reconcile();
    },
    async prepareAssistant() {
      manualPending = true;
      await release();
      if (snapshot.enabled) update({ phase: 'suspended' });
      return !disposed && !releaseFailed;
    },
    /** Also used by composition/tests to wait for asynchronous native handoff. */
    async settle() { await work; await teardown; },
    async dispose() {
      await disable(); disposed = true; listeners.clear();
    },
  };
}
