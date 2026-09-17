import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { useVoiceSession } from '../useVoiceSession';
import { createVoiceSessionApi } from '../../api/voiceSessionApi';

jest.mock('../../api/voiceSessionApi', () => ({ createVoiceSessionApi: jest.fn() }));
const factory = jest.mocked(createVoiceSessionApi);
const original = AppState.currentState;
beforeEach(() => { (AppState as { currentState: string }).currentState = 'active'; });
afterEach(() => { (AppState as { currentState: string }).currentState = original; });

test('account change/logout, background and unmount invalidate owned session and remove listeners', async () => {
  const callbacks = new Map<string, (value: AppStateStatus) => void>();
  const remove = jest.fn();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((event, callback) => {
    callbacks.set(event, callback); return { remove };
  });
  factory.mockImplementation(() => ({
    create: jest.fn().mockResolvedValue({ sessionId: 's', expiresAt: new Date(Date.now() + 300_000).toISOString() }),
    send: jest.fn(), refresh: jest.fn(), close: jest.fn(),
  }));
  const consume = jest.fn();
  const hook = await renderHook(({ account }: { account: string | null }) => useVoiceSession(account, consume), { initialProps: { account: 'one' as string | null } });
  await act(async () => { await hook.result.current.controller.start(); });
  const old = hook.result.current.controller;
  await hook.rerender({ account: 'two' }); expect(old.getSnapshot().phase).toBe('closed');
  await act(async () => { await hook.result.current.controller.start(); });
  await act(() => callbacks.get('change')?.('background'));
  expect(hook.result.current.state.phase).toBe('closed');
  await hook.rerender({ account: null });
  await expect(hook.result.current.controller.start()).rejects.toThrow('AUTHENTICATION_REQUIRED');
  await hook.unmount(); expect(remove).toHaveBeenCalledTimes(9);
});
