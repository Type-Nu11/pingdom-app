import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { createVoiceInputController, type OnFinalInput, type SpeechInputAdapter } from '../model/voiceInput';

export function useVoiceInput(adapter: SpeechInputAdapter, onFinalInput: OnFinalInput) {
  const controller = useMemo(() => createVoiceInputController(adapter, onFinalInput), [adapter, onFinalInput]);
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  useFocusEffect(useCallback(() => {
    controller.setForeground(AppState.currentState === 'active');
    const subscription = AppState.addEventListener('change', status => controller.setForeground(status === 'active'));
    // Android notification shade/focus loss can occur without an AppState change.
    const blur = AppState.addEventListener('blur', () => controller.setForeground(false));
    const focus = AppState.addEventListener('focus', () => controller.setForeground(AppState.currentState === 'active'));
    return () => {
      controller.setForeground(false);
      subscription.remove();
      blur.remove();
      focus.remove();
    };
  }, [controller]));
  return { controller, state };
}
