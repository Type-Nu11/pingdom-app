import { getApiErrorUx, toApiError } from '../../../../shared/api';

const SUBMIT_ERROR_KEYS: Partial<Record<ReturnType<typeof getApiErrorUx>['kind'], string>> = {
  conflict: 'reservation.create.submitConflict',
  network: 'reservation.create.submitNetworkError',
  outOfRange: 'reservation.create.submitConflict',
  validation: 'reservation.create.submitValidationError',
};

export function reservationSubmitErrorKey(error: unknown): string {
  const apiError = toApiError(error);
  if (apiError.code === 'AVAILABILITY_CAPACITY_EXCEEDED') {
    return 'reservation.create.submitCapacityError';
  }
  if (apiError.code === 'AVAILABILITY_NOT_FOUND' || apiError.code === 'RESOURCE_EXPIRED') {
    return 'reservation.create.submitAvailabilityError';
  }
  if (apiError.code === 'INVALID_RESERVATION_INPUT'
    || apiError.code === 'VALIDATION_FAILED'
    || apiError.status === 400) {
    return 'reservation.create.submitValidationError';
  }
  if (apiError.code === 'TOURIST_ACCOUNT_REQUIRED' || apiError.status === 403) {
    return 'reservation.create.submitAccountError';
  }
  return SUBMIT_ERROR_KEYS[getApiErrorUx(error).kind]
    ?? 'reservation.create.submitError';
}

export function shouldRefreshReservationAvailability(error: unknown): boolean {
  const code = toApiError(error).code;
  return code === 'AVAILABILITY_CAPACITY_EXCEEDED' || code === 'AVAILABILITY_NOT_FOUND';
}
