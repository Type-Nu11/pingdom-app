import type { QueryKey } from '@tanstack/react-query';
import type { VoiceAvailabilityFacts } from './voiceAssistantCommand.types';

export const VOICE_PROVENANCE_MAX_AGE = 30000;
export type VoiceProvenanceScope = Readonly<{
  sessionId: string; epoch: symbol; generation: number; accountRevision: string; contextRevision: number; conditionRevision: number;
}>;
export type VoicePlaceProvenance = VoiceProvenanceScope & Readonly<{
  placeIds: readonly number[]; queryKey: QueryKey; dataUpdatedAt: number; observedAt: number;
}>;
export type VoiceAvailabilityProvenance = VoicePlaceProvenance & Readonly<{
  placeId: number; date: string; quantity: number; availabilityIds: readonly number[]; slots: readonly VoiceAvailabilityFacts[];
}>;
export function createVoiceProvenance(monotonic: () => number) {
  let places: VoicePlaceProvenance | undefined;
  const verified = new Map<number, VoicePlaceProvenance>();
  let availability: VoiceAvailabilityProvenance | undefined;
  return {
    places: () => places,
    place: (placeId: number) => verified.get(placeId) ?? (places?.placeIds.includes(placeId) ? places : undefined),
    recordVerifiedPlace(value: VoicePlaceProvenance) {
      value.placeIds.forEach(placeId => verified.set(placeId, Object.freeze(value)));
    },
    availability: () => {
      if (availability && (monotonic() - availability.observedAt >= VOICE_PROVENANCE_MAX_AGE || monotonic() < availability.observedAt)) availability = undefined;
      return availability;
    },
    recordPlaces(value: VoicePlaceProvenance) { places = Object.freeze(value); verified.clear(); availability = undefined; },
    recordAvailability(value: VoiceAvailabilityProvenance) { availability = Object.freeze(value); },
    clearAvailability() { availability = undefined; },
    clear() { places = undefined; verified.clear(); availability = undefined; },
  };
}
