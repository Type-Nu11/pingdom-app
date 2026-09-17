import type { components } from '../../../../shared/api/generated/voiceAi';
import type { ProviderEnvelope } from '../voiceAssistantCommand.types';

type Assert<T extends true> = T;
type WireEnvelope = components['schemas']['ProviderEnvelopeV1'];
// Runtime remains the trust boundary; these catch structural drift in either direction.
export type AppEnvelopeMatchesServer = Assert<ProviderEnvelope extends WireEnvelope ? true : false>;
export type ServerEnvelopeMatchesApp = Assert<WireEnvelope extends ProviderEnvelope ? true : false>;
