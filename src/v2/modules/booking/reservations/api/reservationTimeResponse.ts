/**
 * Reservation responses are UTC instants (docs/api/README.md). The deployed
 * availability/quote serializer can omit the UTC suffix. Repair that encoding
 * at the API boundary, before calendar display and strict voice validation.
 * Explicit offsets and malformed values are preserved for caller validation.
 */
function utcInstant(value: unknown): unknown {
  if (typeof value !== 'string'
    || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?$/.test(value)) return value;
  const instant = new Date(`${value}Z`);
  if (!Number.isFinite(instant.getTime()) || instant.toISOString().slice(0, 19) !== value.slice(0, 19)) return value;
  return `${value}Z`;
}

export function normalizeReservationTimeResponse<T>(value: T): T {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  const normalized = { ...value } as Record<string, unknown>;
  for (const key of ['startsAt', 'endsAt', 'cancellationDeadline', 'expiresAt']) {
    if (Object.prototype.hasOwnProperty.call(normalized, key)) normalized[key] = utcInstant(normalized[key]);
  }
  return normalized as T;
}

export function normalizeAvailabilityTimeResponses<T>(value: T): T {
  return (Array.isArray(value) ? value.map(normalizeReservationTimeResponse) : value) as T;
}
