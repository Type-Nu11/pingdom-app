import { formatRelativeMinutes } from '../../../shared/i18n/formatters';
import { parseServerInstant } from '../../../shared/model/serverInstant';

/** Community's legacy LocalDateTime responses omit the UTC suffix required by the API contract. */
export function formatCommunityTime(value: string | undefined, now: Date, language: string): string {
  if (!value) return '';
  const timestamp = value.trim();
  const withZone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(timestamp)
    ? `${timestamp}Z` : timestamp;
  // Java emits microseconds; use ISO milliseconds consistently on Hermes and JSC.
  const instant = parseServerInstant(withZone.replace(/(\.\d{3})\d+(?=Z|[+-])/, '$1'));
  if (instant === null) return '';
  return formatRelativeMinutes(Math.max(0, Math.floor((now.getTime() - instant) / 60_000)), language);
}
