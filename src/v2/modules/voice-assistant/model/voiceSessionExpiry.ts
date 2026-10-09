import { parseServerInstant } from '../../../shared/model';
import { VoiceSessionError } from './voiceSessionError';

export function voiceSessionExpiresAt(value: string): number {
  const instant = parseServerInstant(value);
  if (instant === null) throw new VoiceSessionError('INVALID_RESPONSE');
  return instant;
}
