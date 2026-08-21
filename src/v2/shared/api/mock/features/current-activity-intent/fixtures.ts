import type { components } from '../../../generated/currentActivityIntent';

type CurrentActivityIntentResponse =
  components['schemas']['CurrentActivityIntentResponse'];

/** Synthetic values only. */
export const currentActivityIntentFixture = {
  expiresAt: '2026-08-11T14:00:00Z',
  intent: 'CAFE',
} satisfies CurrentActivityIntentResponse;

export const emptyCurrentActivityIntentFixture = {
  expiresAt: null,
  intent: null,
} satisfies CurrentActivityIntentResponse;
