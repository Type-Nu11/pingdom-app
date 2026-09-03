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

let activeForegroundSession: VisitVerificationSession | null = null;
const foregroundSessionClearListeners = new Set<() => void>();

export function getActiveForegroundVisitVerificationSession() {
  return activeForegroundSession;
}

export function rememberActiveForegroundVisitVerificationSession(
  session: VisitVerificationSession,
) {
  activeForegroundSession = isTerminalVisitVerificationSession(session) ? null : session;
}

export function clearActiveForegroundVisitVerificationSession() {
  activeForegroundSession = null;
  foregroundSessionClearListeners.forEach((listener) => listener());
}

export function subscribeActiveForegroundVisitVerificationSessionClear(
  listener: () => void,
) {
  foregroundSessionClearListeners.add(listener);
  return () => {
    foregroundSessionClearListeners.delete(listener);
  };
}

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

export type VisitVerificationErrorPhase =
  | 'ambiguous-place'
  | 'error'
  | 'inactive-tourist'
  | 'invalid-observation'
  | 'network-error'
  | 'no-place'
  | 'proximity-lost'
  | 'unauthenticated';

export function sessionErrorPhase(error: unknown): VisitVerificationErrorPhase {
  if (error instanceof ApiError) {
    if (error.isNetworkError) return 'network-error';
    if (error.status === 400) return 'invalid-observation';
    if (error.status === 401) return 'unauthenticated';
    if (error.status === 403) return 'inactive-tourist';
    if (error.status === 404) return 'no-place';
    if (error.status === 409) return 'ambiguous-place';
    if (error.status === 422) return 'proximity-lost';
  }
  return 'error';
}
