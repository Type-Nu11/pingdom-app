import AsyncStorage from '@react-native-async-storage/async-storage';

import { sanitizeRecentSearches, type RecentSearch } from '../model/recentSearch';

const STORAGE_PREFIX = '@pingdom/v2/map-recent-searches:v1';
const STORAGE_VERSION = 1;

export type RecentSearchOwner =
  | Readonly<{ kind: 'guest' }>
  | Readonly<{ kind: 'user'; userId: number }>;

export type RecentSearchRestoreResult =
  | Readonly<{ items: readonly RecentSearch[]; kind: 'restored' }>
  | Readonly<{ items: readonly RecentSearch[]; kind: 'empty' | 'invalid' }>;

type StoredRecentSearches = Readonly<{
  items: readonly RecentSearch[];
  version: typeof STORAGE_VERSION;
}>;

const writeQueues = new Map<string, Promise<void>>();

export function getRecentSearchOwnerKey(owner: RecentSearchOwner): string {
  if (owner.kind === 'guest') return 'guest';
  if (!Number.isSafeInteger(owner.userId) || owner.userId <= 0) {
    throw new Error('Recent search owner requires a positive integer user ID.');
  }
  return `user:${owner.userId}`;
}

export function getRecentSearchStorageKey(owner: RecentSearchOwner): string {
  return `${STORAGE_PREFIX}:${getRecentSearchOwnerKey(owner)}`;
}

export async function restoreRecentSearches(
  owner: RecentSearchOwner,
): Promise<RecentSearchRestoreResult> {
  const rawValue = await AsyncStorage.getItem(getRecentSearchStorageKey(owner));
  if (rawValue === null) return { items: [], kind: 'empty' };

  try {
    const parsed: unknown = JSON.parse(rawValue);
    if (!isStoredRecentSearches(parsed)) return { items: [], kind: 'invalid' };
    return { items: sanitizeRecentSearches(parsed.items), kind: 'restored' };
  } catch {
    return { items: [], kind: 'invalid' };
  }
}

export async function persistRecentSearches(
  owner: RecentSearchOwner,
  items: readonly RecentSearch[],
): Promise<void> {
  const storedValue: StoredRecentSearches = {
    items: sanitizeRecentSearches(items),
    version: STORAGE_VERSION,
  };
  await AsyncStorage.setItem(getRecentSearchStorageKey(owner), JSON.stringify(storedValue));
}

export function queueRecentSearchPersist(
  owner: RecentSearchOwner,
  items: readonly RecentSearch[],
): Promise<void> {
  const key = getRecentSearchStorageKey(owner);
  const previous = writeQueues.get(key) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(() => persistRecentSearches(owner, items));

  writeQueues.set(key, next);
  void next.finally(() => {
    if (writeQueues.get(key) === next) writeQueues.delete(key);
  }).catch(() => undefined);
  return next;
}

function isStoredRecentSearches(value: unknown): value is StoredRecentSearches {
  return isRecord(value) && value.version === STORAGE_VERSION && Array.isArray(value.items);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
