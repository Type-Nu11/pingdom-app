// 기존 feature의 공개 타입만 참조합니다. 타입 전용 import이므로 화면/API를 런타임에 불러오지 않습니다.
import type { PlaceDetail } from '../../../modules/place/detail';
import type { AvailabilityList } from '../../reservations';

export const VOICE_SCHEMA_VERSION = 1 as const;
// 서버 계약은 최소 1명만 규정합니다. 최대 12명은 현재 예약 화면의 선택 범위에 맞춘 앱 정책입니다.
export const VOICE_QUANTITY_LIMITS = Object.freeze({ min: 1, max: 12 });

export type VoiceTouristCategory = PlaceDetail['touristCategories'][number];
/** YYYY-MM-DD(0001~9999년). string 타입만으로는 날짜를 보장하지 않으므로 parser 검증이 필요합니다. */
export type VoiceLocalDate = string;
/** 앱 세션 timezone 기준 HH:mm. 같은 날의 시작 < 종료 조건은 parser가 검사합니다. */
export type VoiceLocalTime = string;

/**
 * command 값을 좁히면 TypeScript가 해당 args도 함께 좁히는 discriminated union입니다.
 * 외부 입력을 이 타입으로 단언하지 말고 반드시 parseVoiceAssistantEnvelope를 통과시킵니다.
 * 좌표·예약자 정보·확인 여부는 AI가 결정할 수 없으므로 입력 필드 자체를 두지 않습니다.
 */
export type VoiceAssistantCommand =
  | Readonly<{ command: 'searchNearbyReservablePlaces'; args: Readonly<{
    touristCategory?: VoiceTouristCategory;
    date: VoiceLocalDate;
    startTime: VoiceLocalTime;
    endTime: VoiceLocalTime;
    quantity: number;
    // true도 OS 위치 권한을 대신하지 않습니다. false이면 executor가 추가 질문을 해야 합니다.
    useCurrentLocation: boolean;
  }> }>
  | Readonly<{ command: 'getPlaceDetails'; args: Readonly<{ placeId: number }> }>
  | Readonly<{ command: 'getAvailabilities'; args: Readonly<{
    placeId: number; date: VoiceLocalDate; quantity: number;
  }> }>
  | Readonly<{ command: 'prepareReservation'; args: Readonly<{
    placeId: number; availabilityId: number; quantity: number;
  }> }>
  | Readonly<{ command: 'cancelVoiceSession'; args: Readonly<Record<string, never>> }>;

export type VoiceCommandName = VoiceAssistantCommand['command'];
type EnvelopeBase = Readonly<{ schemaVersion: typeof VOICE_SCHEMA_VERSION; id: string }>;
export type CommandRequest = EnvelopeBase & Readonly<{ kind: 'command_request' }> & VoiceAssistantCommand;
export type ClarificationField = 'touristCategory' | 'date' | 'timeRange' | 'quantity' | 'useCurrentLocation' | 'placeId' | 'availabilityId';
export type ProtocolErrorCode = 'UNSUPPORTED_REQUEST' | 'PROVIDER_UNAVAILABLE' | 'INVALID_RESPONSE';

/**
 * 외부 AI가 보낼 수 있는 메시지 종류입니다. 앱 실행 결과는 이 union에 포함하지 않습니다.
 * text가 “예약 성공”이라고 주장해도 실행 증거가 아니며, 명령이나 성공 UI로 변환하면 안 됩니다.
 */
export type ProviderEnvelope = CommandRequest
  | (EnvelopeBase & Readonly<{ kind: 'clarification_request'; field: ClarificationField; text: string }>)
  | (EnvelopeBase & Readonly<{ kind: 'assistant_message'; text: string }>)
  | (EnvelopeBase & Readonly<{ kind: 'protocol_error'; code: ProtocolErrorCode }>);

