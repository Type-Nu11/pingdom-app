import { parseServerInstant } from '../../../../shared/model';
import { ApiError } from '../../../../shared/api';
import type { CreateReservationBody, Reservation, ReservationConfirmation, ReservationQuote } from '../api/reservationApi';
import { type Availability, createReservationIdempotencyKey } from './reservationAvailability';
import { validateReservationQuote } from './reservationConfirmation';
import { type BookerInput, validateBookerInput, toBookerRequestFields } from './reservationBooker';

export type ReservationSelection = { placeId: number; placeName: string; availability: Availability; quantity: number };
export type ReservationIntent = Readonly<{
  version: 1; accountId: string; placeId: number; confirmation: Readonly<ReservationConfirmation>;
  body: Readonly<CreateReservationBody>;
}>;
export type ReservationIntentStorage = {
  read: (accountId: string) => Promise<ReservationIntent | null>;
  write: (intent: ReservationIntent) => Promise<void>;
  remove: (accountId: string, idempotencyKey: string) => Promise<void>;
};
export type ConfirmedReservationState =
  | { phase: 'idle' | 'loading' | 'checking' | 'submitting' }
  | { phase: 'review'; confirmation: Readonly<ReservationConfirmation>; changed: boolean }
  | { phase: 'unknown'; confirmation: Readonly<ReservationConfirmation> }
  | { phase: 'success'; reservation: Reservation }
  | { phase: 'error'; code: 'unavailable' | 'invalid' | 'storage' | 'rejected' | 'lookup' };

