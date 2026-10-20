export type AndroidBackOverride = () => boolean;

let focusedBackOverride: AndroidBackOverride | null = null;

export function registerAndroidBackOverride(override: AndroidBackOverride) {
  focusedBackOverride = override;

  return () => {
    if (focusedBackOverride === override) focusedBackOverride = null;
  };
}

export function runAndroidBackOverride() {
  return focusedBackOverride?.() ?? false;
}
