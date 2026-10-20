import { act, renderHook } from '@testing-library/react-native';
import { useMapGlassActivity } from '../useMapGlassActivity';

const mockListeners = new Map<string, (event: { data: { closing: boolean } }) => void>();
const mockRemove = jest.fn();
const mockNavigation = { addListener: jest.fn((event: string, callback: (event: { data: { closing: boolean } }) => void) => {
  mockListeners.set(event, callback);
  return mockRemove;
}) };
jest.mock('@react-navigation/native', () => ({ useNavigation: () => mockNavigation }));
beforeEach(() => { mockListeners.clear(); });

test('전환 중 블러를 쉬고 지도 진입 애니메이션이 끝난 뒤 복원한다', async () => {
  const { result, rerender, unmount } = await renderHook(
    ({ focused }: { focused: boolean }) => useMapGlassActivity(focused),
    { initialProps: { focused: true } },
  );
  expect(result.current).toBe(true);
  await act(async () => mockListeners.get('transitionStart')?.({ data: { closing: true } }));
  expect(result.current).toBe(false);
  await rerender({ focused: false });
  await act(async () => mockListeners.get('transitionEnd')?.({ data: { closing: true } }));
  expect(result.current).toBe(false);
  await rerender({ focused: true });
  expect(result.current).toBe(false);
  await act(async () => mockListeners.get('transitionEnd')?.({ data: { closing: false } }));
  expect(result.current).toBe(true);
  await unmount();
  expect(mockRemove).toHaveBeenCalledTimes(2);
});
