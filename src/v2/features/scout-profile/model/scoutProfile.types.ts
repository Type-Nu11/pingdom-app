import type { components, operations } from '../../../shared/api/generated/scoutProfile';

export type ScoutProfile =
  operations['get']['responses'][200]['content']['*/*'];
export type ScoutProfileRequest =
  operations['apply']['requestBody']['content']['application/json'];
export type ScoutProfileErrorResponse = components['schemas']['ErrorResponse'];

export type ScoutProfileStatus = ScoutProfile['profileStatus'];
export type ScoutActivityEligibilityStatus = ScoutProfile['activityEligibilityStatus'];

export const SCOUT_PROFILE_STATUS_VALUES = [
  'PENDING',
  'ACTIVE',
  'SUSPENDED',
  'REVOKED',
] as const satisfies readonly ScoutProfileStatus[];

export const SCOUT_ACTIVITY_ELIGIBILITY_STATUS_VALUES = [
  'PENDING',
  'ELIGIBLE',
  'SUSPENDED',
  'EXPIRED',
  'REVOKED',
] as const satisfies readonly ScoutActivityEligibilityStatus[];

export const SCOUT_PROFILE_ERROR_CODES = [
  'SCOUT_PROFILE_NOT_FOUND',
  'SCOUT_PROFILE_ACCOUNT_REQUIRED',
  'SCOUT_PROFILE_ALREADY_EXISTS',
  'INVALID_SCOUT_PROFILE_STATE',
] as const;

export type ScoutProfileErrorCode = (typeof SCOUT_PROFILE_ERROR_CODES)[number];

type AssertNever<Value extends never> = Value;
type AllProfileStatusesAreListed = AssertNever<
  Exclude<ScoutProfileStatus, (typeof SCOUT_PROFILE_STATUS_VALUES)[number]>
>;
type AllEligibilityStatusesAreListed = AssertNever<
  Exclude<
    ScoutActivityEligibilityStatus,
    (typeof SCOUT_ACTIVITY_ELIGIBILITY_STATUS_VALUES)[number]
  >
>;

export type ScoutProfileContractAssertion =
  | AllProfileStatusesAreListed
  | AllEligibilityStatusesAreListed;
