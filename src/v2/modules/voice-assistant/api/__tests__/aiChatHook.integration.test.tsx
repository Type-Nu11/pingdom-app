import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureApiTransport, type ApiTransport } from '../../../../shared/api';
import * as hooks from '../../hooks/useVoiceCommands';

const original = AppState.currentState;
beforeEach(() => { (AppState as { currentState: string }).currentState = 'active'; });
afterEach(() => { (AppState as { currentState: string }).currentState = original; });

test.each([[false, false], [false, true], [true, false], [true, true]])('real chat tool execution retains place cards when follow-up fails=%s provider=%s', async (fails, provider) => {
  let posts = 0;
  const requests: { path: string; body: unknown }[] = [];
  const restore = configureApiTransport({
    post: async (path: string, body: unknown) => {
      requests.push({ path, body }); posts++;
      if (posts === 2 && fails) throw new Error('network offline');
      const answer = posts === 1
        ? { content: null, tool_calls: [{ id: 'call-1', type: 'function', function: { name: 'searchNearbyPlaces', arguments: provider ? '{"keyword":"갈비탕","limit":3}' : { keyword: '갈비탕', limit: 3 } } }] }
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
