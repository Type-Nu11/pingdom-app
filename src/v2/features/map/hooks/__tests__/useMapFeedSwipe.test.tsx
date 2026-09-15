import { act, renderHook } from '@testing-library/react-native';
import { useState } from 'react';
import type { GestureResponderEvent } from 'react-native';

import { useMapFeedSwipe } from '../useMapFeedSwipe';

const touch = (x: number, y: number, count = 1) => ({
  nativeEvent: { pageX: x, pageY: y, touches: Array.from({ length: count }, () => ({ pageX: x, pageY: y })) },
}) as GestureResponderEvent;

const setup = () => renderHook(() => {
  const [feed, setFeed] = useState<'local' | 'national'>('local');
  return { feed, ...useMapFeedSwipe(feed, setFeed) };
});

test('오른쪽은 전국, 왼쪽은 지역으로 전환하고 끝에서 순환하지 않는다', async () => {
  const { result } = await setup();
  const swipe = async (end: number) => {
    result.current.panHandlers.onStartShouldSetResponderCapture?.(touch(200, 100));
    expect(result.current.panHandlers.onMoveShouldSetResponderCapture?.(touch(end, 102))).toBe(true);
    await act(() => result.current.panHandlers.onResponderRelease?.(touch(end, 102, 0)));
  };
  await swipe(300);
  expect(result.current.feed).toBe('national');
  await swipe(300);
  expect(result.current.feed).toBe('national');
  await swipe(100);
  expect(result.current.feed).toBe('local');
});

test('세로·대각선·멀티터치 및 짧은 움직임은 피드를 변경하지 않는다', async () => {
  const { result } = await setup();
  for (const event of [touch(205, 190), touch(250, 150), touch(100, 100, 2), touch(195, 100)]) {
    result.current.panHandlers.onStartShouldSetResponderCapture?.(touch(200, 100));
    expect(result.current.panHandlers.onMoveShouldSetResponderCapture?.(event)).toBe(false);
  }
  result.current.panHandlers.onStartShouldSetResponderCapture?.(touch(200, 100));
  await act(() => result.current.panHandlers.onResponderRelease?.(touch(180, 100, 0)));
  expect(result.current.feed).toBe('local');
});

test('가로 목록에서 시작한 터치를 가로채지 않고 다음 제스처에서는 전환한다', async () => {
  const { result } = await setup();
  result.current.panHandlers.onStartShouldSetResponderCapture?.(touch(200, 100));
  result.current.blockHorizontalSwipe();
  expect(result.current.panHandlers.onMoveShouldSetResponderCapture?.(touch(300, 100))).toBe(false);
  await act(() => result.current.panHandlers.onResponderRelease?.(touch(300, 100, 0)));
  expect(result.current.feed).toBe('local');
  result.current.panHandlers.onStartShouldSetResponderCapture?.(touch(200, 100));
  expect(result.current.panHandlers.onMoveShouldSetResponderCapture?.(touch(300, 100))).toBe(true);
  await act(() => result.current.panHandlers.onResponderRelease?.(touch(300, 100, 0)));
  expect(result.current.feed).toBe('national');
});

test('제스처 취소 후 release가 와도 전환하지 않는다', async () => {
  const { result } = await setup();
  result.current.panHandlers.onStartShouldSetResponderCapture?.(touch(200, 100));
  result.current.panHandlers.onResponderTerminate?.(touch(100, 100));
  await act(() => result.current.panHandlers.onResponderRelease?.(touch(100, 100, 0)));
  expect(result.current.feed).toBe('local');
});
