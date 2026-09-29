export const MAP_TUTORIAL_SEEN_KEY = '@pingdom/map-tutorial-seen/v1';

export const MAP_TUTORIAL_STEPS = [
  'welcome', 'map', 'favorites', 'community', 'reservations',
  'recommendations', 'verification', 'categories', 'profile',
] as const;

export type MapTutorialStep = typeof MAP_TUTORIAL_STEPS[number];
export type MapTutorialTargetId = Exclude<MapTutorialStep, 'welcome'>;
export type TutorialRect = { x: number; y: number; width: number; height: number };

/** Native layout keeps the anchored edge fixed even when the text height changes. */
export function getTutorialCardPlacement({
  step, target, height, topInset, bottomInset,
}: {
  step: MapTutorialStep;
  target: TutorialRect | null;
  height: number;
  topInset: number;
  bottomInset: number;
}) {
  const safeTop = topInset + 12;
  const safeBottom = bottomInset + 12;
  const availableHeight = Math.max(0, height - safeTop - safeBottom);
  const minimumHeight = Math.min(160, availableHeight);
  if (step === 'welcome' || !target) {
    const inset = Math.max(safeTop, safeBottom);
    return { top: inset, bottom: inset, maxHeight: Math.max(0, height - inset * 2) };
  }
  if (step === 'categories' || step === 'profile') {
    const top = Math.max(safeTop, Math.min(target.y + target.height + 24, height - safeBottom - minimumHeight));
    return { top, bottom: undefined, maxHeight: Math.max(0, height - top - safeBottom) };
  }
  // Navigation tabs (56px) and the recommendation button (64px) share a
  // centerline, not a top edge. Keep the guide fixed across these five steps.
  const navigationStep = ['map', 'favorites', 'community', 'reservations', 'recommendations'].includes(step);
  const anchorY = navigationStep ? target.y + target.height / 2 - 28 : target.y;
  const bottom = Math.max(safeBottom, Math.min(height - anchorY + 24, height - safeTop - minimumHeight));
  return { top: undefined, bottom, maxHeight: Math.max(0, height - bottom - safeTop) };
}
