// App/Place assistant composition; parsing, policies and lifecycle stay internal.
export { default as VoiceCommandScreen } from './screens/VoiceCommandScreen';
export { default as VoiceAssistantScreen } from './screens/VoiceAssistantScreen';
export type { VoiceCommandContext } from './hooks/useVoiceCommands';

export type { VoiceNavigationTarget } from './model/voiceAssistantCommand.types';
export { WakeWordProvider } from './wake-word/WakeWordProvider';
export { WakeWordControl } from './wake-word/WakeWordControl';
export { useForegroundWakeWord } from './wake-word/useForegroundWakeWord';
export { createLocalWakeWordAdapter } from './wake-word/localWakeWordAdapter';
export type { LocalWakeWordRuntime, LocalKeywordDetector } from './wake-word/localWakeWordAdapter';
export type { WakeWordAdapter } from './wake-word/wakeWord';
export { useSherpaWakeWordAdapter } from './wake-word/useSherpaWakeWordAdapter';
