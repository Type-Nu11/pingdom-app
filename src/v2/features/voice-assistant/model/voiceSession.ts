import { createVoiceSessionApi, type VoiceSessionApi, type VoiceSessionDto, type VoiceMessageRequest } from '../api/voiceSessionApi';
import { voiceSessionExpiresAt } from './voiceSessionExpiry';
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
  retryAvailable: boolean; retryAt: number | null;
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
  let retryInput: { body: VoiceMessageRequest; at: number; monotonicAt: number; attempt: number } | undefined;
  let expiresAt = 0;
  let expiryDeadline = 0;
  let expiryTimer: ReturnType<typeof setTimeout> | undefined;
  let state: VoiceSessionState = Object.freeze({ phase: 'idle', generation, error: null, retryAvailable: false, retryAt: null });
  const listeners = new Set<() => void>();
  const pending = new Set<AbortController>();
  const ledger = new Map<string, LedgerEntry>();
  let turn: AbortController | undefined;
  const publish = (phase: VoiceSessionState['phase'], error: VoiceSessionErrorCode | null = null) => {
    state = Object.freeze({ phase, generation, error, retryAvailable: !!retryInput, retryAt: retryInput?.at ?? null }); listeners.forEach(listener => listener());
  };
  function invalidate(error: VoiceSessionErrorCode | null = null) {
    clearTimeout(expiryTimer); expiryTimer = undefined;
    retryInput = undefined; expiresAt = 0; expiryDeadline = 0;
    epoch = Symbol('voice-session'); generation++;
    turn?.abort(); turn = undefined;
    pending.forEach(controller => controller.abort()); pending.clear();
    dto = undefined; ledger.clear();
    publish('closed', error);
  }
  function allowed() {
    if (!authenticated) throw new VoiceSessionError('AUTHENTICATION_REQUIRED');
    if (!foreground) throw new VoiceSessionError('CANCELED');
  }
  function expired() {
    return !!dto && (Date.now() >= expiresAt || performance.now() >= expiryDeadline);
  }
  function requireSession() {
    allowed();
    if (expired()) { invalidate('SESSION_EXPIRED'); throw new VoiceSessionError('SESSION_EXPIRED'); }
    if (!dto) throw new VoiceSessionError('SESSION_REQUIRED');
    return dto;
  }
  function install(value: VoiceSessionDto) {
    const instant = voiceSessionExpiresAt(value.expiresAt);
    if (instant <= Date.now()) throw new VoiceSessionError('SESSION_EXPIRED');
    clearTimeout(expiryTimer);
    dto = value; expiresAt = instant; expiryDeadline = performance.now() + instant - Date.now();
    const captured = epoch;
    const schedule = () => {
      const delay = Math.max(0, Math.min(expiresAt - Date.now(), expiryDeadline - performance.now(), 2_147_483_647));
      expiryTimer = setTimeout(() => {
        if (captured !== epoch) return;
        if (expired()) invalidate('SESSION_EXPIRED'); else schedule();
      }, delay);
    };
    schedule();
  }
  function failure(error: unknown, phase: VoiceSessionState['phase']) {
    const code = voiceSessionError(error).code;
    if (['AUTHENTICATION_REQUIRED', 'FORBIDDEN', 'SESSION_NOT_FOUND', 'SESSION_EXPIRED'].includes(code)) {
      invalidate(code);
    } else publish(phase, code);
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
  async function transmit(input: VoiceMessageRequest, signal?: AbortSignal, attempt = 0) {
    const session = requireSession();
    turn?.abort(); pending.forEach(c => c.abort()); turn = new AbortController();
    retryInput = undefined;
    let received = false;
    const currentTurn = turn; const captured = epoch; const revision = generation;
    const deadline = performance.now() + VOICE_REQUEST_DEADLINE_MS;
    const current = () => captured === epoch && revision === generation && !currentTurn.signal.aborted
      && !signal?.aborted && foreground && authenticated && !expired();
    const abortTurn = () => currentTurn.abort();
    signal?.addEventListener('abort', abortTurn, { once: true });
    if (signal?.aborted) abortTurn();
    publish('sending');
    try {
      if (!input.text.trim() || input.text.length > 2000) throw new VoiceSessionError('INVALID_INPUT');
      if (ledger.size >= VOICE_LEDGER_LIMIT) throw new VoiceSessionError('LEDGER_FULL');
      const envelope = await request(s => api.send(session.sessionId, input, s), currentTurn.signal, deadline);
      received = true;
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
        const code = voiceSessionError(e).code;
        if (code === 'TIMEOUT') currentTurn.abort();
        if (!received && !signal?.aborted && ['NETWORK_ERROR', 'CONNECTION_CLOSED', 'TIMEOUT',
          'SERVER_ERROR', 'PROVIDER_UNAVAILABLE', 'RATE_LIMITED', 'RATE_LIMIT_UNAVAILABLE'].includes(code)) {
          // Retain only the latest failed turn in session memory; no automatic retry.
          const delay = code === 'RATE_LIMITED' ? 60_000 : Math.min(1000 * 2 ** Math.min(attempt, 5), 30_000);
          retryInput = { body: Object.freeze({ ...input }), at: Date.now() + delay,
            monotonicAt: performance.now() + delay, attempt };
        }
        failure(e, 'ready');
      }
    } finally { signal?.removeEventListener('abort', abortTurn); }
  }
  const controller = {
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot: () => state,
    getSession: () => dto,
    async start(signal?: AbortSignal) {
      allowed(); invalidate();
      const captured = epoch; const revision = generation;
      publish('creating');
      try {
        const created = await request(s => api.create(s), signal);
        if (captured !== epoch || revision !== generation || signal?.aborted) return;
        install(created); publish('ready');
      } catch (e) {
        if (captured === epoch && revision === generation) failure(e, 'idle');
      }
    },
    async refresh(signal?: AbortSignal) {
      requireSession();
      if (!dto || state.phase !== 'ready') throw new VoiceSessionError('SESSION_REQUIRED');
      const captured = epoch; const revision = generation; const id = dto.sessionId;
      publish('refreshing');
      try {
        const updated = await request(s => api.refresh(id, s), signal);
        if (captured !== epoch || revision !== generation || signal?.aborted) return;
        install(updated); publish('ready');
      } catch (e) {
        if (captured === epoch && revision === generation) failure(e, 'ready');
      }
    },
    async send(text: string, signal?: AbortSignal) {
      requireSession();
      // New input always advances the generation and discards the previous retry body.
      generation++;
      return transmit({ requestId: `input-${generation}`, text }, signal);
    },
    async retry(signal?: AbortSignal) {
      requireSession();
      const saved = retryInput;
      if (!saved || state.phase !== 'ready') throw new VoiceSessionError('RETRY_UNAVAILABLE');
      if (Date.now() < saved.at || performance.now() < saved.monotonicAt) throw new VoiceSessionError('RETRY_BACKOFF');
      return transmit(saved.body, signal, saved.attempt + 1);
    },
    cancel() { retryInput = undefined; generation++; turn?.abort(); pending.forEach(c => c.abort()); publish(dto ? 'ready' : 'closed'); },
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
