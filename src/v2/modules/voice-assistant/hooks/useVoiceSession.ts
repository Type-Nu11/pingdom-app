import { useLayoutEffect, useMemo, useSyncExternalStore } from 'react';
import type { VoiceSessionApi } from '../api/voiceSessionApi';
import { AppState } from 'react-native';
import { createVoiceSessionController, type VoiceEnvelopeConsumer } from '../model/voiceSession';

/** Host supplies its current authenticated account identity; never a JWT. No automatic session start. */
export function useVoiceSession(accountId: string | null, onEnvelope: VoiceEnvelopeConsumer, api?: VoiceSessionApi) {
  const controller = useMemo(() => createVoiceSessionController(onEnvelope, api), [accountId, onEnvelope, api]);
  useLayoutEffect(() => {
    controller.setAuthenticated(accountId !== null);
    controller.setForeground(AppState.currentState === 'active');
    const subscription = AppState.addEventListener('change', value => controller.setForeground(value === 'active'));
    const blur = AppState.addEventListener('blur', () => controller.setForeground(false));
    const focus = AppState.addEventListener('focus', () => controller.setForeground(AppState.currentState === 'active'));
    return () => { controller.dispose(); subscription.remove(); blur.remove(); focus.remove(); };
  }, [controller, accountId]);
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  return { controller, state };
}
