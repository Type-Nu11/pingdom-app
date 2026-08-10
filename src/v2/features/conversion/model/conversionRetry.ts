import { ApiError } from '../../../shared/api';

const MAX_CONVERSION_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 500;
const RETRY_MAX_DELAY_MS = 4_000;

export function shouldRetryConversionEventMutation(
  failureCount: number,
  error: unknown,
): boolean {
  if (failureCount >= MAX_CONVERSION_RETRIES) return false;

  if (error instanceof ApiError) {
    if (error.code === 'ERR_CANCELED') return false;
    return error.isNetworkError || (error.status !== undefined && error.status >= 500);
  }

  return false;
}

export function getConversionRetryDelay(
  attemptIndex: number,
  random: () => number = Math.random,
): number {
  const exponentialDelay = Math.min(
    RETRY_BASE_DELAY_MS * (2 ** Math.max(0, attemptIndex)),
    RETRY_MAX_DELAY_MS,
  );
  const jitterMultiplier = 0.75 + (random() * 0.5);

  return Math.round(exponentialDelay * jitterMultiplier);
}
