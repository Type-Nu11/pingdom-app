import type { VisitVerificationSchema } from '../../../visitVerificationContract';

export type VisitVerificationSessionFixture = VisitVerificationSchema<'VisitVerificationSessionResponse'>;

const baseSession: VisitVerificationSessionFixture = {
  id: 9201,
  touristUserId: 101,
  placeId: 17,
  status: 'STARTED',
  startedAt: '2026-09-02T01:00:00Z',
  expiresAt: '2026-09-02T01:05:00Z',
  completedAt: null,
  requiredRadiusMeters: 24,
  requiredDwellSeconds: 75,
  latestDistanceMeters: 8.4,
  verifiedDwellSeconds: 0,
  nextObservationRecommendedAt: '2026-09-02T01:00:15Z',
  remainingSeconds: 75,
  completedCheckInId: null,
  reviewEligible: false,
};

export const visitVerificationStartedFixture = baseSession;
export const visitVerificationExistingFixture: VisitVerificationSessionFixture = {
  ...baseSession,
  status: 'IN_PROGRESS',
  verifiedDwellSeconds: 30,
  remainingSeconds: 45,
};
export const visitVerificationProgressFixture: VisitVerificationSessionFixture = {
  ...baseSession,
  status: 'IN_PROGRESS',
  verifiedDwellSeconds: 60,
  remainingSeconds: 15,
  nextObservationRecommendedAt: '2026-09-02T01:01:15Z',
};
export const visitVerificationCompletedFixture: VisitVerificationSessionFixture = {
  ...baseSession,
  status: 'COMPLETED',
  verifiedDwellSeconds: 75,
  remainingSeconds: 0,
  nextObservationRecommendedAt: null,
  completedAt: '2026-09-02T01:01:15Z',
  completedCheckInId: 7002,
  reviewEligible: true,
};
export const visitVerificationProximityLostFixture: VisitVerificationSessionFixture = {
  ...baseSession,
  status: 'PROXIMITY_LOST',
  latestDistanceMeters: 31,
  nextObservationRecommendedAt: null,
};
export const visitVerificationExpiredFixture: VisitVerificationSessionFixture = {
  ...baseSession,
  status: 'EXPIRED',
  nextObservationRecommendedAt: null,
};
export const visitVerificationRejectedFixture: VisitVerificationSessionFixture = {
  ...baseSession,
  status: 'REJECTED',
  nextObservationRecommendedAt: null,
};
