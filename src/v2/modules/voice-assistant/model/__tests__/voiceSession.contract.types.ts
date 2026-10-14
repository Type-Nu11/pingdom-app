import type { components } from '../../../../shared/api/generated/voiceAi';
import type { ProviderEnvelope } from '../voiceAssistantCommand.types';

type Assert<T extends true> = T;
type WireEnvelope = components['schemas']['ProviderEnvelopeV1'];
// App-owned chat tools extend the historical /voice-ai envelope; retain its fetched server snapshot.
// Keep the fetched server types intact until deployment; all existing envelopes must still match exactly.
type PendingAppCommands = Extract<ProviderEnvelope, { command: 'searchNearbyPlaces' | 'navigateToPage' }>;
type DeployedAppEnvelope = Exclude<ProviderEnvelope, PendingAppCommands>;
// Runtime remains the trust boundary; these catch structural drift in either direction.
export type AppEnvelopeMatchesServer = Assert<DeployedAppEnvelope extends WireEnvelope ? true : false>;
export type ServerEnvelopeMatchesApp = Assert<WireEnvelope extends ProviderEnvelope ? true : false>;
export type GeneralSearchRequiresServerDeployment = Assert<Extract<ProviderEnvelope, { command: 'searchNearbyPlaces' }> extends WireEnvelope ? false : true>;

export type NavigationIsAnAppChatExtension = Assert<Extract<ProviderEnvelope, { command: 'navigateToPage' }> extends WireEnvelope ? false : true>;
