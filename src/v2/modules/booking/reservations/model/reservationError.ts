import { getApiErrorUx, toApiError } from '../../../../shared/api';

const SUBMIT_ERROR_KEYS: Partial<Record<ReturnType<typeof getApiErrorUx>['kind'], string>> = {
  authentication: 'common.apiError.authentication.description',
  authorization: 'common.apiError.authorization.description',
  rateLimited: 'common.apiError.rateLimited.description',
  conflict: 'common.apiError.conflict.description',
  network: 'reservation.create.submitNetworkError',
  timeout: 'reservation.create.submitNetworkError',
  server: 'reservation.create.submitNetworkError',
  outOfRange: 'reservation.create.submitConflict',
  validation: 'reservation.create.submitValidationError',
};

export function reservationSubmitErrorKey(error: unknown): string {
  const apiError = toApiError(error);
  if (apiError.code === 'CAPACITY_EXCEEDED') return 'reservation.create.submitConflict';
  if (apiError.code === 'AVAILABILITY_CAPACITY_EXCEEDED') {
    return 'reservation.create.submitCapacityError';
  }
  if (apiError.code === 'AVAILABILITY_NOT_FOUND' || apiError.code === 'RESOURCE_EXPIRED') {
    return 'reservation.create.submitAvailabilityError';
  }
  if (apiError.code === 'INVALID_RESERVATION_INPUT'
    || apiError.code === 'VALIDATION_FAILED') {
    return 'reservation.create.submitValidationError';
  }
  if (apiError.code === 'TOURIST_ACCOUNT_REQUIRED' || apiError.status === 403) {
    return 'reservation.create.submitAccountError';
  }
  return SUBMIT_ERROR_KEYS[getApiErrorUx(error).kind]
    ?? 'reservation.create.submitNetworkError';
}

export function shouldRefreshReservationAvailability(error: unknown): boolean {
  const code = toApiError(error).code;
  return code === 'AVAILABILITY_CAPACITY_EXCEEDED' || code === 'AVAILABILITY_NOT_FOUND';
}
