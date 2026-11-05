export type CompletionContext = Readonly<{ expectedAnswer?: 'quantity' }>;
export const VOICE_SILENCE_MS = 4000;
export const VOICE_COMPLETED_REQUEST_SILENCE_MS = VOICE_SILENCE_MS;

/** Every utterance uses the same user-requested four-second cutoff. */
export function getVoiceSilenceMs(_text: string, _context: CompletionContext = {}): number {
  return VOICE_SILENCE_MS;
}
