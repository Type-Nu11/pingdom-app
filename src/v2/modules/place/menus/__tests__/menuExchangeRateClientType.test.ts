import AsyncStorage from '@react-native-async-storage/async-storage';

import { getMenuExchangeRate } from '../api/menuExchangeRateApi';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('환율 API 요청에는 핑덤 전용 X-Client-Type 헤더를 보내지 않는다', async () => {
  const fetchMock = jest.fn(async () => new Response(
    JSON.stringify({ base: 'KRW', quote: 'USD', rate: 0.00072, date: '2026-01-02' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  ));
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  await AsyncStorage.clear();

  await expect(getMenuExchangeRate('USD')).resolves.toMatchObject({ quote: 'USD' });

  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit | undefined];
  expect(url).toMatch(/^https:\/\/api\.frankfurter\.dev\//);
  expect(new Headers(init?.headers).has('x-client-type')).toBe(false);
});
