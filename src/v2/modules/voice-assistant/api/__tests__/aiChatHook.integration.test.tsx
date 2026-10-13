import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureApiTransport, type ApiTransport } from '../../../../shared/api';
import * as hooks from '../../hooks/useVoiceCommands';

const original = AppState.currentState;
beforeEach(() => { (AppState as { currentState: string }).currentState = 'active'; });
afterEach(() => { (AppState as { currentState: string }).currentState = original; });

test('editing a follow-up preserves verified places referenced by the existing chat', async () => {
  let posts = 0;
  const gets: string[] = [];
  const place = { id: 70095, name: '용짬뽕', address: '대구 실제 주소', touristCategories: [], operatingStatus: 'OPERATING' };
  const restore = configureApiTransport({
    get: async (path: string) => { gets.push(path); return { data: path === '/places' ? { places: [place] } : place }; },
    post: async () => {
      posts++;
      const call = posts === 1 ? { name: 'searchNearbyPlaces', arguments: '{"keyword":"용짬뽕"}' }
        : posts === 3 ? { name: 'getPlaceDetails', arguments: '{"placeId":70095}' } : null;
      return { data: JSON.stringify({ object: 'chat.completion', choices: [{ index: 0,
        message: { role: 'assistant', content: call ? null : '확인했습니다.', ...(call ? { tool_calls: [{ id: `follow-up-${posts}`, type: 'function', function: call }] } : {}) },
        finish_reason: call ? 'tool_calls' : 'stop' }] }) };
    },
  } as unknown as ApiTransport);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const view = await renderHook(() => hooks.useVoiceCommands({ accountRevision: 'user', location: { latitude: 35.8, longitude: 128.6 },
    locationPermission: 'granted', radiusKm: 5, timezone: 'Asia/Seoul', placeListEnabled: true }), { wrapper });
  try {
    await act(async () => { await view.result.current.onFinalInput({ text: '용짬뽕 찾아', source: 'text', signal: new AbortController().signal }); });
    await act(() => view.result.current.dismissFeedback());
    expect(view.result.current.commandState.phase).toBe('idle');
    await act(async () => { await view.result.current.onFinalInput({ text: '그곳 상세정보 보여줘', source: 'text', signal: new AbortController().signal }); });
    expect(view.result.current.commandState).toMatchObject({ phase: 'result', result: {
      command: 'getPlaceDetails', outcome: { status: 'succeeded', data: { place: { id: 70095 } } },
    } });
    expect(gets).toEqual(['/places', '/places/70095']);
    expect(client.getMutationCache().getAll()).toHaveLength(0);
  } finally { await view.unmount(); client.clear(); restore(); }
});

test.each([0, 1, 3])('provider tool flow retains exactly %s place API results for cards and sends the outcome back', async count => {
  let posts = 0;
  const rows = Array.from({ length: count }, (_, index) => ({ id: 70095 + index, name: `API 장소 ${index + 1}`,
    address: `API 주소 ${index + 1}`, category: 'RESTAURANT', touristCategories: [], operatingStatus: 'OPERATING', distanceMeters: 822 + index * 1000 }));
  const search = jest.fn(async () => ({ data: { places: rows } }));
  const requests: any[] = [];
  const restore = configureApiTransport({
    get: search,
    post: async (_path: string, body: any) => {
      requests.push(body); posts++;
      return { data: JSON.stringify({ object: 'chat.completion', choices: [{ index: 0, message: posts === 1
        ? { role: 'assistant', content: null, tool_calls: [{ id: 'search-count', type: 'function', function: { name: 'searchNearbyPlaces', arguments: '{"category":"RESTAURANT"}' } }] }
        : { role: 'assistant', content: count ? '주변에서 찾았어요. 카드에서 확인해 보세요.' : '이번 검색에서는 결과를 찾지 못했어요.' },
      finish_reason: posts === 1 ? 'tool_calls' : 'stop' }] }) };
    },
  } as unknown as ApiTransport);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const view = await renderHook(() => hooks.useVoiceCommands({ accountRevision: 'user', location: { latitude: 35.8, longitude: 128.6 },
    locationPermission: 'granted', radiusKm: 5, timezone: 'Asia/Seoul', placeListEnabled: true }), { wrapper });
  try {
    await act(async () => { await view.result.current.onFinalInput({ text: '주변 음식점', source: 'text', signal: new AbortController().signal }); });
    expect(search).toHaveBeenCalledWith('/places', expect.objectContaining({ params: expect.objectContaining({ category: 'RESTAURANT', latitude: 35.8, longitude: 128.6, radiusKm: 5, limit: 3 }) }));
    const state = view.result.current.commandState;
    expect(state.phase).toBe('result');
    if (state.phase !== 'result' || state.result.outcome.status !== 'succeeded' || state.result.command !== 'searchNearbyPlaces') throw new Error('Expected successful place search');
    expect(state.result.outcome.data.places.map(place => ({ id: place.id, name: place.name, address: place.address, distanceMeters: place.distanceMeters })))
      .toEqual(rows.map(({ id, name, address, distanceMeters }) => ({ id, name, address, distanceMeters })));
    expect(requests).toHaveLength(2);
    const outcome = JSON.parse(requests[1].messages.find((message: any) => message.role === 'tool').content);
    expect(outcome.status).toBe('succeeded');
    expect(outcome.data.places).toHaveLength(count);
    if (count) expect(state.text).toBe('주변에서 찾았어요. 카드에서 확인해 보세요.');
    else expect(state.text).toBeUndefined();
    expect(client.getMutationCache().getAll()).toHaveLength(0);
  } finally { await view.unmount(); client.clear(); restore(); }
});

