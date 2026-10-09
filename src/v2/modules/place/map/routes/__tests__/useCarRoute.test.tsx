import { act, renderHook } from '@testing-library/react-native';
import { useCarRoute } from '../hooks/useCarRoute';
import { findCarRoute } from '../api/routesApi';
jest.mock('../api/routesApi', () => ({ findCarRoute: jest.fn() }));
const route = { path: [{ lat: 37.5, lng: 127 }, { lat: 37.6, lng: 127.1 }], distanceMeters: 1000, durationSeconds: 90 };

test('changing selection aborts pending I/O and discards late results, including returning to old selection', async () => {
  let selection = 'A'; let resolve!: (value: typeof route) => void;
  jest.mocked(findCarRoute).mockImplementationOnce(() => new Promise(yes => { resolve = yes; }));
  const { result, rerender } = await renderHook(() => useCarRoute(selection));
  await act(async () => { void result.current.request({}, {}); });
  const signal = jest.mocked(findCarRoute).mock.calls[0][2];
  selection = 'B'; await rerender(undefined);
  expect(signal.aborted).toBe(true);
  expect(result.current.state.kind).toBe('idle');
  await act(async () => resolve(route));
  expect(result.current.state.kind).toBe('idle');
  selection = 'A'; await rerender(undefined);
  expect(result.current.state.kind).toBe('idle');
});
test('leaving the screen aborts the request even if the transport ignores abort', async () => {
  let resolve!: (value: typeof route) => void;
  jest.mocked(findCarRoute).mockImplementationOnce(() => new Promise(yes => { resolve = yes; }));
  const { result, unmount } = await renderHook(() => useCarRoute('A'));
  await act(async () => { void result.current.request({}, {}); });
  const signal = jest.mocked(findCarRoute).mock.calls[0][2];
  await unmount();
  expect(signal.aborted).toBe(true);
  await act(async () => resolve(route));
});
