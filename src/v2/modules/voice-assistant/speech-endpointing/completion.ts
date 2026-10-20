export type CompletionContext = Readonly<{ expectedAnswer?: 'quantity' }>;
export const VOICE_SILENCE_MS = 3000;
export const VOICE_COMPLETED_REQUEST_SILENCE_MS = 1000;

/** Completion clues, not a grammar parser. Unknown expressions keep the longer wait. */
export function getVoiceSilenceMs(text: string, context: CompletionContext = {}): number {
  if (/(?:…|\.{2,})\s*$/u.test(text)) return VOICE_SILENCE_MS;
  const sentence = text.trim().replace(/[.!?。！？]+$/u, '').trim();
  const greeting = /^(?:안녕(?:하세요|하십니까)?|반갑습니다|hello|hi|hey|good\s+(?:morning|afternoon|evening))$/iu.test(sentence);
  const request = /(?:찾아|보여|알려|해)\s*(?:줘(?:요)?|주세요|줄래(?:요)?|주시겠어요)$/u.test(sentence);
  const question = /(?:나요|까요|습니까|인가요|어디예요|뭐예요|얼마예요)$/u.test(sentence);
  const quantityAnswer = context.expectedAnswer === 'quantity'
    && /^(?:[1-9]\d*|한|두|세|네|다섯|여섯|일곱|여덟|아홉|열)\s*(?:명|분)(?:이요|입니다)?$/u.test(sentence);
  return greeting || request || question || quantityAnswer ? VOICE_COMPLETED_REQUEST_SILENCE_MS : VOICE_SILENCE_MS;
}
