import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMenuExchangeRate, menuExchangeCacheKey, MENU_EXCHANGE_CACHE_MS } from '../menuExchangeRateApi';

const rate = { base: 'KRW', quote: 'USD', date: '2026-09-01', rate: 0.00074 };

describe('menu exchange rate cache', () => {
  const originalFetch = globalThis.fetch;
  beforeEach(async () => {
    await AsyncStorage.clear();
    globalThis.fetch = jest.fn();
  });
  afterEach(() => { globalThis.fetch = originalFetch; });

  test('fetches anonymous rates and reuses the persisted cache', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => rate });
    const first = await getMenuExchangeRate('USD');
    expect(first.rate * 9000).toBeCloseTo(6.66);
    expect(await getMenuExchangeRate('USD')).toEqual(first);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith('https://api.frankfurter.dev/v2/rate/KRW/USD', {
      signal: expect.anything(),
    });
  });

  test('keeps the old reference date after a refresh fails', async () => {
    const cached = { ...rate, fetchedAt: Date.now() - MENU_EXCHANGE_CACHE_MS - 1 };
    await AsyncStorage.setItem(menuExchangeCacheKey('USD'), JSON.stringify(cached));
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('offline'));
    expect(await getMenuExchangeRate('USD')).toEqual(cached);
  });

  test('isolates cached rates by target currency', async () => {
    await AsyncStorage.setItem(menuExchangeCacheKey('USD'), JSON.stringify({ ...rate, fetchedAt: Date.now() }));
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ ...rate, quote: 'JPY', rate: 0.116 }) });
    expect((await getMenuExchangeRate('JPY')).quote).toBe('JPY');
    expect(globalThis.fetch).toHaveBeenCalledWith('https://api.frankfurter.dev/v2/rate/KRW/JPY', expect.anything());
    expect((await getMenuExchangeRate('USD')).rate).toBe(rate.rate);
  });

  test.each([
    { ...rate, rate: -1 }, { ...rate, base: 'USD', quote: 'KRW' },
    { ...rate, date: '2026-02-30' }, { ...rate, date: '2999-01-01' },
  ])('rejects invalid provider data %j', async (invalid) => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => invalid });
    await expect(getMenuExchangeRate('USD')).rejects.toThrow('Invalid exchange rate response');
    expect(await AsyncStorage.getItem(menuExchangeCacheKey('USD'))).toBeNull();
  });
});
