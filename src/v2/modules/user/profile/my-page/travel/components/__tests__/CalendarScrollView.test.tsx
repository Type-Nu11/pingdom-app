import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import { renderWithProviders } from '../../../../../../../app/testing/testProviders';
import CalendarScrollView from '../../../../../../../shared/components/CalendarScrollView';
import TravelCalendar from '../TravelCalendar';

const calendar = <TravelCalendar highlightedRange={null} initialMonth={{ month: 10, year: 2026 }} onDatePress={jest.fn()} onRangeSelect={jest.fn()} />;

test.each(['touchEnd', 'touchCancel', 'responderTerminate'])('길게 누른 동안 부모 스크롤을 잠그고 %s에서 복원한다', async (event) => {
  const native = jest.spyOn(ScrollView.prototype, 'setNativeProps');
  await renderWithProviders(<CalendarScrollView testID="calendar-parent">{calendar}</CalendarScrollView>);
  expect(screen.getByTestId('calendar-parent')).toHaveProp('scrollEnabled', true);
  await fireEvent(screen.getByTestId('v2-my-page-calendar-day-2026-10-24'), 'longPress');
  expect(native).toHaveBeenCalledWith({ scrollEnabled: false });
  expect(screen.getByTestId('calendar-parent')).toHaveProp('scrollEnabled', false);
  expect(screen.getByTestId('calendar-parent')).toHaveProp('canCancelContentTouches', false);
  await fireEvent(screen.getByTestId('v2-my-page-calendar-grid'), event, { nativeEvent: { pageX: -1, pageY: -1 } });
  expect(screen.getByTestId('calendar-parent')).toHaveProp('scrollEnabled', true);
  native.mockRestore();
});

test('짧은 터치는 화면 스크롤을 잠그지 않는다', async () => {
  await renderWithProviders(<CalendarScrollView testID="calendar-parent">{calendar}</CalendarScrollView>);
  await fireEvent.press(screen.getByTestId('v2-my-page-calendar-day-2026-10-24'));
  expect(screen.getByTestId('calendar-parent')).toHaveProp('scrollEnabled', true);
});

test('달력이 닫히면 잠금을 해제하고 기존 scrollEnabled=false는 유지한다', async () => {
  const ui = (visible: boolean, enabled = true) => <CalendarScrollView testID="calendar-parent" scrollEnabled={enabled}>{visible ? calendar : null}</CalendarScrollView>;
  const view = await renderWithProviders(ui(true));
  await fireEvent(screen.getByTestId('v2-my-page-calendar-day-2026-10-24'), 'longPress');
  await view.rerender(ui(false));
  expect(screen.getByTestId('calendar-parent')).toHaveProp('scrollEnabled', true);
  await view.rerender(ui(true, false));
  await fireEvent(screen.getByTestId('v2-my-page-calendar-day-2026-10-24'), 'longPress');
  await fireEvent(screen.getByTestId('v2-my-page-calendar-grid'), 'touchCancel');
  expect(screen.getByTestId('calendar-parent')).toHaveProp('scrollEnabled', false);
});
