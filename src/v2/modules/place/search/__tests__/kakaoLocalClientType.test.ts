import { act, renderHook } from '@testing-library/react-native';
import { createTestWrapper } from '../../../../app/testing/testProviders';
import { useKakaoLocalSearch } from '../hooks/useKakaoLocalSearch';

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

test('clearing or leaving search aborts both requests and discards late replies', async () => {
  type Pending = { signal: AbortSignal; finish: (response: Response) => void };
  const pending: Pending[] = [];
  globalThis.fetch = jest.fn((_url: URL | RequestInfo, init?: RequestInit) => new Promise<Response>(finish => {
    pending.push({ finish, signal: init?.signal as AbortSignal });
  }));
  const { wrapper } = await createTestWrapper();
  const view = await renderHook(useKakaoLocalSearch, { wrapper });
  const empty = () => new Response(JSON.stringify({ documents: [] }));

  let first!: Promise<void>;
  let second!: Promise<void>;
  await act(() => {
    first = view.result.current.searchPlaces('카페', { centerLat: 37.5, centerLng: 127 });
  });
  expect(pending).toHaveLength(2);
  await act(() => {
    view.result.current.clearSearchResults();
    second = view.result.current.searchPlaces('식당', {});
  });
  expect(pending).toHaveLength(4);
  expect(pending.slice(0, 2).every(({ signal }) => signal.aborted)).toBe(true);

  await act(async () => {
    pending[0].finish(empty());
    pending[1].finish(empty());
    await first;
  });
  expect(pending).toHaveLength(4);
  expect(view.result.current.isSearchingAddress).toBe(true);
  expect(view.result.current.searchStatusMessage).toBe('');

  await view.unmount();
  expect(pending.slice(2).every(({ signal }) => signal.aborted)).toBe(true);
  pending[2].finish(empty());
  pending[3].finish(empty());
  await second;
});
