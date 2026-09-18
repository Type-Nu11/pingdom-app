import type { ApiSchema } from '../../../api/contract';

export const conversionBatchResultFixture = {
  acceptedAt: '2026-07-23T05:30:02Z',
  results: [
    {
      eventId: '00000000-0000-4000-8000-000000000001',
      status: 'ACCEPTED',
      code: null,
    },
  ],
} satisfies ApiSchema<'ConversionEventBatchResult'>;