type Dependencies = {
  accountId: string;
  isCurrent: () => boolean;
  now?: () => number;
  monotonic?: () => number;
  storage: ReservationIntentStorage;
  list: (placeId: number) => Promise<Availability[]>;
  quote: (placeId: number, availabilityId: number, quantity: number) => Promise<ReservationQuote>;
  create: (body: CreateReservationBody, placeId: number) => Promise<Reservation>;
};
const accountLocks = new Set<string>();
const comparable = (c: Readonly<ReservationConfirmation>) => {
  const { expiresAt: _expiresAt, ...terms } = c;
  return JSON.stringify(Object.fromEntries(Object.entries(terms).sort(([a], [b]) => a.localeCompare(b))));
};
export function isSelectableConfirmedSlot(slot: Availability, quantity: number, now: number): boolean {
  const start = parseServerInstant(slot.startsAt), end = parseServerInstant(slot.endsAt);
  return slot.productType === 'GENERAL' && slot.productId === null && slot.productName === null
    && slot.status === 'ACTIVE' && Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= 12
    && Number.isSafeInteger(slot.remainingCapacity) && slot.remainingCapacity >= quantity
    && start !== null && end !== null && start > now && end > start;
}
function matchesCreated(r: Reservation, intent: ReservationIntent): boolean {
  return Number.isSafeInteger(r?.id) && r.id > 0 && r.availabilityId === intent.body.availabilityId
    && String(r.touristUserId) === intent.accountId
    && r.bookerName === intent.body.bookerName && r.bookerPhone === intent.body.bookerPhone
    && (r.requestNote ?? '') === (intent.body.requestNote ?? '')
    && r.quantity === intent.body.quantity && r.productType === intent.confirmation.productType
    && r.productId === intent.confirmation.productId && !!r.confirmation
    && comparable(r.confirmation) === comparable(intent.confirmation)
    && r.reservationStartsAt === intent.confirmation.startsAt && r.reservationEndsAt === intent.confirmation.endsAt
    && ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELED'].includes(r.status);
}
/** Only an explicit app action calls confirm/retry. Provider commands never receive this object. */
export function createConfirmedReservation(deps: Dependencies) {
  const now = deps.now ?? Date.now;
  const monotonic = deps.monotonic ?? (() => performance.now());
  let state: ConfirmedReservationState = { phase: 'idle' };
  let selection: ReservationSelection | null = null;
  let displayed: Readonly<ReservationConfirmation> | null = null;
  let deadline = 0;
  let pending: ReservationIntent | null = null;
  let busy = false;
  let generation = 0;
  const listeners = new Set<() => void>();
  const publish = (next: ConfirmedReservationState) => { state = next; listeners.forEach(fn => fn()); };
  const current = (revision: number) => revision === generation && deps.isCurrent();
  const publishCurrent = (revision: number, next: ConfirmedReservationState) => { if (current(revision)) publish(next); };
  const freshQuote = async (s: ReservationSelection) => {
    const slots = await deps.list(s.placeId);
    const fresh = slots.find(slot => slot.id === s.availability.id && slot.placeId === s.placeId);
    if (!fresh || !isSelectableConfirmedSlot(fresh, s.quantity, now())
      || fresh.startsAt !== s.availability.startsAt || fresh.endsAt !== s.availability.endsAt) throw new Error('UNAVAILABLE');
    const quote = await deps.quote(s.placeId, fresh.id, s.quantity);
    const confirmation = validateReservationQuote(quote, { ...s, availability: fresh }, now());
    return { quote, confirmation, deadline: monotonic() + Math.max(0, Date.parse(confirmation.expiresAt) - now()) };
  };
  const showReview = (confirmation: Readonly<ReservationConfirmation>, changed: boolean, revision: number) => {
    displayed = confirmation;
    deadline = monotonic() + Math.max(0, Date.parse(confirmation.expiresAt) - now());
    publishCurrent(revision, { phase: 'review', confirmation, changed });
  };
  const send = async (intent: ReservationIntent, revision: number) => {
    publishCurrent(revision, { phase: 'submitting' });
    try {
      const result = await deps.create(intent.body, intent.placeId);
      if (!matchesCreated(result, intent)) throw new Error('UNVERIFIED_RESPONSE');
      // A failed deletion must keep the exact intent recoverable; never enable a new write.
      await deps.storage.remove(intent.accountId, intent.body.idempotencyKey);
      pending = null;
      publishCurrent(revision, { phase: 'success', reservation: result });
    } catch (error) {
      // Only explicit 4xx rejection is final. Authentication and throttling can be retried with this intent.
      if (error instanceof ApiError && error.status !== undefined && error.status >= 400 && error.status < 500
        && ![401, 403, 408, 429].includes(error.status)) {
        try {
          await deps.storage.remove(intent.accountId, intent.body.idempotencyKey); pending = null; selection = null; displayed = null;
          publishCurrent(revision, { phase: 'error', code: 'rejected' });
        } catch { publishCurrent(revision, { phase: 'unknown', confirmation: intent.confirmation }); }
      } else publishCurrent(revision, { phase: 'unknown', confirmation: intent.confirmation });
    }
  };
  return {
    getSnapshot: () => state,
    subscribe: (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
    async restore() {
      if (busy || !deps.isCurrent()) return;
      const revision = generation; busy = true; publish({ phase: 'loading' });
      try {
        pending = await deps.storage.read(deps.accountId);
        publishCurrent(revision, pending ? { phase: 'unknown', confirmation: pending.confirmation } : { phase: 'idle' });
      } catch { publishCurrent(revision, { phase: 'error', code: 'storage' }); }
      finally { busy = false; }
    },
    async prepare(next: ReservationSelection) {
      if (busy || pending || !deps.isCurrent()) return;
      const revision = ++generation; busy = true; selection = next; displayed = null;
      publish({ phase: 'loading' });
      try {
        try { pending = await deps.storage.read(deps.accountId); }
        catch { publishCurrent(revision, { phase: 'error', code: 'storage' }); return; }
        if (pending) { publishCurrent(revision, { phase: 'unknown', confirmation: pending.confirmation }); return; }
        const { confirmation } = await freshQuote(next);
        if (current(revision)) showReview(confirmation, false, revision);
      } catch { publishCurrent(revision, { phase: 'error', code: 'lookup' }); }
      finally { busy = false; }
    },
    async confirm(booker: BookerInput) {
      if (busy || pending || !deps.isCurrent() || state.phase !== 'review' || !selection || !displayed
        || accountLocks.has(deps.accountId)) return;
      if (!validateBookerInput(booker).isValid) return;
      busy = true; accountLocks.add(deps.accountId);
      const revision = generation, selected = selection, previous = displayed;
      const expired = now() >= Date.parse(previous.expiresAt) || monotonic() >= deadline;
      publish({ phase: 'checking' });
      try {
        try { pending = await deps.storage.read(deps.accountId); }
        catch { publishCurrent(revision, { phase: 'error', code: 'storage' }); return; }
        if (pending) { publishCurrent(revision, { phase: 'unknown', confirmation: pending.confirmation }); return; }
        const { quote, confirmation, deadline: freshDeadline } = await freshQuote(selected);
        if (!current(revision)) return;
        if (expired || comparable(previous) !== comparable(confirmation)) {
          showReview(confirmation, true, revision); return;
        }
        const intent: ReservationIntent = Object.freeze({ version: 1, accountId: deps.accountId,
          placeId: selected.placeId, confirmation,
          body: Object.freeze({ availabilityId: selected.availability.id, quantity: selected.quantity,
            confirmationToken: quote.confirmationToken, idempotencyKey: createReservationIdempotencyKey(),
            ...toBookerRequestFields(booker) }) });
        // Persist before the first HTTP write. Persistence errors block submission.
        try { await deps.storage.write(intent); } catch { publishCurrent(revision, { phase: 'error', code: 'storage' }); return; }
        pending = intent;
        if (!current(revision)) { await deps.storage.remove(deps.accountId, intent.body.idempotencyKey); pending = null; return; }
        if (now() >= Date.parse(confirmation.expiresAt) || monotonic() >= freshDeadline) {
          await deps.storage.remove(deps.accountId, intent.body.idempotencyKey); pending = null; displayed = null;
          publishCurrent(revision, { phase: 'error', code: 'unavailable' }); return;
        }
        await send(intent, revision);
      } catch { publishCurrent(revision, { phase: 'error', code: 'unavailable' }); }
      finally { busy = false; accountLocks.delete(deps.accountId); }
    },
    async retry() {
      if (busy || !pending || !deps.isCurrent() || state.phase !== 'unknown' || accountLocks.has(deps.accountId)) return;
      busy = true; accountLocks.add(deps.accountId);
      try { await send(pending, generation); }
      finally { busy = false; accountLocks.delete(deps.accountId); }
    },
    cancel() {
      generation++; selection = null; displayed = null;
      publish(pending ? { phase: 'unknown', confirmation: pending.confirmation } : { phase: 'idle' });
    },
  };
}
