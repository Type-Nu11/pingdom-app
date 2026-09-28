import { getApiErrorUx } from '../../../shared/api';

export type PlaceEntryErrorKind = 'authentication' | 'authorization' | 'network' | 'unavailable';

export type PlaceEntryError = {
  kind: PlaceEntryErrorKind;
};

/**
 * The view endpoint's contract only declares 401/403 — everything else (404,
 * other 4xx, 5xx, a transport failure) collapses into `unavailable`/`network`
 * here instead of guessing at a response shape the contract doesn't promise.
 */
export function toPlaceEntryError(error: unknown): PlaceEntryError {
  const { kind } = getApiErrorUx(error);
  if (kind === 'authentication') return { kind: 'authentication' };
  if (kind === 'authorization') return { kind: 'authorization' };
  if (kind === 'network') return { kind: 'network' };
  return { kind: 'unavailable' };
}
