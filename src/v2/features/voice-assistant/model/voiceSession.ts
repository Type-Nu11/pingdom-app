import { createVoiceSessionApi, type VoiceSessionApi, type VoiceSessionDto } from '../api/voiceSessionApi';
import type { ProviderEnvelope } from './voiceAssistantCommand.types';
import { VoiceSessionError, voiceSessionError, type VoiceSessionErrorCode } from './voiceSessionError';

export const VOICE_REQUEST_DEADLINE_MS = 30_000;
export const VOICE_LEDGER_LIMIT = 256;
export type VoiceDeliveryContext = Readonly<{
  epoch: symbol; generation: number; signal: AbortSignal; isCurrent: () => boolean;
}>;
export type VoiceEnvelopeConsumer = (envelope: ProviderEnvelope, context: VoiceDeliveryContext) => void | Promise<void>;
export type VoiceSessionState = Readonly<{
  phase: 'idle' | 'creating' | 'ready' | 'sending' | 'refreshing' | 'closed';
  generation: number; error: VoiceSessionErrorCode | null;
}>;
type LedgerEntry = { fingerprint: string; result: Promise<void> };

// Only parser-normalized values enter this serializer. No raw prompt is retained.
function fingerprint(value: unknown): string {
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map(key => `${JSON.stringify(key)}:${fingerprint(object[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

/** In-memory transport ownership only. Consumer remains responsible for #348 policy/execution. */
export function createVoiceSessionController(
  onEnvelope: VoiceEnvelopeConsumer,
  api: VoiceSessionApi = createVoiceSessionApi(),
) {
  let epoch = Symbol('voice-session');
  let generation = 0;
  let dto: Required<VoiceSessionDto> | undefined;
  let foreground = true;
  let authenticated = true;
  let state: VoiceSessionState = Object.freeze({ phase: 'idle', generation, error: null });
  const listeners = new Set<() => void>();
  const pending = new Set<AbortController>();
  const ledger = new Map<string, LedgerEntry>();
  let turn: AbortController | undefined;
  const publish = (phase: VoiceSessionState['phase'], error: VoiceSessionErrorCode | null = null) => {
    state = Object.freeze({ phase, generation, error }); listeners.forEach(listener => listener());
  };
  function invalidate() {
    epoch = Symbol('voice-session'); generation++;
    turn?.abort(); turn = undefined;
    pending.forEach(controller => controller.abort()); pending.clear();
    dto = undefined; ledger.clear();
    publish('closed');
  }
  function allowed() {
    if (!authenticated) throw new VoiceSessionError('AUTHENTICATION_REQUIRED');
    if (!foreground) throw new VoiceSessionError('CANCELED');
  }
  async function request<T>(work: (signal: AbortSignal) => Promise<T>, external?: AbortSignal, deadline = performance.now() + VOICE_REQUEST_DEADLINE_MS): Promise<T> {
    const controller = new AbortController();
    pending.add(controller);
    let timedOut = false;
    const abort = () => controller.abort();
    external?.addEventListener('abort', abort, { once: true });
    if (external?.aborted) abort();
    let rejectAbort: () => void = () => {};
    const canceled = new Promise<never>((_, reject) => {
      rejectAbort = () => reject(new VoiceSessionError(timedOut ? 'TIMEOUT' : 'CANCELED'));
      controller.signal.addEventListener('abort', rejectAbort, { once: true });
    });
    // A pre-aborted signal/synchronous adapter failure can precede Promise.race.
    void canceled.catch(() => {});
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, Math.max(0, deadline - performance.now()));
    try {
      if (controller.signal.aborted) throw new VoiceSessionError('CANCELED');
      if (performance.now() >= deadline) {
        timedOut = true; controller.abort(); throw new VoiceSessionError('TIMEOUT');
      }
      return await Promise.race([work(controller.signal), canceled]);
    } catch (e) { throw voiceSessionError(e); }
    finally {
      clearTimeout(timer); pending.delete(controller);
      controller.signal.removeEventListener('abort', rejectAbort);
      external?.removeEventListener('abort', abort);
    }
  }
  const controller = {
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot: () => state,
    /** Never parse expiresAt until its timezone contract is resolved. */
    getSession: () => dto,
    async start(signal?: AbortSignal) {
      allowed(); invalidate();
      const captured = epoch; const revision = generation;
      publish('creating');
      try {
        const created = await request(s => api.create(s), signal);
        if (captured !== epoch || revision !== generation || signal?.aborted) return;
        dto = created; publish('ready');
      } catch (e) {
        if (captured === epoch && revision === generation) publish('idle', voiceSessionError(e).code);
      }
    },
    async refresh(signal?: AbortSignal) {
      allowed();
      if (!dto || state.phase !== 'ready') throw new VoiceSessionError('SESSION_REQUIRED');
      const captured = epoch; const revision = generation; const id = dto.sessionId;
      publish('refreshing');
      try {
        const updated = await request(s => api.refresh(id, s), signal);
        if (captured !== epoch || revision !== generation || signal?.aborted) return;
        dto = updated; publish('ready');
      } catch (e) {
        if (captured === epoch && revision === generation) publish('ready', voiceSessionError(e).code);
      }
    },
    async send(text: string, signal?: AbortSignal) {
      allowed();
      if (!dto) throw new VoiceSessionError('SESSION_REQUIRED');
      // Every input invalidates prior work, including an input that fails validation.
      turn?.abort(); pending.forEach(c => c.abort()); turn = new AbortController(); generation++;
      const currentTurn = turn; const captured = epoch; const revision = generation;
      const deadline = performance.now() + VOICE_REQUEST_DEADLINE_MS;
      const current = () => captured === epoch && revision === generation && !currentTurn.signal.aborted
        && !signal?.aborted && foreground && authenticated;
      const abortTurn = () => currentTurn.abort();
      signal?.addEventListener('abort', abortTurn, { once: true });
      if (signal?.aborted) abortTurn();
      publish('sending');
      try {
        if (!text.trim() || text.length > 2000) throw new VoiceSessionError('INVALID_INPUT');
        if (ledger.size >= VOICE_LEDGER_LIMIT) throw new VoiceSessionError('LEDGER_FULL');
        const id = dto.sessionId;
        // New request IDs are local correlation only; no undocumented server retry guarantee.
        const requestId = `input-${revision}`;
        const envelope = await request(s => api.send(id, { requestId, text }, s), currentTurn.signal, deadline);
        if (!current()) return;
        if (performance.now() >= deadline) throw new VoiceSessionError('TIMEOUT');
        const payload = fingerprint(envelope);
        const existing = ledger.get(envelope.id);
        if (existing) {
          if (existing.fingerprint !== payload) throw new VoiceSessionError('REPLAY_CONFLICT');
          // The same delivery is never sent to the consumer twice, even across generations.
          await request(() => existing.result, currentTurn.signal, deadline);
        } else {
          const context = Object.freeze({ epoch: captured, generation: revision, signal: currentTurn.signal, isCurrent: current });
          // Claim synchronously BEFORE consumer invocation, including reentrant consumers.
          let resolve!: () => void; let reject!: (e: unknown) => void;
          const result = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
          // Attach before invoking a reentrant consumer, which may abort this turn.
          void result.catch(() => {});
          ledger.set(envelope.id, { fingerprint: payload, result });
          try { Promise.resolve(onEnvelope(envelope, context)).then(resolve, () => reject(new VoiceSessionError('DELIVERY_FAILED'))); }
          catch { reject(new VoiceSessionError('DELIVERY_FAILED')); }
          await request(() => result, currentTurn.signal, deadline);
        }
        if (current()) publish('ready');
      } catch (e) {
        // An explicit cancel already published its own state; late failures stay silent.
        if (captured === epoch && revision === generation) {
          const failure = voiceSessionError(e);
          if (failure.code === 'TIMEOUT') currentTurn.abort();
          publish('ready', failure.code);
        }
      } finally { signal?.removeEventListener('abort', abortTurn); }
    },
    cancel() { generation++; turn?.abort(); pending.forEach(c => c.abort()); publish(dto ? 'ready' : 'closed'); },
    async close(signal?: AbortSignal) {
      const id = dto?.sessionId;
      invalidate(); // Suppress late responses immediately, before server acknowledgement.
      const captured = epoch;
      if (!id) return;
      try { await request(s => api.close(id, s), signal); }
      catch (e) { if (captured === epoch) publish('closed', voiceSessionError(e).code); }
    },
    setForeground(value: boolean) { foreground = value; if (!value) invalidate(); },
    setAuthenticated(value: boolean) { authenticated = value; if (!value) invalidate(); },
    dispose() { authenticated = false; foreground = false; invalidate(); },
  };
  return controller;
}
export type VoiceSessionController = ReturnType<typeof createVoiceSessionController>;
