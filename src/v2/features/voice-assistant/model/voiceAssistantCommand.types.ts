import type { PlaceDetail } from '../../place-detail';
import type { AvailabilityList } from '../../reservations';

export const VOICE_SCHEMA_VERSION = 1 as const;
// Current create screen offers 1..12; OpenAPI specifies minimum 1, no maximum.
export const VOICE_QUANTITY_LIMITS = Object.freeze({ min: 1, max: 12 });

export type VoiceTouristCategory = PlaceDetail['touristCategories'][number];
/** Calendar date YYYY-MM-DD (0001..9999), interpreted in app session timezone. */
export type VoiceLocalDate = string;
/** Local wall-clock HH:mm; parser enforces a nonempty same-day window. */
export type VoiceLocalTime = string;

export type VoiceAssistantCommand =
  | Readonly<{ command: 'searchNearbyReservablePlaces'; args: Readonly<{
    touristCategory?: VoiceTouristCategory;
    date: VoiceLocalDate;
    startTime: VoiceLocalTime;
    endTime: VoiceLocalTime;
    quantity: number;
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

/** Prose is untrusted display content, never proof of execution or a tool input. */
export type ProviderEnvelope = CommandRequest
  | (EnvelopeBase & Readonly<{ kind: 'clarification_request'; field: ClarificationField; text: string }>)
  | (EnvelopeBase & Readonly<{ kind: 'assistant_message'; text: string }>)
  | (EnvelopeBase & Readonly<{ kind: 'protocol_error'; code: ProtocolErrorCode }>);

/** Explicit projections only: do not send entire server DTOs back to the gateway. */
export type VoicePlaceFacts = Readonly<Pick<PlaceDetail, 'id' | 'name' | 'address' | 'touristCategories' | 'operatingStatus'>>;
export type VoiceAvailabilityFacts = Readonly<Pick<AvailabilityList[number],
  'id' | 'placeId' | 'productId' | 'productType' | 'productName' | 'startsAt' | 'endsAt' | 'remainingCapacity' | 'status'>>;
export type ReservationDraft = Readonly<{
  status: 'awaiting_user_confirmation';
  place: VoicePlaceFacts;
  availability: VoiceAvailabilityFacts & Readonly<{ productType: 'GENERAL'; productId: null; productName: null }>;
  quantity: number;
}>;
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
/** Only the app executor constructs these. Never accepted by the provider parser. */
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
export type VoiceEnvelopeParseResult =
  | Readonly<{ ok: true; value: ProviderEnvelope }>
  | Readonly<{ ok: false; rejection: Readonly<{ code: VoiceParserRejectionCode; path: string }>;
    userMessageKey: 'voiceAssistant.invalidResponse' }>;
