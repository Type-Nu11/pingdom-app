export type MapRefreshGesture = Readonly<{
  dx: number;
  dy: number;
  vy: number;
}>;

export const MAP_PULL_REFRESH_TRIGGER_DISTANCE = 64;
export const MAP_PULL_REFRESH_MAX_DISTANCE = 88;

export function isDownwardMapPull(
  gesture: Pick<MapRefreshGesture, 'dx' | 'dy'>,
  minimumDistance = 8,
): boolean {
  return gesture.dy >= minimumDistance
    && Math.abs(gesture.dy) > Math.abs(gesture.dx);
}

export function getMapPullIndicatorDistance(dy: number): number {
  return Math.min(MAP_PULL_REFRESH_MAX_DISTANCE, Math.max(0, dy * 0.55));
}

export function shouldRefreshMapFromPullGesture(
  gesture: Pick<MapRefreshGesture, 'dx' | 'dy'>,
): boolean {
  return isDownwardMapPull(gesture, MAP_PULL_REFRESH_TRIGGER_DISTANCE);
}
