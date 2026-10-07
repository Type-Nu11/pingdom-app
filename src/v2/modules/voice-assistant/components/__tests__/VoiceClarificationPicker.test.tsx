import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../app/testing/testProviders';
import { VoiceClarificationPicker, localPickerDate } from '../VoiceClarificationPicker';

test('calendar uses request timezone and refuses past dates and an empty confirmation', async () => {
  const confirm = jest.fn();
  expect(localPickerDate('Asia/Seoul', new Date('2026-10-04T16:00:00Z'))).toBe('2026-10-05');
  const today = localPickerDate('Asia/Seoul');
  await renderWithProviders(<VoiceClarificationPicker field="date" timezone="Asia/Seoul" onConfirm={confirm} />);
  expect(screen.getByRole('button', { name: '선택 확인' })).toBeDisabled();
  const [year, month, day] = today.split('-').map(Number);
  if (day > 1) {
    const past = `${year}-${String(month).padStart(2, '0')}-${String(day - 1).padStart(2, '0')}`;
    expect(screen.getByRole('button', { name: past })).toBeDisabled();
  }
  await fireEvent.press(screen.getByRole('button', { name: today }));
  expect(confirm).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole('button', { name: '선택 확인' }));
  expect(confirm).toHaveBeenCalledWith({ field: 'date', value: today });
  await fireEvent.press(screen.getByRole('button', { name: '다음 달' }));
  const next = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
  expect(screen.getByRole('button', { name: next })).toBeVisible();
});

test('time selection confirms one visiting time without inventing an end time or asking twice', async () => {
  const confirm = jest.fn();
  await renderWithProviders(<VoiceClarificationPicker field="timeRange" timezone="Asia/Seoul" onConfirm={confirm} />);
  await fireEvent.press(screen.getByRole('button', { name: '3시' }));
  await fireEvent.press(screen.getByRole('button', { name: '30분' }));
  expect(confirm).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole('button', { name: '선택 확인' }));
  expect(confirm).toHaveBeenCalledWith({ field: 'timeRange', value: '15:30' });
  expect(screen.getByRole('header')).toHaveTextContent('몇 시쯤 방문하시나요?');
  expect(screen.queryByText('몇 시까지 이용하시나요?')).toBeNull();
});

test('quantity respects Booking limits and disabled pickers cannot submit', async () => {
  const confirm = jest.fn();
  const view = await renderWithProviders(<VoiceClarificationPicker field="quantity" timezone="Asia/Seoul" initialValue="1" onConfirm={confirm} />);
  expect(screen.getByRole('button', { name: '1명' })).toHaveProp('accessibilityState', { selected: true, disabled: false });
  expect(screen.queryByRole('button', { name: '13명' })).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: '12명' }));
  expect(screen.getByRole('button', { name: '12명' })).toHaveProp('accessibilityState', { selected: true, disabled: false });
  expect(screen.getByRole('button', { name: '선택 확인' })).toHaveTextContent('12명 확인');
  await view.rerender(<VoiceClarificationPicker field="quantity" timezone="Asia/Seoul" disabled onConfirm={confirm} />);
  await fireEvent.press(screen.getByRole('button', { name: '선택 확인' }));
  expect(confirm).not.toHaveBeenCalled();
});


test('wheel blocks confirmation while moving and settles the displayed value before time submission', async () => {
  const confirm = jest.fn();
  await renderWithProviders(<VoiceClarificationPicker field="timeRange" timezone="Asia/Seoul" onConfirm={confirm} />);
  const hours = screen.getByTestId('voice-time-hour');
  await fireEvent(hours, 'scrollBeginDrag');
  expect(screen.getByRole('button', { name: '선택 확인' })).toBeDisabled();
  await fireEvent(hours, 'momentumScrollEnd', { nativeEvent: { contentOffset: { y: 15 * 34 } } });
  expect(screen.getByRole('button', { name: '선택 확인' })).toHaveTextContent('오후 3시 확인');
  await fireEvent.press(screen.getByRole('button', { name: '선택 확인' }));
  expect(confirm).toHaveBeenCalledWith({ field: 'timeRange', value: '15:00' });
});


test('calendar selection keeps the same fixed circular fill when selecting and returning to the month', async () => {
  const today = localPickerDate('Asia/Seoul');
  await renderWithProviders(<VoiceClarificationPicker field="date" timezone="Asia/Seoul" onConfirm={jest.fn()} />);
  expect(screen.queryByTestId(`voice-date-selection-${today}`)).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: today }));
  const selection = () => screen.getByTestId(`voice-date-selection-${today}`);
  expect(selection()).toHaveStyle({ width: 36, height: 36, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 });
  await fireEvent.press(screen.getByRole('button', { name: '다음 달' }));
  expect(screen.queryByTestId(`voice-date-selection-${today}`)).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: '이전 달' }));
  expect(selection()).toHaveStyle({ width: 36, height: 36, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 });
  expect(screen.getByRole('button', { name: today })).toHaveProp('accessibilityState', { selected: true, disabled: false });
});
