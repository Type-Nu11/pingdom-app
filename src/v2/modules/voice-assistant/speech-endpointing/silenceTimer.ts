import { getVoiceSilenceMs, type CompletionContext } from './completion';

/** Transcript updates select a duration; only acoustic quiet starts the clock. */
export function createSilenceTimer(onElapsed: () => void) {
  let text = '';
  let context: CompletionContext = {};
  let quietSince: number | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const clear = () => { if (timer !== undefined) clearTimeout(timer); timer = undefined; };
  const schedule = () => {
    clear();
    if (!text.trim() || quietSince === null) return;
    timer = setTimeout(() => { timer = undefined; onElapsed(); },
      Math.max(0, getVoiceSilenceMs(text, context) - (performance.now() - quietSince)));
  };
  return {
    setText(value: string) { text = value; schedule(); },
    setContext(value: CompletionContext) { context = value; schedule(); },
    activity(speaking: boolean, quietForMs = 0) {
      if (speaking) { quietSince = null; clear(); }
      else if (quietSince === null) { quietSince = performance.now() - (Number.isFinite(quietForMs) ? Math.max(0, Math.min(200, quietForMs)) : 0); schedule(); }
    },
    reset() { clear(); text = ''; context = {}; quietSince = null; },
  };
}
