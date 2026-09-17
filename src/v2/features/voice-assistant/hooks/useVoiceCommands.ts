import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { createVoiceCommandDispatcher, type VoiceCommandRuntime } from '../model/voiceCommands';
import { useVoiceSession } from './useVoiceSession';
import type { VoiceEnvelopeConsumer, VoiceSessionController } from '../model/voiceSession';
import type { AppCommandResult, ClarificationField } from '../model/voiceAssistantCommand.types';
import type { OnFinalInput } from '../model/voiceInput';
import { voiceSessionError, type VoiceSessionErrorCode } from '../model/voiceSessionError';

export type VoiceCommandContext = Omit<VoiceCommandRuntime, 'session' | 'queryClient' | 'now' | 'monotonic' | 'contextRevision'>;
export type VoiceCommandViewState =
  | { phase: 'idle' | 'processing' | 'canceled' | 'advisory' }
  | { phase: 'clarification'; field: ClarificationField }
  | { phase: 'result'; result: AppCommandResult }
  | { phase: 'error'; code: VoiceSessionErrorCode };

/** App-owned context never enters the gateway body. Only reviewed text is submitted. */
export function useVoiceCommands(context: VoiceCommandContext) {
  const queryClient = useQueryClient();
  const latest = useRef(context); latest.current = context;
  const sessionRef = useRef<VoiceSessionController | undefined>(undefined);
  const revision = useRef(0);
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
    else if (envelope.kind === 'protocol_error') setCommandState({ phase: 'error', code: 'INVALID_RESPONSE' });
    else setCommandState({ phase: 'advisory' }); // Never display provider success claims or speak them.
  }, [dispatcher]);
  const { controller, state } = useVoiceSession(context.accountRevision, consume);
  sessionRef.current = controller;
  useLayoutEffect(() => {
    if (!state.retryAvailable || state.retryAt === null) return;
    const timer = setTimeout(() => setRetryClock(Date.now()), Math.max(0, state.retryAt - Date.now()));
    return () => clearTimeout(timer);
  }, [state.retryAvailable, state.retryAt]);
  const retryReady = state.retryAvailable && state.retryAt !== null && Math.max(retryClock, Date.now()) >= state.retryAt;
  useLayoutEffect(() => {
    revision.current++;
    controller.cancel(); dispatcher.clear(); setCommandState({ phase: 'idle' });
  }, [controller, dispatcher, context.accountRevision, context.location?.latitude, context.location?.longitude,
    context.locationPermission, context.radiusKm, context.timezone, context.selectedPlaceId, context.placeListEnabled]);
  useLayoutEffect(() => {
    const unsubscribe = controller.subscribe(() => {
      const snapshot = controller.getSnapshot();
      if (snapshot.phase === 'closed') { dispatcher.clear(); setCommandState({ phase: 'canceled' }); }
      if (snapshot.error) setCommandState({ phase: 'error', code: snapshot.error });
    });
    return () => { unsubscribe(); dispatcher.clear(); };
  }, [controller, dispatcher]);
  const onFinalInput = useCallback<OnFinalInput>(async input => {
    setCommandState({ phase: 'processing' });
    try {
      // A reviewed, explicit submission can resume after the native Modal's activity blur.
      // Background still blocks submission and never auto-restarts a session.
      controller.setForeground(AppState.currentState === 'active');
      if (!controller.getIdentity()) await controller.start(input.signal);
      if (input.signal.aborted) return 'accepted' as const;
      if (!controller.getIdentity()) {
        setCommandState({ phase: 'error', code: controller.getSnapshot().error ?? 'SESSION_REQUIRED' });
        return 'accepted' as const;
      }
      await controller.send(input.text, input.signal);
    } catch (error) { setCommandState({ phase: 'error', code: voiceSessionError(error).code }); }
    return 'accepted' as const;
  }, [controller]);
  const cancel = useCallback(() => { dispatcher.clear(); void controller.close(); setCommandState({ phase: 'canceled' }); }, [controller, dispatcher]);
  const retry = useCallback(async () => {
    try { setCommandState({ phase: 'processing' }); await controller.retry(); }
    catch (error) { setCommandState({ phase: 'error', code: voiceSessionError(error).code }); }
  }, [controller]);
  return { commandState, onFinalInput, cancel, retry, retryReady, retryAvailable: state.retryAvailable, retryAt: state.retryAt };
}
