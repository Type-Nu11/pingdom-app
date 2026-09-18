import type { PlaceAvailabilities } from '../api/placeAvailabilityApi';

type ResourceState<T> = { data?: T; error?: unknown; isError: boolean; isPending: boolean };

export type ReservationCtaState =
  | { kind: 'loading'; disabled: true }
  | { kind: 'available'; disabled: false }
  | { kind: 'empty'; disabled: false }
  | { kind: 'full'; disabled: false }
  | { kind: 'auth-error'; disabled: true }
  | { kind: 'error'; disabled: true };

const isAuthError = (error: unknown): boolean =>
  Boolean(error && typeof error === 'object' && 'status' in error
    && ((error as { status?: unknown }).status === 401));

export function selectReservationCta(
  resource: ResourceState<PlaceAvailabilities>,
  now: Date = new Date(),
): ReservationCtaState {
  if (resource.isPending) {
    return { kind: 'loading', disabled: true };
  }
  if (resource.isError) {
    return isAuthError(resource.error)
      ? { kind: 'auth-error', disabled: true }
      : { kind: 'error', disabled: true };
  }

  const items = Array.isArray(resource.data) ? resource.data : [];
  const futureActive = items.filter((item) => item.status === 'ACTIVE'
    && typeof item.endsAt === 'string'
    && Number.isFinite(Date.parse(item.endsAt))
    && Date.parse(item.endsAt) > now.getTime());
  if (futureActive.some((item) => typeof item.remainingCapacity === 'number'
    && item.remainingCapacity > 0)) {
    return { kind: 'available', disabled: false };
  }
  if (futureActive.some((item) => (item.remainingCapacity ?? 0) <= 0)) {
    return { kind: 'full', disabled: false };
  }
  return { kind: 'empty', disabled: false };
}
