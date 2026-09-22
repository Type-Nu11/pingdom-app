export type VoiceInputPhase = 'idle' | 'permissionRequesting' | 'listening' | 'processing' | 'final' | 'canceled' | 'permissionDenied' | 'unavailable' | 'error';
export type MicrophonePermission = 'undetermined' | 'granted' | 'denied' | 'blocked' | 'restricted';
export type SpeechFailure = 'interrupted' | 'noSpeech' | 'unavailable' | 'network' | 'failed';
export type SpeechEvent = { type: 'partial' | 'final'; text: string } | { type: 'activity'; speaking: boolean } | { type: 'processing' } | { type: 'ended' } | { type: 'error'; reason: SpeechFailure };
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
  speaking: boolean;
  source: 'voice' | 'text';
  error: SpeechFailure | 'empty' | 'tooLong' | 'submitFailed' | null;
  delivery: 'none' | 'pending' | 'localOnly' | 'accepted';
};
export const MAX_VOICE_INPUT_LENGTH = 2000;
export const VOICE_SILENCE_MS = 5000;
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
  let snapshot: VoiceInputSnapshot = { phase: 'idle', permission: 'undetermined', draft: '', partial: '', speaking: false, source: 'text', error: null, delivery: 'none' };
  const listeners = new Set<() => void>();
  let epoch = 0;
  let foreground = true;
  let disposed = false;
  let session: SpeechSession | undefined;
  let abort: AbortController | undefined;
  let submittedText: string | undefined;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let silenceTimer: ReturnType<typeof setTimeout> | undefined;
  let lastSpeechAt: number | null = null;
  let finalizedText = '';
  let lastFinalSegment = '';
  let lastPartialSegment = '';
  let newPartialSinceFinal = false;
  let nativeEnded = false;
  let awaitingFinal = false;
  let pendingPartialAtStop = false;
  const update = (patch: Partial<VoiceInputSnapshot>) => {
    snapshot = { ...snapshot, ...patch };
    listeners.forEach(listener => listener());
  };
  const release = () => {
    epoch += 1;
    if (deadline) clearTimeout(deadline);
    deadline = undefined;
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = undefined;
    abort?.abort();
    abort = undefined;
    const owned = session;
    session = undefined;
    try { owned?.cancel(); } catch { /* Native failure stays within this feature. */ }
    lastSpeechAt = null;
    finalizedText = '';
    lastFinalSegment = '';
    lastPartialSegment = '';
    newPartialSinceFinal = false;
    nativeEnded = false;
    awaitingFinal = false;
    pendingPartialAtStop = false;
  };
  const live = (id: number) => !disposed && foreground && epoch === id;
  const busy = () => ['permissionRequesting', 'listening', 'processing'].includes(snapshot.phase) || snapshot.delivery === 'pending';
  const fail = (reason: SpeechFailure) => {
    release();
    update({ phase: reason === 'unavailable' ? 'unavailable' : 'error', error: reason, partial: '', speaking: false, draft: '' });
  };
  const cancel = () => {
    release();
    submittedText = undefined;
    update({ phase: 'canceled', draft: '', partial: '', speaking: false, error: null, delivery: 'none' });
  };
  const submitInput = async () => {
    if (disposed || !foreground || busy()) return;
    const result = validateVoiceInput(snapshot.draft);
    if (result.error) { update({ error: result.error }); return; }
    if (submittedText === result.text) return;
    submittedText = result.text; // synchronous claim prevents duplicate callbacks and taps
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
  };
  const submitFinalVoice = () => {
    const result = validateVoiceInput(finalizedText);
    if (result.error) { release(); update({ phase: 'error', error: result.error, partial: '', speaking: false }); return; }
    const text = result.text;
    release(); // stop native capture before sending text to the AI boundary
    update({ phase: 'final', draft: text, partial: '', speaking: false, source: 'voice', error: null });
    void submitInput();
  };
  const stopCapture = async (id: number) => {
    if (!live(id) || snapshot.phase !== 'listening') return;
    if (nativeEnded) { if (finalizedText && !snapshot.partial) submitFinalVoice(); else fail('noSpeech'); return; }
    awaitingFinal = true;
    pendingPartialAtStop = !!snapshot.partial;
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = undefined;
    update({ phase: 'processing', partial: '', speaking: false });
    if (deadline) clearTimeout(deadline);
    deadline = setTimeout(() => { if (live(id)) fail('noSpeech'); }, 10000);
    try { await session?.stop(); } catch { if (live(id)) fail('failed'); }
  };
  const scheduleSilence = (id: number) => {
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
      silenceTimer = undefined;
      if (!live(id) || snapshot.phase !== 'listening') return;
      if (finalizedText && !snapshot.partial) submitFinalVoice();
      else void stopCapture(id);
    }, Math.max(0, VOICE_SILENCE_MS - (Date.now() - (lastSpeechAt ?? Date.now()))));
  };
  const markSpeech = (id: number) => { lastSpeechAt = Date.now(); scheduleSilence(id); };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    async start(locale: 'ko-KR' | 'en-US') {
      if (disposed || !foreground || busy()) return;
      release();
      submittedText = undefined; // a new explicit capture may repeat a previous request
      update({ phase: 'permissionRequesting', partial: '', speaking: false, draft: '', error: null, delivery: 'none', source: 'voice' });
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
          if (event.type === 'error') {
            if (event.reason === 'noSpeech' && finalizedText && !snapshot.partial && !pendingPartialAtStop) {
              nativeEnded = true;
              if (awaitingFinal) submitFinalVoice();
            } else fail(event.reason);
            return;
          }
          if (event.type === 'ended') {
            nativeEnded = true;
            if (awaitingFinal) { if (finalizedText && !pendingPartialAtStop) submitFinalVoice(); else fail('noSpeech'); }
            else if (!finalizedText) fail('noSpeech');
            return;
          }
          if (event.type === 'processing') { update({ phase: 'processing', partial: '', speaking: false }); return; }
          if (event.type === 'activity') {
            if (snapshot.phase === 'listening') {
              if (snapshot.speaking !== event.speaking) update({ speaking: event.speaking });
              if (event.speaking && lastSpeechAt !== null) markSpeech(id);
            }
            return;
          }
          if (event.type === 'partial') {
            if (snapshot.phase === 'listening' && event.text.trim() && event.text !== lastPartialSegment) {
              lastPartialSegment = event.text;
              newPartialSinceFinal = true;
              update({ partial: [finalizedText, event.text].filter(Boolean).join(' ').slice(0, MAX_VOICE_INPUT_LENGTH) });
              markSpeech(id);
            }
            return;
          }
          const result = validateVoiceInput(event.text);
          if (result.error === 'empty') return;
          if (result.error) { release(); update({ phase: 'error', error: result.error, partial: '', speaking: false }); return; }
          if (lastFinalSegment === result.text && !newPartialSinceFinal) return;
          const combined = validateVoiceInput([finalizedText, result.text].filter(Boolean).join(' '));
          if (combined.error) { release(); update({ phase: 'error', error: combined.error, partial: '', speaking: false }); return; }
          finalizedText = combined.text;
          lastFinalSegment = result.text;
          lastPartialSegment = '';
          newPartialSinceFinal = false;
          update({ draft: finalizedText, partial: '', speaking: false, source: 'voice' });
          if (awaitingFinal) submitFinalVoice();
          else if (lastSpeechAt === null) markSpeech(id);
          else scheduleSilence(id); // a late native final does not restart the five-second silence clock
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
      await stopCapture(epoch);
    },
    edit(text: string) {
      if (disposed || !foreground) return;
      release();
      if (text.trim() !== submittedText) submittedText = undefined;
      update({ draft: text, partial: '', speaking: false, source: 'text', phase: 'idle', error: null, delivery: 'none' });
    },
    submit: submitInput,
    cancel,
    setForeground(active: boolean) { foreground = active; if (!active && !disposed) cancel(); },
    dispose() { disposed = true; cancel(); listeners.clear(); },
  };
}
