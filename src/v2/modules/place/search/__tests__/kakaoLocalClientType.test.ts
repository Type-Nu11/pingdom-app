import { getAddressFromCoordinate, searchKakaoLocalPlaces } from '../api/kakaoLocalApi';

jest.mock('../../../../shared/config', () => {
  const actual = jest.requireActual('../../../../shared/config');
  return { ...actual, env: { ...actual.env, kakaoRestApiKey: 'kakao-test-key' } };
});

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('카카오 로컬 API 요청에는 핑덤 전용 X-Client-Type 헤더를 보내지 않는다', async () => {
  const fetchMock = jest.fn(async () => new Response(
    JSON.stringify({ documents: [] }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  ));
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  await getAddressFromCoordinate(37.5, 127.0);
  await searchKakaoLocalPlaces('카페', { centerLat: 37.5, centerLng: 127.0 });

  expect(fetchMock.mock.calls.length).toBeGreaterThan(0);
  for (const [url, init] of fetchMock.mock.calls as unknown as Array<[string, RequestInit | undefined]>) {
    expect(url).toMatch(/^https:\/\/dapi\.kakao\.com\//);
    const headerNames = Object.keys((init?.headers ?? {}) as Record<string, string>)
      .map(name => name.toLowerCase());
    expect(headerNames).toContain('authorization');
    expect(headerNames).not.toContain('x-client-type');
  }
});
