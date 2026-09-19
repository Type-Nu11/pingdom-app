export const ANDROID_EXIT_CONFIRMATION_WINDOW_MS = 2_000;

export type AndroidBackAction = 'go-back' | 'show-exit-hint' | 'exit-app';

export function getAndroidBackAction(
  canGoBack: boolean,
  lastRootBackPressAt: number,
  now: number,
  confirmationWindowMs = ANDROID_EXIT_CONFIRMATION_WINDOW_MS,
): AndroidBackAction {
  if (canGoBack) {
    return 'go-back';
  }

  if (
    lastRootBackPressAt > 0
    && now - lastRootBackPressAt <= confirmationWindowMs
  ) {
    return 'exit-app';
  }

  return 'show-exit-hint';
}
