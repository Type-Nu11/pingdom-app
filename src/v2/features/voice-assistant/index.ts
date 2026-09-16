/**
 * 읽는 순서: command.types(입출력 계약) → CommandParser(외부 입력 검증) → CommandPolicy(실행 전제조건).
 * 후속 feature는 이 공개 경계만 import합니다. 실제 router/API/UI는 이번 SPIKE에 포함하지 않습니다.
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
