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

  // coord2address + keyword + address + keyword retry without center (empty nearby results)
  expect(fetchMock).toHaveBeenCalledTimes(4);
  for (const [url, init] of fetchMock.mock.calls as unknown as Array<[string, RequestInit | undefined]>) {
    expect(url).toMatch(/^https:\/\/dapi\.kakao\.com\//);
    const headers = new Headers(init?.headers);
    expect(headers.has('authorization')).toBe(true);
    expect(headers.has('x-client-type')).toBe(false);
  }
});
