import type { VisitVerificationSession } from '../api/visitVerificationApi';
import { ApiError } from '../../../shared/api/ApiError';

export const visitVerificationSessionQueryKeys = {
  all: ['v2', 'visit-verification-sessions'] as const,
  detail: (sessionId: number) => [
    ...visitVerificationSessionQueryKeys.all,
    'detail',
    sessionId,
  ] as const,
};

export const TERMINAL_VISIT_VERIFICATION_STATUSES = [
  'PROXIMITY_LOST',
  'COMPLETED',
  'EXPIRED',
  'REJECTED',
] as const;

export function isTerminalVisitVerificationSession(session: VisitVerificationSession): boolean {
  return TERMINAL_VISIT_VERIFICATION_STATUSES.includes(
    session.status as (typeof TERMINAL_VISIT_VERIFICATION_STATUSES)[number],
  );
}

export function observationDelayMs(
  nextObservationRecommendedAt: string | null | undefined,
  nowMs: number,
): number | null {
  if (!nextObservationRecommendedAt) return null;
  const recommendedAt = Date.parse(nextObservationRecommendedAt);
  if (!Number.isFinite(recommendedAt)) return null;
  return Math.max(0, recommendedAt - nowMs);
}

export function sessionErrorPhase(error: unknown): 'error' | 'location-failed' | 'proximity-lost' | 'rejected' {
  if (error instanceof ApiError) {
    if (error.status === 400) return 'location-failed';
    if (error.status === 422) return 'proximity-lost';
    if (error.status === 403) return 'rejected';
  }
  return 'error';
}
