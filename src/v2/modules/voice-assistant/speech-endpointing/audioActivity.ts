/** Native normalized levels are -2..10. Hysteresis rejects low positive noise.
 * This is an energy estimate, not a semantic VAD; real-device calibration is required. */
export function createAudioActivityDetector() {
  let speaking = false;
  return {
    speechStart() { speaking = true; return speaking; },
    speechEnd() { speaking = false; return speaking; },
    volume(value: number): boolean | null {
      if (!Number.isFinite(value)) return null;
      if (value >= 3) speaking = true;
      else if (value <= 1) speaking = false;
      return speaking;
    },
  };
}
