/**
 * 읽는 순서: command.types(입출력 계약) → CommandParser(외부 입력 검증) → CommandPolicy(실행 전제조건).
 * 후속 feature는 이 공개 경계만 import합니다. 입력 UI는 #346, 세션 transport는 #347, read Registry/dispatcher는 #348 소유입니다. 예약 초안은 #349에서 연결합니다.
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
export type { VoiceSessionApi, VoiceSessionDto, VoiceMessageRequest, VoiceProviderEnvelopeDto } from './api/voiceSessionApi';
export { createVoiceSessionController } from './model/voiceSession';
export type { VoiceSessionController, VoiceSessionState, VoiceEnvelopeConsumer, VoiceDeliveryContext } from './model/voiceSession';
export { VoiceSessionError } from './model/voiceSessionError';
export type { VoiceSessionErrorCode } from './model/voiceSessionError';
export { useVoiceSession } from './hooks/useVoiceSession';

export { VOICE_COMMAND_REGISTRY, createVoiceCommandDispatcher } from './model/voiceCommands';
export type { VoiceCommandHandler, VoiceCommandRuntime } from './model/voiceCommands';
export { default as VoiceCommandScreen } from './screens/VoiceCommandScreen';
export type { VoiceCommandContext, VoiceCommandViewState } from './hooks/useVoiceCommands';
