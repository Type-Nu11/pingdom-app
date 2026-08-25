import { ApiError } from '../../../shared/api';
import type {
  ScoutActivityEligibilityStatus,
  ScoutProfileErrorCode,
} from './scoutProfile.types';

export function isScoutActivityEligible(
  status: ScoutActivityEligibilityStatus,
): boolean {
  return status === 'ELIGIBLE';
}

export function isScoutProfileApiError(
  error: unknown,
  code: ScoutProfileErrorCode,
): error is ApiError {
  return error instanceof ApiError && error.code === code;
}

export function isScoutProfileNotFoundError(error: unknown): error is ApiError {
  return isScoutProfileApiError(error, 'SCOUT_PROFILE_NOT_FOUND');
}
