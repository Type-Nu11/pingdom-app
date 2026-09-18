import type { CreateReservationBody, Reservation } from '../api/reservationApi';

/**
 * Field limits and the phone shape are taken verbatim from the generated
 * `ReservationCreateRequest` contract (`bookerName` maxLength 100, `bookerPhone`
 * maxLength 30 + pattern, `requestNote` maxLength 500). They live here so the
 * input UI and the client-side guard cannot drift apart; the server still
 * validates and remains the source of truth.
 */
export const BOOKER_NAME_MAX_LENGTH = 100;
export const BOOKER_PHONE_MAX_LENGTH = 30;
export const REQUEST_NOTE_MAX_LENGTH = 500;
export const BOOKER_PHONE_PATTERN = /^[0-9+()\- ]+$/;

export type BookerFieldError =
  | 'reservation.create.booker.errors.nameRequired'
  | 'reservation.create.booker.errors.nameTooLong'
  | 'reservation.create.booker.errors.phoneRequired'
  | 'reservation.create.booker.errors.phoneInvalid'
  | 'reservation.create.booker.errors.phoneTooLong'
  | 'reservation.create.booker.errors.noteTooLong';

export type BookerInput = {
  bookerName: string;
  bookerPhone: string;
  requestNote: string;
};

export type BookerValidation = {
  errors: {
    bookerName: BookerFieldError | null;
    bookerPhone: BookerFieldError | null;
    requestNote: BookerFieldError | null;
  };
  isValid: boolean;
};

export function validateBookerInput(input: BookerInput): BookerValidation {
  const name = input.bookerName.trim();
  const phone = input.bookerPhone.trim();
  const note = input.requestNote;

  const bookerName: BookerFieldError | null = name.length === 0
    ? 'reservation.create.booker.errors.nameRequired'
    : name.length > BOOKER_NAME_MAX_LENGTH
      ? 'reservation.create.booker.errors.nameTooLong'
      : null;

  const bookerPhone: BookerFieldError | null = phone.length === 0
    ? 'reservation.create.booker.errors.phoneRequired'
    : phone.length > BOOKER_PHONE_MAX_LENGTH
      ? 'reservation.create.booker.errors.phoneTooLong'
      : !BOOKER_PHONE_PATTERN.test(phone)
        ? 'reservation.create.booker.errors.phoneInvalid'
        : null;

  const requestNote: BookerFieldError | null = note.length > REQUEST_NOTE_MAX_LENGTH
    ? 'reservation.create.booker.errors.noteTooLong'
    : null;

  return {
    errors: { bookerName, bookerPhone, requestNote },
    isValid: bookerName === null && bookerPhone === null && requestNote === null,
  };
}

/**
 * Builds the booker fields of the create request from the validated input.
 * `requestNote` is omitted when blank so an empty optional field is not sent as
 * an empty string.
 */
export function toBookerRequestFields(
  input: BookerInput,
): Pick<CreateReservationBody, 'bookerName' | 'bookerPhone' | 'requestNote'> {
  const requestNote = input.requestNote.trim();
  return {
    bookerName: input.bookerName.trim(),
    bookerPhone: input.bookerPhone.trim(),
    ...(requestNote.length > 0 ? { requestNote } : {}),
  };
}

/**
 * Display masks for booker identity. The server currently returns the values it
 * stored, so the client masks them before painting a reservation the user
 * revisits: a name keeps only its first character, a phone keeps only its last
 * four digits.
 */
export function maskBookerName(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  const [first, ...rest] = [...trimmed];
  return first + '•'.repeat(Math.max(rest.length, 1));
}

export function maskBookerPhone(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length <= 4) return '•'.repeat(Math.max(trimmed.length, 4));
  const visible = digits.slice(-4);
  return '•'.repeat(Math.max(digits.length - 4, 3)) + visible;
}

/**
 * The selected date/time window a reservation was booked for. Returns `null`
 * when the server has not attached one (both fields are nullable in the
 * contract) so the screen can fall back rather than render `Invalid Date`.
 */
export function formatReservationWindow(
  reservation: Pick<Reservation, 'reservationStartsAt' | 'reservationEndsAt'> | null | undefined,
  language: string,
): string | null {
  if (!reservation) return null;
  const { reservationStartsAt, reservationEndsAt } = reservation;
  if (!reservationStartsAt) return null;

  const start = new Date(reservationStartsAt);
  if (Number.isNaN(start.getTime())) return null;

  const locale = language.startsWith('en') ? 'en-US' : 'ko-KR';
  const startLabel = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(start);

  if (!reservationEndsAt) return startLabel;
  const end = new Date(reservationEndsAt);
  if (Number.isNaN(end.getTime())) return startLabel;

  const sameLocalDate = start.getFullYear() === end.getFullYear()
    && start.getMonth() === end.getMonth()
    && start.getDate() === end.getDate();
  const endLabel = new Intl.DateTimeFormat(
    locale,
    sameLocalDate ? { timeStyle: 'short' } : { dateStyle: 'medium', timeStyle: 'short' },
  ).format(end);
  return `${startLabel} – ${endLabel}`;
}
