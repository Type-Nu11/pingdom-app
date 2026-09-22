import { getRecordingPermissionsAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import { Platform } from 'react-native';
import type { PermissionResponse } from 'expo-modules-core';
import type { ExpoSpeechRecognitionErrorCode } from 'expo-speech-recognition';
import type { MicrophonePermission, SpeechEvent, SpeechInputAdapter, SpeechSession } from '../model/voiceInput';

type Permission = PermissionResponse & { restricted?: boolean };
type SpeechModule = typeof import('expo-speech-recognition').ExpoSpeechRecognitionModule;
type Dependencies = {
  platform: 'android' | 'ios';
  module: SpeechModule;
  getMicrophone: () => Promise<Permission>;
  requestMicrophone: () => Promise<Permission>;
};

const permissionState = (permission: Permission): MicrophonePermission => {
  if (permission.granted) return 'granted';
  if (permission.restricted) return 'restricted';
  if (!permission.canAskAgain) return 'blocked';
  return permission.status === 'undetermined' ? 'undetermined' : 'denied';
};

const failure = (error: ExpoSpeechRecognitionErrorCode): SpeechEvent => {
  if (error === 'interrupted') return { type: 'error', reason: 'interrupted' };
  if (error === 'network') return { type: 'error', reason: 'network' };
  if (error === 'no-speech' || error === 'speech-timeout') return { type: 'error', reason: 'noSpeech' };
  if (error === 'language-not-supported' || error === 'service-not-allowed') return { type: 'error', reason: 'unavailable' };
  return { type: 'error', reason: 'failed' };
};

export function createExpoSpeechInputAdapter(deps: Dependencies): SpeechInputAdapter {
  const { module, platform } = deps;
  let current: SpeechSession | undefined;
  const available = () => {
    try { return module.isRecognitionAvailable(); } catch { return false; }
  };
  return {
    get available() { return available(); },
    async getPermission() {
      const microphone = permissionState(await deps.getMicrophone());
      if (microphone !== 'granted' || platform !== 'ios') return microphone;
      return permissionState(await module.getSpeechRecognizerPermissionsAsync());
    },
    async requestPermission() {
      let microphone = await deps.getMicrophone();
      if (!microphone.granted && microphone.canAskAgain) microphone = await deps.requestMicrophone();
      const microphoneState = permissionState(microphone);
      if (microphoneState !== 'granted' || platform !== 'ios') return microphoneState;
      let speech = await module.getSpeechRecognizerPermissionsAsync();
      if (!speech.granted && speech.canAskAgain && !speech.restricted) speech = await module.requestSpeechRecognizerPermissionsAsync();
      return permissionState(speech);
    },
    createSession({ locale, signal, onEvent }) {
      let closed = false;
      let started = false;
      const subscriptions: Array<{ remove(): void }> = [];
      const removeListeners = () => { for (const subscription of subscriptions.splice(0)) subscription.remove(); };
      const cancel = () => {
        if (closed) return;
        closed = true;
        removeListeners();
        signal.removeEventListener('abort', cancel);
        if (current === session) current = undefined;
        if (started) { try { module.abort(); } catch { /* Native teardown failure cannot expose private data. */ } }
      };
      const emit = (event: SpeechEvent) => { if (!closed && !signal.aborted) onEvent(event); };
      const session: SpeechSession = {
        start() {
          if (closed || signal.aborted) return;
          current?.cancel();
          current = session;
          subscriptions.push(module.addListener('result', event => {
            const text = event.results[0]?.transcript ?? '';
            if (event.isFinal) emit(text.trim() ? { type: 'final', text } : { type: 'error', reason: 'noSpeech' });
            else if (text) emit({ type: 'partial', text });
          }));
          subscriptions.push(module.addListener('error', event => {
            if (event.error !== 'aborted') emit(failure(event.error));
          }));
          subscriptions.push(module.addListener('end', () => emit({ type: 'error', reason: 'noSpeech' })));
          signal.addEventListener('abort', cancel, { once: true });
          if (signal.aborted || closed) { cancel(); return; }
          started = true;
          try {
            module.start({ lang: locale, interimResults: true, maxAlternatives: 1, continuous: false,
              requiresOnDeviceRecognition: false, recordingOptions: { persist: false } });
          } catch (error) { cancel(); throw error; }
        },
        stop() {
          if (closed || !started || signal.aborted) return;
          module.stop();
        },
        cancel,
      };
      return session;
    },
  };
}

function nativeModule(): SpeechModule | null {
  try {
    // A development/native build includes this module; Expo Go and tests may not.
    return require('expo-speech-recognition').ExpoSpeechRecognitionModule as SpeechModule;
  } catch { return null; }
}

const module = nativeModule();
export const expoSpeechInputAdapter: SpeechInputAdapter = module && (Platform.OS === 'ios' || Platform.OS === 'android')
  ? createExpoSpeechInputAdapter({ platform: Platform.OS, module,
    getMicrophone: getRecordingPermissionsAsync, requestMicrophone: requestRecordingPermissionsAsync })
  : { available: false, getPermission: async () => 'undetermined', requestPermission: async () => 'undetermined',
    createSession: () => { throw new Error('STT_UNAVAILABLE'); } };
