import type { Profile } from './profile.types';

// The server may overwrite the object behind a stable URL. React Native's image
// cache keys on the URL, so a successful upload that returns the same URL would
// keep showing the old picture. Bumping a per-user version only in that case
// busts the cache without touching URLs that already changed (which may be
// signed and must not gain extra query parameters).
const versionByUserId = new Map<number, number>();

export function markProfileImageReplaced(
  userId: number,
  previousUrl: string | null | undefined,
  nextUrl: string,
) {
  if (previousUrl === nextUrl) {
    versionByUserId.set(userId, (versionByUserId.get(userId) ?? 0) + 1);
  }
}

export function getProfileImageUri(
  profile: Pick<Profile, 'id' | 'profileImageUrl'> | null | undefined,
): string | null {
  const url = profile?.profileImageUrl;
  if (!url) return null;

  const version = versionByUserId.get(profile.id);
  if (!version) return url;
  return `${url}${url.includes('?') ? '&' : '?'}v=${version}`;
}
