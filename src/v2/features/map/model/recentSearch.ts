import { resolveLocale } from '../../../shared/i18n/formatters';

export const MAX_RECENT_SEARCHES = 6;

export type RecentSearchCategory =
  | 'art'
  | 'beauty'
  | 'cafe'
  | 'etc'
  | 'fashion'
  | 'food'
  | 'heritage'
  | 'music'
  | 'popup';

export type RecentSearch = Readonly<{
  category: RecentSearchCategory;
  id: string;
  query: string;
  searchedAt: string;
}>;

export type AddRecentSearchInput = Readonly<{
  category: RecentSearchCategory;
  query: string;
  searchedAt?: string;
}>;

const categories = new Set<RecentSearchCategory>([
  'art', 'beauty', 'cafe', 'etc', 'fashion', 'food', 'heritage', 'music', 'popup',
]);

export function normalizeRecentSearchQuery(query: string): string {
  return query.trim();
}

export function getRecentSearchId(query: string): string {
  return normalizeRecentSearchQuery(query).normalize('NFKC').toLowerCase();
}

export function addRecentSearch(
  items: readonly RecentSearch[],
  input: AddRecentSearchInput,
): readonly RecentSearch[] {
  const query = normalizeRecentSearchQuery(input.query);
  if (!query) return items;

  const searchedAt = input.searchedAt ?? new Date().toISOString();
  if (!isIsoTimestamp(searchedAt)) return items;

  const nextItem: RecentSearch = {
    category: input.category,
    id: getRecentSearchId(query),
    query,
    searchedAt,
  };

  return sanitizeRecentSearches([
    nextItem,
    ...items.filter((item) => item.id !== nextItem.id),
  ]);
}

export function sanitizeRecentSearches(value: unknown): readonly RecentSearch[] {
  if (!Array.isArray(value)) return [];

  const uniqueItems = new Map<string, RecentSearch>();
  for (const candidate of value) {
    if (!isRecentSearch(candidate)) continue;

    const query = normalizeRecentSearchQuery(candidate.query);
    const id = getRecentSearchId(query);
    const item = { ...candidate, id, query };
    const current = uniqueItems.get(id);
    if (!current || Date.parse(item.searchedAt) > Date.parse(current.searchedAt)) {
      uniqueItems.set(id, item);
    }
  }

  return [...uniqueItems.values()]
    .sort((left, right) => Date.parse(right.searchedAt) - Date.parse(left.searchedAt))
    .slice(0, MAX_RECENT_SEARCHES);
}

export function formatRecentSearchDate(
  searchedAt: string,
  language: string,
  timeZone?: string,
): string {
  return new Intl.DateTimeFormat(resolveLocale(language), {
    day: '2-digit',
    month: '2-digit',
    timeZone,
  }).format(new Date(searchedAt));
}

function isRecentSearch(value: unknown): value is RecentSearch {
  if (!isRecord(value)) return false;

  return typeof value.id === 'string'
    && typeof value.query === 'string'
    && normalizeRecentSearchQuery(value.query).length > 0
    && typeof value.searchedAt === 'string'
    && isIsoTimestamp(value.searchedAt)
    && typeof value.category === 'string'
    && categories.has(value.category as RecentSearchCategory);
}

function isIsoTimestamp(value: string): boolean {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
