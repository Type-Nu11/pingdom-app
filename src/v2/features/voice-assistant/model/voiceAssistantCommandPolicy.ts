import type { VoiceCommandName } from './voiceAssistantCommand.types';

type CommonPolicy = Readonly<{
  allowsMutation: false;
  requiresActiveSession: true;
  requiresReplayCheck: true;
  requiresCurrentGeneration: true;
  provenance: 'none' | 'recentSearchOrUserSelection' | 'recentAvailabilityForPlace';
}>;
export type VoiceCommandPolicy = CommonPolicy & (
  | Readonly<{ classification: 'READ'; automaticAction: 'query'; requiresUserConfirmation: false; requiresRuntimeLocation: boolean }>
  | Readonly<{ classification: 'PREPARE_WRITE'; automaticAction: 'draft'; requiresUserConfirmation: true; requiresFreshAvailability: true; allowedProductType: 'GENERAL' }>
  | Readonly<{ classification: 'SESSION_CONTROL'; automaticAction: 'stopSession'; requiresUserConfirmation: false }>
);
const common = {
  allowsMutation: false, requiresActiveSession: true, requiresReplayCheck: true, requiresCurrentGeneration: true,
} as const;

/** Normative permission table. Preconditions are obligations for #348/#349, not enforced by parsing. */
export const VOICE_COMMAND_POLICIES = Object.freeze({
  searchNearbyReservablePlaces: Object.freeze({ ...common, classification: 'READ', automaticAction: 'query', requiresUserConfirmation: false, requiresRuntimeLocation: true, provenance: 'none' } as const),
  getPlaceDetails: Object.freeze({ ...common, classification: 'READ', automaticAction: 'query', requiresUserConfirmation: false, requiresRuntimeLocation: false, provenance: 'recentSearchOrUserSelection' } as const),
  getAvailabilities: Object.freeze({ ...common, classification: 'READ', automaticAction: 'query', requiresUserConfirmation: false, requiresRuntimeLocation: false, provenance: 'recentSearchOrUserSelection' } as const),
  prepareReservation: Object.freeze({ ...common, classification: 'PREPARE_WRITE', automaticAction: 'draft', requiresUserConfirmation: true, requiresFreshAvailability: true, allowedProductType: 'GENERAL', provenance: 'recentAvailabilityForPlace' } as const),
  cancelVoiceSession: Object.freeze({ ...common, classification: 'SESSION_CONTROL', automaticAction: 'stopSession', requiresUserConfirmation: false, provenance: 'none' } as const),
} satisfies Record<VoiceCommandName, VoiceCommandPolicy>);
