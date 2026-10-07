import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { createVoiceCommandDispatcher, type VoiceCommandRuntime } from '../model/voiceCommands';
import { useVoiceSession } from './useVoiceSession';
import type { VoiceEnvelopeConsumer, VoiceSessionController } from '../model/voiceSession';
import type { AppCommandResult, ClarificationField } from '../model/voiceAssistantCommand.types';
import type { OnFinalInput } from '../model/voiceInput';
import { voiceSessionError, type VoiceSessionErrorCode } from '../model/voiceSessionError';
import { serverInstant } from '../model/voiceCommandTime';

export type VoiceCommandContext = Omit<VoiceCommandRuntime, 'session' | 'queryClient' | 'now' | 'monotonic' | 'contextRevision'>;
export type VoiceCommandViewState =
  | { phase: 'idle' | 'processing' | 'canceled' | 'unrecognized' }
  | { phase: 'assistant'; text: string }
  | { phase: 'clarification'; field: ClarificationField }
  | { phase: 'result'; result: AppCommandResult }
  | { phase: 'error'; code: VoiceSessionErrorCode };

/** App-owned context never enters the gateway body. Only final text enters the gateway. */
export function useVoiceCommands(context: VoiceCommandContext) {
  const queryClient = useQueryClient();
  const latest = useRef(context); latest.current = context;
  const sessionRef = useRef<VoiceSessionController | undefined>(undefined);
  const revision = useRef(0);
  const inputRevision = useRef(0);
  const [retryClock, setRetryClock] = useState(0);
  const [commandState, setCommandState] = useState<VoiceCommandViewState>({ phase: 'idle' });
  const dispatcher = useMemo(() => createVoiceCommandDispatcher({
    runtime: () => ({ ...latest.current, queryClient, contextRevision: revision.current,
      now: Date.now, monotonic: () => performance.now(), session: sessionRef.current?.getIdentity() }),
    publish: result => setCommandState({ phase: 'result', result }),
    stopSession: () => sessionRef.current?.close(),
  }), [queryClient]);
  const consume = useCallback<VoiceEnvelopeConsumer>(async (envelope, delivery) => {
    if (!delivery.isCurrent() || delivery.signal.aborted) return;
    if (envelope.kind === 'command_request') await dispatcher.consume(envelope, delivery);
    else if (envelope.kind === 'clarification_request') setCommandState({ phase: 'clarification', field: envelope.field });
    else if (envelope.kind === 'protocol_error') {
      if (envelope.code === 'UNSUPPORTED_REQUEST') setCommandState({ phase: 'unrecognized' });
      else setCommandState({ phase: 'error',
        code: envelope.code === 'PROVIDER_UNAVAILABLE' ? 'PROVIDER_UNAVAILABLE' : 'INVALID_RESPONSE' });
    }
    else setCommandState({ phase: 'assistant', text: envelope.text }); // Plain conversation only; never dispatch, confirm, or speak it.
  }, [dispatcher]);
  const { controller, state } = useVoiceSession(context.accountRevision, consume);
  sessionRef.current = controller;
  useLayoutEffect(() => {
    if (commandState.phase !== 'result' || commandState.result.command !== 'prepareReservation'
      || commandState.result.outcome.status !== 'succeeded') return;
    const result = commandState.result;
    const expiry = serverInstant(commandState.result.outcome.data.draft.confirmation.expiresAt);
    // Monotonic deadline prevents a wall-clock rollback from extending a displayed draft.
    const deadline = performance.now() + Math.max(0, expiry - Date.now());
    let timer: ReturnType<typeof setTimeout>;
    const expire = () => {
      const remaining = Math.min(expiry - Date.now(), deadline - performance.now());
      if (remaining > 0) { timer = setTimeout(expire, remaining); return; }
      setCommandState(current => current.phase === 'result' && current.result === result
        ? { phase: 'result', result: { ...result, outcome: { status: 'rejected', code: 'STALE_CONTEXT' } } }
        : current);
    };
    expire();
    return () => clearTimeout(timer);
  }, [commandState, dispatcher]);
  useLayoutEffect(() => {
    if (!state.retryAvailable || state.retryAt === null) return;
    const timer = setTimeout(() => setRetryClock(Date.now()), Math.max(0, state.retryAt - Date.now()));
    return () => clearTimeout(timer);
  }, [state.retryAvailable, state.retryAt]);
  const retryReady = state.retryAvailable && state.retryAt !== null && Math.max(retryClock, Date.now()) >= state.retryAt;
  useLayoutEffect(() => {
    inputRevision.current++;
    revision.current++;
    controller.cancel(); dispatcher.clear(); setCommandState({ phase: 'idle' });
  }, [controller, dispatcher, context.accountRevision, context.location?.latitude, context.location?.longitude,
    context.locationPermission, context.radiusKm, context.timezone, context.selectedPlaceId, context.placeListEnabled]);
  useLayoutEffect(() => {
    const unsubscribe = controller.subscribe(() => {
      const snapshot = controller.getSnapshot();
      if (snapshot.phase === 'creating' || snapshot.phase === 'sending') setCommandState({ phase: 'processing' });
      if (snapshot.phase === 'closed') { dispatcher.clear(); setCommandState({ phase: 'canceled' }); }
      if (snapshot.error) setCommandState({ phase: 'error', code: snapshot.error });
    });
    return () => { inputRevision.current++; unsubscribe(); dispatcher.clear(); };
  }, [controller, dispatcher]);
  const onFinalInput = useCallback<OnFinalInput>(async input => {
    const submittedRevision = ++inputRevision.current;
    let submittedGeneration = controller.getSnapshot().generation;
    const current = () => submittedRevision === inputRevision.current
      && sessionRef.current === controller && !input.signal.aborted
      && controller.getSnapshot().generation === submittedGeneration;
    setCommandState({ phase: 'processing' });
    try {
      // User-initiated voice capture or text send can resume after the native Modal's activity blur.
      // Background still blocks submission and never auto-restarts a session.
      controller.setForeground(AppState.currentState === 'active');
      if (!controller.getIdentity()) {
        const starting = controller.start(input.signal);
        submittedGeneration = controller.getSnapshot().generation;
        // start invalidates the old session synchronously before publishing creating.
        if (current()) setCommandState({ phase: 'processing' });
        await starting;
      }
      if (!current()) return 'accepted' as const;
      if (!controller.getIdentity()) {
        setCommandState({ phase: 'error', code: controller.getSnapshot().error ?? 'SESSION_REQUIRED' });
        return 'accepted' as const;
      }
      const sending = controller.send(input.text, input.signal);
      submittedGeneration = controller.getSnapshot().generation;
      await sending;
    } catch (error) { if (current()) setCommandState({ phase: 'error', code: voiceSessionError(error).code }); }
    return 'accepted' as const;
  }, [controller]);
  const cancel = useCallback(() => { inputRevision.current++; dispatcher.clear(); void controller.close(); setCommandState({ phase: 'canceled' }); }, [controller, dispatcher]);
  const dismissFeedback = useCallback(() => {
    inputRevision.current++; controller.cancel(); dispatcher.clear(); setCommandState({ phase: 'idle' });
  }, [controller, dispatcher]);
  const retry = useCallback(async () => {
    const submittedRevision = ++inputRevision.current;
    try { setCommandState({ phase: 'processing' }); await controller.retry(); }
    catch (error) {
      if (submittedRevision === inputRevision.current && sessionRef.current === controller)
        setCommandState({ phase: 'error', code: voiceSessionError(error).code });
    }
  }, [controller]);
  return { commandState, onFinalInput, cancel, dismissFeedback, retry, retryReady, retryAvailable: state.retryAvailable, retryAt: state.retryAt };
}