/** 서버 DTO 전체 대신 허용한 필드만 투영합니다. 서버 필드 변경은 Pick의 타입 검사로 감지합니다. */
export type VoicePlaceFacts = Readonly<Pick<PlaceDetail, 'id' | 'name' | 'address' | 'touristCategories' | 'operatingStatus'>>;
export type VoiceAvailabilityFacts = Readonly<Pick<AvailabilityList[number],
  'id' | 'placeId' | 'productId' | 'productType' | 'productName' | 'startsAt' | 'endsAt' | 'remainingCapacity' | 'status'>>;
/**
 * 예약 요청 body가 아닌 확인 대기용 정보입니다. 기존 앱 정책에 맞춰 GENERAL만 허용합니다.
 * executor가 서버에서 다시 확인한 값으로 만들며, 개인정보와 idempotency key는 포함하지 않습니다.
 */
export type ReservationDraft = Readonly<{
  status: 'awaiting_user_confirmation';
  place: VoicePlaceFacts;
  availability: VoiceAvailabilityFacts & Readonly<{ productType: 'GENERAL'; productId: null; productName: null }>;
  quantity: number;
}>;
/** 명령별 성공 데이터. prepareReservation의 성공은 초안 준비이며 예약 생성 성공이 아닙니다. */
export type VoiceCommandOutput = {
  searchNearbyReservablePlaces: Readonly<{ places: readonly VoicePlaceFacts[]; coverage: 'bounded_candidates' }>;
  getPlaceDetails: Readonly<{ place: VoicePlaceFacts }>;
  getAvailabilities: Readonly<{ placeId: number; date: VoiceLocalDate; availabilities: readonly VoiceAvailabilityFacts[] }>;
  prepareReservation: Readonly<{ draft: ReservationDraft }>;
  cancelVoiceSession: Readonly<{ sessionStopped: true }>;
};
export type CommandFailureCode = 'LOCATION_REQUIRED' | 'ID_NOT_IN_CONTEXT' | 'STALE_CONTEXT'
  | 'AVAILABILITY_UNAVAILABLE' | 'UNSUPPORTED_PRODUCT' | 'REPLAY_CONFLICT'
  | 'CANCELED' | 'TIMEOUT' | 'AUTHENTICATION_REQUIRED' | 'FORBIDDEN'
  | 'RATE_LIMITED' | 'NOT_FOUND' | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'INVALID_SERVER_RESPONSE';
/**
 * 앱 executor만 생성하는 결과입니다. source 문자열 자체는 인증 수단이 아니며 provider parser는 거부합니다.
 * mapped type으로 각 command와 그 성공 data를 묶어 다른 명령의 결과를 섞지 못하게 합니다.
 * id는 결과 메시지 ID, commandId는 원래 요청의 ID입니다.
 */
export type AppCommandResult = {
  [Name in VoiceCommandName]: EnvelopeBase & Readonly<{
    kind: 'command_result'; source: 'app'; commandId: string; command: Name;
    outcome:
      | Readonly<{ status: 'succeeded'; data: VoiceCommandOutput[Name] }>
      | Readonly<{ status: 'rejected'; code: CommandFailureCode }>
      | Readonly<{ status: 'clarification_required'; field: ClarificationField }>;
  }>
}[VoiceCommandName];

export type VoiceParserRejectionCode = 'INVALID_OBJECT' | 'UNEXPECTED_FIELD' | 'MISSING_FIELD'
  | 'UNSUPPORTED_VERSION' | 'INVALID_MESSAGE_ID' | 'UNKNOWN_KIND' | 'UNKNOWN_COMMAND'
  | 'INVALID_ID' | 'INVALID_QUANTITY' | 'INVALID_DATE' | 'INVALID_TIME'
  | 'INVALID_TIME_RANGE' | 'INVALID_FIELD' | 'UNREADABLE_INPUT';
/** 내부 진단(code/path)과 사용자용 i18n key를 분리합니다. 거부 사유에 원본 입력값은 넣지 않습니다. */
export type VoiceEnvelopeParseResult =
  | Readonly<{ ok: true; value: ProviderEnvelope }>
  | Readonly<{ ok: false; rejection: Readonly<{ code: VoiceParserRejectionCode; path: string }>;
    userMessageKey: 'voiceAssistant.invalidResponse' }>;
