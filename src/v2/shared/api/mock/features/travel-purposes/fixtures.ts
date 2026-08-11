import type { ApiSchema } from '../../../contract';

/** Synthetic values only. Keep this fixture free of user-derived preference data. */
export const travelPurposePreferenceFixture = {
  travelPurposes: ['K_POP', 'CAFE'],
} satisfies ApiSchema<'TravelPurposePreferenceResponse'>;
