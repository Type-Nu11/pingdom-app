import type { components } from '../../../generated/scoutProfile';

type ScoutProfileResponse = components['schemas']['ScoutProfileResponse'];

/** Synthetic values conforming to the live Scout profile contract. */
export const scoutProfileFixture = {
  activityEligibilityStatus: 'ELIGIBLE',
  createdAt: '2026-08-20T01:00:00Z',
  displayName: 'Seoul Scout',
  eligibilityReviewedAt: '2026-08-21T03:30:00Z',
  eligibilityReviewedByAdminUserId: 901,
  eligibilityStatusReason: null,
  eligibleFrom: '2026-08-21T03:30:00Z',
  eligibleUntil: null,
  introduction: 'I share verified neighborhood updates.',
  profileReviewedAt: '2026-08-21T03:00:00Z',
  profileReviewedByAdminUserId: 901,
  profileStatus: 'ACTIVE',
  profileStatusReason: null,
  updatedAt: '2026-08-21T03:30:00Z',
  userId: 169,
} satisfies ScoutProfileResponse;

export const pendingScoutProfileFixture = {
  ...scoutProfileFixture,
  activityEligibilityStatus: 'PENDING',
  eligibilityReviewedAt: null,
  eligibilityReviewedByAdminUserId: null,
  eligibleFrom: null,
  eligibleUntil: null,
  introduction: null,
  profileReviewedAt: null,
  profileReviewedByAdminUserId: null,
  profileStatus: 'PENDING',
} satisfies ScoutProfileResponse;
