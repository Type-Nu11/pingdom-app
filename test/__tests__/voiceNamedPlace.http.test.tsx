import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppState } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { createTestI18n } from '../../src/v2/app/testing/testProviders';
import { ApiError, configureApiTransport, type ApiTransport } from '../../src/v2/shared/api';
import { useVoiceCommands } from '../../src/v2/modules/voice-assistant/hooks/useVoiceCommands';

type HttpResponse = { statusCode?: number; setEncoding: (encoding: string) => void;
  on: (event: string, listener: (chunk: string) => void) => void };
type Options = { signal?: AbortSignal; params?: Record<string, string | number | boolean | null | undefined> };
const http = require('node:http') as { request: (url: URL, options: object, listener: (response: HttpResponse) => void) => {
  on: (event: string, listener: (error: Error) => void) => void; end: (body?: string) => void;
} };
const simulationUrl = process.env.PINGDOM_RESERVATION_SIM_URL;
const simulate = simulationUrl ? test : test.skip;
const originalState = AppState.currentState;
beforeEach(() => { (AppState as { currentState: string }).currentState = 'active'; });
afterEach(() => { (AppState as { currentState: string }).currentState = originalState; });

type RecordedRequest = { method: string; url: URL };
function installSimulationTransport(requests: RecordedRequest[]) {
  const request = (method: string, path: string, body?: unknown, options?: Options) => new Promise((resolve, reject) => {
    const url = new URL(`${simulationUrl}${path}`);
    for (const [key, value] of Object.entries(options?.params ?? {})) if (value != null) url.searchParams.set(key, String(value));
    requests.push({ method, url });
    const call = http.request(url, { method, signal: options?.signal, headers: { 'Content-Type': 'application/json' } }, response => {
      let raw = ''; response.setEncoding('utf8');
      response.on('data', chunk => { raw += chunk; });
      response.on('end', () => {
        try {
          if (response.statusCode !== 200) throw new ApiError('Simulation request failed', { status: response.statusCode });
          resolve({ data: method === 'POST' ? raw : JSON.parse(raw) });
        } catch (error) { reject(error); }
      });
    });
    call.on('error', reject); call.end(body === undefined ? undefined : JSON.stringify(body));
  });
  return configureApiTransport({ get: (path: string, options?: Options) => request('GET', path, undefined, options),
    post: (path: string, body?: unknown, options?: Options) => request('POST', path, body, options) } as unknown as ApiTransport);
}

simulate.each([false, true])('실제 HTTP: 이름 조회 후 %s 페이지 이동 여부를 GPS 없이 처리한다', async opensPage => {
  const requests: RecordedRequest[] = [];
  const restore = installSimulationTransport(requests);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const i18n = await createTestI18n('ko');
  const wrapper = ({ children }: { children: React.ReactNode }) => <I18nextProvider i18n={i18n}><QueryClientProvider client={client}>{children}</QueryClientProvider></I18nextProvider>;
  const navigateToPage = jest.fn(() => true);
  const view = await renderHook(() => useVoiceCommands({ accountRevision: 'simulation-user', location: null,
    locationPermission: 'denied', radiusKm: 5, timezone: 'Asia/Seoul', placeListEnabled: true, navigateToPage }), { wrapper });
  try {
    await act(async () => { await view.result.current.onFinalInput({ text: opensPage ? '용짬뽕 페이지 가줘' : '용짬뽕 찾아줘',
      source: 'text', signal: new AbortController().signal }); });
    if (opensPage) expect(navigateToPage).toHaveBeenCalledWith({ page: 'placeDetail', placeId: 70095 });
    else {
      expect(navigateToPage).not.toHaveBeenCalled();
      expect(view.result.current.commandState).toMatchObject({ phase: 'result', text: '요청하신 장소를 찾았어요.',
        result: { command: 'searchNearbyPlaces', outcome: { status: 'succeeded', data: { places: [{ id: 70095, name: '용짬뽕' }], search: { scope: 'catalog_name' } } } } });
    }
    const list = requests.find(item => item.url.pathname === '/booking/places');
    expect(list?.method).toBe('GET');
    expect(Object.fromEntries(list!.url.searchParams)).toEqual({ page: '1', limit: '12', keyword: '용짬뽕' });
    expect(requests.filter(item => item.url.pathname === '/booking/places/70095')).toHaveLength(opensPage ? 2 : 1);
    expect(requests.filter(item => item.method === 'POST').map(item => item.url.pathname)).toEqual(['/booking/ai/chat', '/booking/ai/chat']);
    expect(client.getMutationCache().getAll()).toHaveLength(0);
  } finally { await view.unmount(); client.clear(); restore(); }
});
