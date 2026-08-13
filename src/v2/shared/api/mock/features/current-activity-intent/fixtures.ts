import type { components } from '../../../generated/account';

type ExportCurrentActivityIntent = NonNullable<
  components['schemas']['ExportCurrentActivityIntentResponse']
>;
type CurrentActivityIntent = {
  expiresAt?: ExportCurrentActivityIntent['expiresAt'] | null;
  intent?: ExportCurrentActivityIntent['intent'] | null;
};

export const currentActivityIntentFixture = {
  expiresAt: '2026-08-13T18:00:00Z',
  intent: 'CAFE',
} satisfies CurrentActivityIntent;

export const emptyCurrentActivityIntentFixture = {
  expiresAt: null,
  intent: null,
} satisfies CurrentActivityIntent;