test.each([[false, false], [false, true], [true, false], [true, true]])('real chat tool execution retains place cards when follow-up fails=%s provider=%s', async (fails, provider) => {
  let posts = 0;
  const requests: { path: string; body: unknown }[] = [];
  const restore = configureApiTransport({
    post: async (path: string, body: unknown) => {
      requests.push({ path, body }); posts++;
      if (posts === 2 && fails) throw new Error('network offline');
      const answer = posts === 1
        ? { content: null, tool_calls: [{ id: 'call-1', type: 'function', function: { name: 'searchNearbyPlaces', arguments: provider ? '{"keyword":"갈비탕"}' : { keyword: '갈비탕' } } }] }
        : { content: '갈비탕 식당을 찾았습니다.', tool_calls: [] };
      return { data: JSON.stringify(provider ? { object: 'chat.completion', choices: [{ index: 0,
        message: { role: 'assistant', ...answer }, finish_reason: posts === 1 ? 'tool_calls' : 'stop' }] } : answer) };
    },
    get: async () => ({ data: { places: [{ id: 1, name: '갈비탕 식당', address: '대구', touristCategories: ['FOOD'], operatingStatus: 'OPERATING' }] } }),
  } as unknown as ApiTransport);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  const view = await renderHook(() => hooks.useVoiceCommands({ accountRevision: 'user', location: { latitude: 35.8, longitude: 128.6 },
    locationPermission: 'granted', radiusKm: 5, timezone: 'Asia/Seoul', placeListEnabled: true }), { wrapper });
  try {
    await act(async () => { await view.result.current.onFinalInput({ text: '갈비탕집 있어?', source: 'text', signal: new AbortController().signal }); });
    expect(view.result.current.commandState).toMatchObject({ phase: 'result', result: { command: 'searchNearbyPlaces', outcome: { status: 'succeeded', data: { places: [{ name: '갈비탕 식당' }] } } } });
    if (fails) expect(view.result.current.commandState).toHaveProperty('followUpError');
    else expect(view.result.current.commandState).toHaveProperty('text', '갈비탕 식당을 찾았습니다.');
    expect(requests.map(r => r.path)).toEqual(['/ai/chat', '/ai/chat']);
    expect(queryClient.getMutationCache().getAll()).toHaveLength(0);
  } finally { await view.unmount(); queryClient.clear(); restore(); }
});

test.each(['empty', 'failed'] as const)('a %s search never presents an AI claim of database absence', async kind => {
  let posts = 0;
  const outcomes: unknown[] = [];
  const restore = configureApiTransport({
    post: async (_path: string, body: any) => {
      posts++;
      const toolMessage = body.messages.find((m: any) => m.role === 'tool');
      if (toolMessage) outcomes.push(toolMessage.content);
      return { data: JSON.stringify(posts === 1
        ? { content: null, tool_calls: [{ id: 'safe-1', type: 'function', function: { name: 'searchNearbyPlaces', arguments: { keyword: '용짬뽕', touristCategory: 'FOOD' } } }] }
        : { content: '용짬뽕은 데이터베이스에 없습니다.', tool_calls: [] }) };
    },
    get: async (path: string, options: any) => {
      expect(path).toBe('/places');
      expect(options.params).not.toHaveProperty('touristCategory');
      if (kind === 'failed') throw { isAxiosError: true, message: 'failed', response: { status: 404, data: { code: 'RESOURCE_NOT_FOUND' } } };
      return { data: { places: [] } };
    },
  } as unknown as ApiTransport);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const view = await renderHook(() => hooks.useVoiceCommands({ accountRevision: 'user', location: { latitude: 35.8, longitude: 128.6 },
    locationPermission: 'granted', radiusKm: 5, timezone: 'Asia/Seoul', placeListEnabled: true }), { wrapper });
  try {
    await act(async () => { await view.result.current.onFinalInput({ text: '용짬뽕 찾아', source: 'text', signal: new AbortController().signal }); });
    expect(posts).toBe(2);
    expect(outcomes).toEqual([kind === 'failed' ? { status: 'rejected', code: 'INVALID_SERVER_RESPONSE' }
      : { status: 'succeeded', data: { places: [], coverage: 'nearest_places' } }]);
    expect(view.result.current.commandState).not.toHaveProperty('text');
  } finally { await view.unmount(); client.clear(); restore(); }
});
