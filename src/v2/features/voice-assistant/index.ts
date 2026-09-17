/**
 * 읽는 순서: command.types(입출력 계약) → CommandParser(외부 입력 검증) → CommandPolicy(실행 전제조건).
 * 후속 feature는 이 공개 경계만 import합니다. 입력 UI와 로컬 STT 경계는 #346에서 제공하며 router/API는 후속 이슈 소유입니다.
 */
export { VOICE_QUANTITY_LIMITS, VOICE_SCHEMA_VERSION } from './model/voiceAssistantCommand.types';
export type {
  AppCommandResult, ClarificationField, CommandFailureCode, CommandRequest,
  ProtocolErrorCode, ProviderEnvelope, ReservationDraft, VoiceAssistantCommand,
  VoiceAvailabilityFacts, VoiceCommandName, VoiceCommandOutput, VoiceEnvelopeParseResult,
  VoiceLocalDate, VoiceLocalTime, VoiceParserRejectionCode, VoicePlaceFacts, VoiceTouristCategory,
} from './model/voiceAssistantCommand.types';
export { parseVoiceAssistantEnvelope } from './model/voiceAssistantCommandParser';
export { VOICE_COMMAND_POLICIES } from './model/voiceAssistantCommandPolicy';
export type { VoiceCommandPolicy } from './model/voiceAssistantCommandPolicy';

export { default as VoiceAssistantScreen } from './screens/VoiceAssistantScreen';
export type { VoiceAssistantScreenProps } from './screens/VoiceAssistantScreen';
export { createVoiceInputController, validateVoiceInput, unavailableSpeechAdapter, retainInputLocally } from './model/voiceInput';
export type { FinalInput, OnFinalInput, SpeechInputAdapter, SpeechSession, SpeechEvent, VoiceInputPhase, MicrophonePermission } from './model/voiceInput';

export { createVoiceSessionApi } from './api/voiceSessionApi';
export type { VoiceSessionApi, VoiceSessionDto, VoiceMessageRequest } from './api/voiceSessionApi';
export { createVoiceSessionController } from './model/voiceSession';
export type { VoiceSessionController, VoiceSessionState, VoiceEnvelopeConsumer, VoiceDeliveryContext } from './model/voiceSession';
export { VoiceSessionError } from './model/voiceSessionError';
export type { VoiceSessionErrorCode } from './model/voiceSessionError';
export { useVoiceSession } from './hooks/useVoiceSession';
