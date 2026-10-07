import type { components } from '../../../../shared/api/generated/voiceAi';
import type { ProviderEnvelope } from '../voiceAssistantCommand.types';

type Assert<T extends true> = T;
type WireEnvelope = components['schemas']['ProviderEnvelopeV1'];
// searchNearbyPlaces is the explicit coordinated extension in docs/patches/voice-ai-general-nearby.patch.
// Keep the fetched server types intact until deployment; all existing envelopes must still match exactly.
type PendingGeneralSearch = Extract<ProviderEnvelope, { command: 'searchNearbyPlaces' }>;
type DeployedAppEnvelope = Exclude<ProviderEnvelope, PendingGeneralSearch>;
// Runtime remains the trust boundary; these catch structural drift in either direction.
export type AppEnvelopeMatchesServer = Assert<DeployedAppEnvelope extends WireEnvelope ? true : false>;
export type ServerEnvelopeMatchesApp = Assert<WireEnvelope extends ProviderEnvelope ? true : false>;
export type GeneralSearchRequiresServerDeployment = Assert<PendingGeneralSearch extends WireEnvelope ? false : true>;
