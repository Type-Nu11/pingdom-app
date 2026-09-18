import type { ClarificationField, CommandFailureCode } from './voiceAssistantCommand.types';
import { voiceSessionExpiresAt } from './voiceSessionExpiry';

export class VoiceCommandError extends Error {
  constructor(readonly code: CommandFailureCode) { super(code); }
}
export class VoiceClarification extends Error {
  constructor(readonly field: ClarificationField) { super(field); }
}
export function serverInstant(value: unknown): number {
  try {
    if (typeof value !== 'string') throw new Error();
    return voiceSessionExpiresAt(value);
  } catch { throw new VoiceCommandError('INVALID_SERVER_RESPONSE'); }
}
function formatter(timezone: string) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, calendar: 'gregory', numberingSystem: 'latn',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  } catch { throw new VoiceClarification('timeRange'); }
}
function parts(format: Intl.DateTimeFormat, instant: number) {
  const fields = Object.fromEntries(format.formatToParts(instant).map(p => [p.type, p.value]));
  return `${fields.year.padStart(4, '0')}-${fields.month}-${fields.day}T${fields.hour}:${fields.minute}:${fields.second}`;
}
/** Resolve only unique wall times. Both DST folds and gaps require clarification. */
function resolveLocal(local: string, format: Intl.DateTimeFormat): number {
  const naive = Date.parse(`${local}Z`);
  const offsets = new Set<number>();
  // Sample both sides of timezone transitions, including half-hour changes and skipped dates.
  for (let hours = -48; hours <= 48; hours += 6) {
    const sample = naive + hours * 3600000;
    offsets.add(Date.parse(`${parts(format, sample)}Z`) - sample);
  }
  const candidates = [...offsets].map(offset => naive - offset).filter(instant => parts(format, instant) === local);
  if (candidates.length !== 1) throw new VoiceClarification('timeRange');
  return candidates[0];
}
export function voiceTimeRange(date: string, timezone: string, now: number, startTime?: string, endTime?: string) {
  const format = formatter(timezone);
  if (date < parts(format, now).slice(0, 10)) throw new VoiceClarification('date');
  const next = new Date(Date.parse(`${date}T00:00:00Z`) + 86400000).toISOString().slice(0, 10);
  const start = resolveLocal(`${date}T${startTime ?? '00:00'}:00`, format);
  const end = resolveLocal(`${endTime ? date : next}T${endTime ?? '00:00'}:00`, format);
  if (!(start < end)) throw new VoiceClarification('timeRange');
  return { start, end };
}
