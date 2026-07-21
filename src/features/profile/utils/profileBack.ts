export type ProfileMode = 'profile' | 'archive' | 'archive-detail';

export type ProfileBackAction =
  | 'close-likes'
  | 'show-archive'
  | 'show-profile'
  | 'navigate-back';

export function getProfileBackAction(
  likesOpen: boolean,
  mode: ProfileMode,
): ProfileBackAction {
  if (likesOpen) {
    return 'close-likes';
  }

  if (mode === 'archive-detail') {
    return 'show-archive';
  }

  if (mode === 'archive') {
    return 'show-profile';
  }

  return 'navigate-back';
}
