import { act, renderHook } from '@testing-library/react-native';
import { useMapAssistantEntry } from '../useMapAssistantEntry';

test('repeated synchronous open calls claim one session; close releases the claim', async () => {
  const { result } = await renderHook(() => useMapAssistantEntry(true, true));
  const open = result.current.open;
  await act(() => { open(); open(); open(); });
  expect(result.current.isOpen).toBe(true);
  await act(() => result.current.close());
  expect(result.current.isOpen).toBe(false);
  await act(() => open());
  expect(result.current.isOpen).toBe(true);
});

test.each([[false, true], [true, false]])('disabled/unfocused entry rejects even direct handler calls', async (enabled, focused) => {
  const { result } = await renderHook(() => useMapAssistantEntry(enabled, focused));
  await act(() => result.current.open());
  expect(result.current.isOpen).toBe(false);
});
