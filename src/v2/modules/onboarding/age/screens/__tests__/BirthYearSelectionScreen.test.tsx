import React from 'react';
import { ScrollView } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../../app/testing/testProviders';
import BirthYearSelectionScreen from '../BirthYearSelectionScreen';

const eventAt = (y: number) => ({ nativeEvent: { contentOffset: { x: 0, y } } });
beforeEach(() => { jest.useFakeTimers(); });
afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); });

test('관성 스크롤이 끝난 위치를 정확한 연도 행에 맞춘 뒤 같은 값을 전달한다', async () => {
  const scrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo').mockImplementation(() => {});
  const onNext = jest.fn();
  await renderWithProviders(<BirthYearSelectionScreen onBack={jest.fn()} onNext={onNext} />);
  const wheel = screen.getByTestId('birth-year-wheel');
  expect(wheel.props.snapToInterval).toBeUndefined();
  expect(wheel.props.snapToOffsets[84]).toBe(5040);
  await fireEvent(wheel, 'scrollBeginDrag', eventAt(3600));
  await fireEvent(wheel, 'scrollEndDrag', eventAt(4985));
  await fireEvent(wheel, 'momentumScrollBegin', eventAt(4985));
  expect(screen.getByTestId('birth-year-continue')).toBeDisabled();
  await act(() => jest.advanceTimersByTime(200));
  expect(screen.getByTestId('birth-year-continue')).toBeDisabled();
  await fireEvent.scroll(wheel, eventAt(5063));
  await fireEvent(wheel, 'momentumScrollEnd', eventAt(5063));
  expect(scrollTo).toHaveBeenLastCalledWith({ y: 5040, animated: false });
  await fireEvent.press(screen.getByTestId('birth-year-continue'));
  expect(onNext).toHaveBeenCalledWith(2024);
});

test('관성 없는 짧은 드래그도 중앙 정렬하며 대기 중에는 다음 단계로 가지 않는다', async () => {
  const scrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo').mockImplementation(() => {});
  const onNext = jest.fn();
  await renderWithProviders(<BirthYearSelectionScreen onBack={jest.fn()} onNext={onNext} />);
  const wheel = screen.getByTestId('birth-year-wheel');
  await fireEvent(wheel, 'scrollBeginDrag', eventAt(3600));
  await fireEvent(wheel, 'scrollEndDrag', eventAt(3638));
  await fireEvent.press(screen.getByTestId('birth-year-continue'));
  expect(onNext).not.toHaveBeenCalled();
  await act(() => jest.advanceTimersByTime(120));
  expect(scrollTo).toHaveBeenLastCalledWith({ y: 3660, animated: false });
  await fireEvent.press(screen.getByTestId('birth-year-continue'));
  expect(onNext).toHaveBeenCalledWith(2001);
});

test('돌아왔을 때 기존 생년을 초기 위치로 사용하고 재렌더로 위치를 초기화하지 않는다', async () => {
  await renderWithProviders(<BirthYearSelectionScreen initialYear={1995} onBack={jest.fn()} onNext={jest.fn()} />);
  const initialOffset = screen.getByTestId('birth-year-wheel').props.contentOffset;
  expect(initialOffset).toEqual({ x: 0, y: 3300 });
  await fireEvent.scroll(screen.getByTestId('birth-year-wheel'), eventAt(3380));
  expect(screen.getByTestId('birth-year-wheel').props.contentOffset).toBe(initialOffset);
});

test.each([-120, 100000])('양 끝 경계를 넘는 스크롤도 유효한 연도에 맞춘다 (%s)', async y => {
  const scrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo').mockImplementation(() => {});
  const onNext = jest.fn();
  await renderWithProviders(<BirthYearSelectionScreen onBack={jest.fn()} onNext={onNext} />);
  await fireEvent(screen.getByTestId('birth-year-wheel'), 'momentumScrollEnd', eventAt(y));
  await fireEvent.press(screen.getByTestId('birth-year-continue'));
  const year = y < 0 ? 1940 : new Date().getFullYear();
  expect(onNext).toHaveBeenCalledWith(year);
  expect(scrollTo).toHaveBeenLastCalledWith({ y: (year - 1940) * 60, animated: false });
});
