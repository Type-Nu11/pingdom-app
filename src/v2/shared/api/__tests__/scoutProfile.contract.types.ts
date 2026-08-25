import type {
  ScoutProfile,
  ScoutProfileRequest,
} from '../../../features/scout-profile/model/scoutProfile.types';

const requestWithoutOptionalIntroduction = {
  displayName: 'Scout',
} satisfies ScoutProfileRequest;

const nullableResponseFields = {
  activityEligibilityStatus: 'PENDING',
  createdAt: '2026-08-20T01:00:00Z',
  displayName: requestWithoutOptionalIntroduction.displayName,
  eligibilityReviewedAt: null,
  eligibilityReviewedByAdminUserId: null,
  eligibilityStatusReason: null,
  eligibleFrom: null,
  eligibleUntil: null,
  introduction: null,
  profileReviewedAt: null,
  profileReviewedByAdminUserId: null,
  profileStatus: 'PENDING',
  profileStatusReason: null,
  updatedAt: '2026-08-20T01:00:00Z',
  userId: 169,
} satisfies ScoutProfile;

export type ScoutProfileContractTypeAssertions =
  | typeof requestWithoutOptionalIntroduction
  | typeof nullableResponseFields;
