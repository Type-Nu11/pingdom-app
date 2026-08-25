export type ProfileMode = 'profile' | 'archive' | 'archive-detail';

export type ProfileBackAction =
  | 'show-archive'
  | 'show-profile'
  | 'navigate-back';

export function getProfileBackAction(
  mode: ProfileMode,
): ProfileBackAction {
  if (mode === 'archive-detail') {
    return 'show-archive';
  }

  if (mode === 'archive') {
    return 'show-profile';
  }

  return 'navigate-back';
}
