import type { ApiSchema } from '../../../shared/api/contract';
import { trustFixture } from '../../../shared/api/mock/fixtures';

/**
 * Presentation-only projection until a merchant performance endpoint is added
 * to mvp.openapi.json. Values are synthetic aggregates of ConversionEventName.
 */
export type MerchantPerformanceFixture = {
  placeId: number;
  period: { from: string; to: string };
  metrics: {
    impressions: number;
    cardClicks: number;
    couponSaves: number;
    navigationStarts: number;
    reservationCreates: number;
    completedCheckIns: number;
  };
  trustScore: ApiSchema<'TrustSummary'>;
};

export const merchantPerformanceFixture = {
  placeId: 17,
  period: { from: '2026-07-17', to: '2026-07-23' },
  metrics: {
    impressions: 1240,
    cardClicks: 286,
    couponSaves: 74,
    navigationStarts: 53,
    reservationCreates: 18,
    completedCheckIns: 31,
  },
  trustScore: trustFixture,
} satisfies MerchantPerformanceFixture;
