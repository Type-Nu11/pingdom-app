import { VoiceSessionError } from './voiceSessionError';

/** Deployed ISO-8601 instant; a missing offset must never fall back to device timezone. */
export function voiceSessionExpiresAt(value: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.exec(value);
  if (!match) throw new VoiceSessionError('INVALID_RESPONSE');
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText), month = Number(monthText), day = Number(dayText);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const instant = Date.parse(value);
  if (!year || month < 1 || month > 12 || day < 1 || day > days[month - 1] || !Number.isFinite(instant)) {
    throw new VoiceSessionError('INVALID_RESPONSE');
  }
  return instant;
}
