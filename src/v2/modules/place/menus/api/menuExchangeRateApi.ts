import type { MenuExchangeCurrency } from '../model/menuExchangeCurrency';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MenuExchangeRate = {
  base: 'KRW';
  quote: MenuExchangeCurrency;
  rate: number;
  date: string;
  fetchedAt: number;
};

export const menuExchangeCacheKey = (quote: MenuExchangeCurrency) => `@pingdom/menu-exchange:blended:krw-${quote.toLowerCase()}:v1`;
export const MENU_EXCHANGE_CACHE_MS = 24 * 60 * 60 * 1000;

function parseRate(value: unknown, quote: MenuExchangeCurrency): Omit<MenuExchangeRate, 'fetchedAt'> | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  if (row.base !== 'KRW' || row.quote !== quote
    || typeof row.rate !== 'number' || !Number.isFinite(row.rate) || row.rate <= 0
    || typeof row.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) return null;
  const date = Date.parse(`${row.date}T00:00:00Z`);
  if (!Number.isFinite(date) || new Date(date).toISOString().slice(0, 10) !== row.date
    || date > Date.now()) return null;
  return { base: 'KRW', quote, rate: row.rate, date: row.date };
}

// Public, anonymous provider request: never send the application's auth headers.
export async function getMenuExchangeRate(quote: MenuExchangeCurrency): Promise<MenuExchangeRate> {
  const cacheKey = menuExchangeCacheKey(quote);
  let cached: MenuExchangeRate | null = null;
  try {
    const raw = await AsyncStorage.getItem(cacheKey);
    if (raw) {
      const stored = JSON.parse(raw);
      const rate = parseRate(stored, quote);
      if (rate && typeof stored.fetchedAt === 'number' && Number.isFinite(stored.fetchedAt)
        && stored.fetchedAt > 0 && stored.fetchedAt <= Date.now()) {
        cached = { ...rate, fetchedAt: stored.fetchedAt };
      }
    }
  } catch { /* Storage failure must not block conversion. */ }

  if (cached && Date.now() - cached.fetchedAt < MENU_EXCHANGE_CACHE_MS) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(`https://api.frankfurter.dev/v2/rate/KRW/${quote}`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Exchange rate request failed: ${response.status}`);
    const rate = parseRate(await response.json(), quote);
    if (!rate) throw new Error('Invalid exchange rate response');
    const result = { ...rate, fetchedAt: Date.now() };
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(result));
    } catch { /* The rate remains usable if persistence fails. */ }
    return result;
  } catch (error) {
    // Keep the original reference date so a stale rate cannot look like today's rate.
    if (cached) return cached;
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
