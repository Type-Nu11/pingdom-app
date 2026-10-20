import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { placeQueryKeys } from '../../place';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { createVoiceCommandDispatcher, projectVoicePlace, type VoiceCommandRuntime } from '../model/voiceCommands';
import { createAiChatSessionApi } from '../api/aiChatSessionApi';
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
  | { phase: 'result'; result: AppCommandResult; text?: string; followUpError?: VoiceSessionErrorCode }
  | { phase: 'error'; code: VoiceSessionErrorCode };

/** Location/account identifiers remain app-owned. Chat receives final text and projected tool results. */
export function useVoiceCommands(context: VoiceCommandContext) {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const latest = useRef(context); latest.current = context;
  const language = useRef(i18n.resolvedLanguage ?? i18n.language); language.current = i18n.resolvedLanguage ?? i18n.language;
  const api = useMemo(() => createAiChatSessionApi(undefined, () => {
    const id = latest.current.selectedPlaceId;
    const state = id ? queryClient.getQueryState(placeQueryKeys.detail(id)) : undefined;
    let selectedPlaceId: number | undefined;
    if (id && state?.status === 'success') {
      try { selectedPlaceId = projectVoicePlace(state.data, id).id; } catch { /* Unverified context is never supplied to AI. */ }
    }
    return { language: language.current, ...(selectedPlaceId ? { selectedPlaceId } : {}) };
  }), [context.accountRevision, queryClient]);
  const sessionRef = useRef<VoiceSessionController | undefined>(undefined);
  const revision = useRef(0);
  const inputRevision = useRef(0);
  const [retryClock, setRetryClock] = useState(0);
  const [bookerUpdate, setBookerUpdate] = useState<AppCommandResult | null>(null);
  const [commandState, setCommandState] = useState<VoiceCommandViewState>({ phase: 'idle' });
  const dispatcher = useMemo(() => createVoiceCommandDispatcher({
    runtime: () => ({ ...latest.current, queryClient, contextRevision: revision.current,
      now: Date.now, monotonic: () => performance.now(), session: sessionRef.current?.getIdentity() }),
    publish: result => { if (result.command === 'updateReservationBooker' && result.outcome.status === 'succeeded') setBookerUpdate(result); api.recordResult(result); setCommandState({ phase: 'result', result }); },
    stopSession: () => sessionRef.current?.close(),
  }), [queryClient, api]);
  const consume = useCallback<VoiceEnvelopeConsumer>(async (envelope, delivery) => {
    if (!delivery.isCurrent() || delivery.signal.aborted) return;
    if (envelope.kind === 'command_request') await dispatcher.consume(envelope, delivery);
    else if (envelope.kind === 'clarification_request') setCommandState({ phase: 'clarification', field: envelope.field });
    else if (envelope.kind === 'protocol_error') {
      if (envelope.code === 'UNSUPPORTED_REQUEST') setCommandState({ phase: 'unrecognized' });
      else setCommandState({ phase: 'error',
        code: envelope.code === 'PROVIDER_UNAVAILABLE' ? 'PROVIDER_UNAVAILABLE' : 'INVALID_RESPONSE' });
    }
    else setCommandState(current => {
      if (current.phase !== 'result') return { phase: 'assistant', text: envelope.text };
      const result = current.result;
      // Use app-owned failure/empty copy: a bounded query cannot establish DB-wide absence.
      if (result.command === 'navigateToPage') return current;
      if (result.outcome.status !== 'succeeded') return current;
      if ((result.command === 'searchNearbyPlaces' || result.command === 'searchNearbyReservablePlaces')
        && result.outcome.data.places.length === 0) return current;
      return { ...current, text: envelope.text };
    }); // Plain conversation only; never dispatch, confirm, or speak it.
  }, [dispatcher]);
  const { controller, state } = useVoiceSession(context.accountRevision, consume, api);
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
    revision.current++;
    controller.cancel(); dispatcher.clear(); setBookerUpdate(null); setCommandState({ phase: 'idle' });
  }, [controller, dispatcher, context.accountRevision, context.location?.latitude, context.location?.longitude,
    context.locationPermission, context.radiusKm, context.timezone, context.selectedPlaceId, context.placeListEnabled]);
  useLayoutEffect(() => {
    const unsubscribe = controller.subscribe(() => {
      const snapshot = controller.getSnapshot();
      if (snapshot.phase === 'creating' || snapshot.phase === 'sending') setCommandState({ phase: 'processing' });
      if (snapshot.phase === 'closed') { dispatcher.clear(); setCommandState({ phase: 'canceled' }); }
      if (snapshot.error) setCommandState(current => current.phase === 'result'
        ? { ...current, followUpError: snapshot.error! } : { phase: 'error', code: snapshot.error! });
    });
    return () => { unsubscribe(); dispatcher.clear(); };
  }, [controller, dispatcher]);
  const onFinalInput = useCallback<OnFinalInput>(async input => {
    if (input.signal.aborted) return 'accepted' as const;
    const capturedInput = ++inputRevision.current;
    const capturedContext = revision.current;
    let generation = controller.getSnapshot().generation;
    const isCurrent = () => !input.signal.aborted && capturedInput === inputRevision.current
      && capturedContext === revision.current && generation === controller.getSnapshot().generation;
    setCommandState({ phase: 'processing' });
    try {
      // User-initiated voice capture or text send can resume after the native Modal's activity blur.
      // Background still blocks submission and never auto-restarts a session.
      controller.setForeground(AppState.currentState === 'active');
      if (!controller.getIdentity()) {
        const creation = controller.start(input.signal);
        generation = controller.getSnapshot().generation;
        await creation;
      }
      // Creation can settle after cancellation or after a newer input installed its session.
      // That old input must neither publish feedback nor send into the new session.
      if (!isCurrent()) return 'accepted' as const;
      if (!controller.getIdentity()) {
        setCommandState({ phase: 'error', code: controller.getSnapshot().error ?? 'SESSION_REQUIRED' });
        return 'accepted' as const;
      }
      const sending = controller.send(input.text, input.signal);
      generation = controller.getSnapshot().generation;
      await sending;
    } catch (error) { if (isCurrent()) setCommandState({ phase: 'error', code: voiceSessionError(error).code }); }
    return 'accepted' as const;
  }, [controller]);
  const cancel = useCallback(() => { dispatcher.clear(); void controller.close(); setCommandState({ phase: 'canceled' }); }, [controller, dispatcher]);
  // Dismiss presentation only. The chat still contains verified place IDs, so
  // preserve their provenance until a replacement search or context/session change.
  const dismissFeedback = useCallback(() => { setCommandState({ phase: 'idle' }); }, []);
  const retry = useCallback(async () => {
    try { setCommandState({ phase: 'processing' }); await controller.retry(); }
    catch (error) { setCommandState({ phase: 'error', code: voiceSessionError(error).code }); }
  }, [controller]);
  return { bookerUpdate, commandState, onFinalInput, cancel, dismissFeedback, retry, retryReady, retryAvailable: state.retryAvailable, retryAt: state.retryAt };
}
