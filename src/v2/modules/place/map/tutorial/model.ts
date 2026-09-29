export const MAP_TUTORIAL_SEEN_KEY = '@pingdom/map-tutorial-seen/v1';

export const MAP_TUTORIAL_STEPS = [
  'welcome', 'map', 'favorites', 'community', 'reservations',
  'recommendations', 'verification', 'categories', 'profile',
] as const;

export type MapTutorialStep = typeof MAP_TUTORIAL_STEPS[number];
export type MapTutorialTargetId = Exclude<MapTutorialStep, 'welcome'>;
export type TutorialRect = { x: number; y: number; width: number; height: number };

/** Anchor to the actual control, allowing the card to grow for translated text. */
export function getTutorialCardTop({
  step, target, height, cardHeight, topInset, bottomInset,
}: {
  step: MapTutorialStep;
  target: TutorialRect | null;
  height: number;
  cardHeight: number;
  topInset: number;
  bottomInset: number;
}) {
  const min = topInset + 12;
  const max = Math.max(min, height - bottomInset - cardHeight - 12);
  let top = (height - cardHeight) / 2;
  if (target) {
    top = step === 'categories' || step === 'profile'
      ? target.y + target.height + 24
      : target.y - cardHeight - 24;
  }
  return Math.max(min, Math.min(top, max));
}
