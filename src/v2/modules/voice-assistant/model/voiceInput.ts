export type VoiceInputPhase = 'idle' | 'permissionRequesting' | 'listening' | 'processing' | 'final' | 'canceled' | 'permissionDenied' | 'unavailable' | 'error';
export type MicrophonePermission = 'undetermined' | 'granted' | 'denied' | 'blocked' | 'restricted';
export type SpeechFailure = 'interrupted' | 'noSpeech' | 'unavailable' | 'network' | 'failed';
export type SpeechEvent = { type: 'partial' | 'final'; text: string } | { type: 'processing' } | { type: 'error'; reason: SpeechFailure };
/** A session owns its listeners and native buffers. cancel must synchronously detach
 * listeners, abort pending startup and stop capture; it is idempotent. No disk/log storage.
 * Implementations must normalize OS microphone AND speech authorization, emit a terminal
 * event on interruption/end-without-result, and never start after signal cancellation. */
export interface SpeechSession {
  start(): void | Promise<void>;
  stop(): void | Promise<void>;
  cancel(): void;
}
export interface SpeechInputAdapter {
  readonly available: boolean;
  getPermission(): Promise<MicrophonePermission>;
  requestPermission(): Promise<MicrophonePermission>;
  createSession(options: { locale: 'ko-KR' | 'en-US'; signal: AbortSignal; onEvent: (event: SpeechEvent) => void }): SpeechSession;
}
export type FinalInput = Readonly<{ text: string; source: 'voice' | 'text'; signal: AbortSignal }>;
/** #347 integration boundary. Claim happens before callback; failures are not auto-retried.
 * The consumer must honor signal, avoid retaining/logging text, and supply its own transport. */
export type OnFinalInput = (input: FinalInput) => 'localOnly' | 'accepted' | Promise<'localOnly' | 'accepted'>;
export type VoiceInputSnapshot = {
  phase: VoiceInputPhase;
  permission: MicrophonePermission;
  draft: string;
  partial: string;
  source: 'voice' | 'text';
  error: SpeechFailure | 'empty' | 'tooLong' | 'submitFailed' | null;
  delivery: 'none' | 'pending' | 'localOnly' | 'accepted';
};
export const MAX_VOICE_INPUT_LENGTH = 2000;
export function validateVoiceInput(value: string): { text: string; error: null } | { text: null; error: 'empty' | 'tooLong' } {
  const text = value.trim();
  if (!text) return { text: null, error: 'empty' };
  if (text.length > MAX_VOICE_INPUT_LENGTH) return { text: null, error: 'tooLong' };
  return { text, error: null };
}
/** Text-only fallback for missing native modules and tests. */
export const unavailableSpeechAdapter: SpeechInputAdapter = {
  available: false,
  getPermission: async () => 'undetermined',
  requestPermission: async () => 'undetermined',
  createSession: () => { throw new Error('STT_UNAVAILABLE'); },
};
export const retainInputLocally: OnFinalInput = () => 'localOnly';

export function createVoiceInputController(adapter: SpeechInputAdapter, onFinalInput: OnFinalInput) {
  let snapshot: VoiceInputSnapshot = { phase: 'idle', permission: 'undetermined', draft: '', partial: '', source: 'text', error: null, delivery: 'none' };
  const listeners = new Set<() => void>();
  let epoch = 0;
  let foreground = true;
  let disposed = false;
  let session: SpeechSession | undefined;
  let abort: AbortController | undefined;
  let submittedText: string | undefined;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  const update = (patch: Partial<VoiceInputSnapshot>) => {
    snapshot = { ...snapshot, ...patch };
    listeners.forEach(listener => listener());
  };
  const release = () => {
    epoch += 1;
    if (deadline) clearTimeout(deadline);
    deadline = undefined;
    abort?.abort();
    abort = undefined;
    const owned = session;
    session = undefined;
    try { owned?.cancel(); } catch { /* Native failure stays within this feature. */ }
  };
  const live = (id: number) => !disposed && foreground && epoch === id;
  const busy = () => ['permissionRequesting', 'listening', 'processing'].includes(snapshot.phase) || snapshot.delivery === 'pending';
  const fail = (reason: SpeechFailure) => {
    release();
    update({ phase: reason === 'unavailable' ? 'unavailable' : 'error', error: reason, partial: '', draft: '' });
  };
  const cancel = () => {
    release();
    submittedText = undefined;
    update({ phase: 'canceled', draft: '', partial: '', error: null, delivery: 'none' });
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    async start(locale: 'ko-KR' | 'en-US') {
      if (disposed || !foreground || busy()) return;
      release();
      update({ phase: 'permissionRequesting', partial: '', draft: '', error: null, delivery: 'none', source: 'voice' });
      if (!adapter.available) { update({ phase: 'unavailable' }); return; }
      const id = epoch;
      try {
        let permission = await adapter.getPermission();
        if (!live(id)) return;
        update({ permission });
        if (permission === 'undetermined' || permission === 'denied') permission = await adapter.requestPermission();
        if (!live(id)) return;
        update({ permission });
        if (permission !== 'granted') { update({ phase: 'permissionDenied' }); return; }
        abort = new AbortController();
        const owned = adapter.createSession({ locale, signal: abort.signal, onEvent(event) {
          if (!live(id)) return;
          if (event.type === 'error') { fail(event.reason); return; }
          if (event.type === 'processing') { update({ phase: 'processing', partial: '' }); return; }
          if (event.type === 'partial') {
            if (snapshot.phase === 'listening') update({ partial: event.text.slice(0, MAX_VOICE_INPUT_LENGTH) });
            return;
          }
          const result = validateVoiceInput(event.text);
          release(); // invalidates duplicate/late final callbacks before publishing the draft
          update({ phase: result.error ? 'error' : 'final', draft: result.text ?? '', partial: '', error: result.error, source: 'voice' });
        } });
        if (!live(id)) { owned.cancel(); return; }
        session = owned;
        update({ phase: 'listening' });
        deadline = setTimeout(() => { if (live(id)) fail('noSpeech'); }, 60000);
        await owned.start();
      } catch { if (live(id)) fail('failed'); }
    },
    async stop() {
      if (snapshot.phase !== 'listening' || !session) return;
      const id = epoch;
      update({ phase: 'processing', partial: '' });
      if (deadline) clearTimeout(deadline);
      deadline = setTimeout(() => { if (live(id)) fail('noSpeech'); }, 10000);
      try { await session.stop(); } catch { if (live(id)) fail('failed'); }
    },
    edit(text: string) {
      if (disposed || !foreground || snapshot.delivery === 'pending') return;
      release();
      update({ draft: text, partial: '', source: 'text', phase: 'idle', error: null, delivery: 'none' });
    },
    async submit() {
      if (disposed || !foreground || busy()) return;
      const result = validateVoiceInput(snapshot.draft);
      if (result.error) { update({ error: result.error }); return; }
      if (submittedText === result.text) return;
      submittedText = result.text; // synchronous claim prevents tap races, including callback rejection
      release();
      const id = epoch;
      abort = new AbortController();
      update({ delivery: 'pending', error: null });
      try {
        const delivery = await onFinalInput({ text: result.text!, source: snapshot.source, signal: abort.signal });
        if (live(id)) update({ phase: 'final', delivery });
      } catch {
        if (live(id)) update({ phase: 'error', error: 'submitFailed', delivery: 'none' });
      }
    },
    cancel,
    setForeground(active: boolean) { foreground = active; if (!active && !disposed) cancel(); },
    dispose() { disposed = true; cancel(); listeners.clear(); },
  };
}
