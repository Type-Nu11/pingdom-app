import React from 'react';
import { View, type MeasureOnSuccessCallback } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../app/testing/testProviders';
import OwnerContentActions from '../OwnerContentActions';

beforeEach(() => {
  jest.spyOn(View.prototype, 'measure').mockImplementation(callback => callback(0, 0, 44, 44, 330, 100));
});

test.each(['LIGHT', 'DARK'] as const)('%s 메뉴는 더보기 아래에 열리고 Figma 크기와 색상을 유지한다', async appearancePreference => {
  await renderWithProviders(<OwnerContentActions />, { appearancePreference });
  expect(screen.queryByTestId('owner-content-menu')).toBeNull();
  expect(screen.getByRole('button', { name: '더보기' })).toHaveStyle({ width: 44, height: 44 });
  await fireEvent.press(screen.getByRole('button', { name: '더보기' }));
  expect(screen.getByTestId('owner-content-menu')).toHaveStyle({
    width: 200, top: 152, left: 172, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingTop: 8, paddingLeft: 16, gap: 6,
    boxShadow: `0px 4px 20px 0px ${appearancePreference === 'LIGHT' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.40)'}`,
    backgroundColor: appearancePreference === 'LIGHT' ? '#FFFFFF' : '#26262B',
  });
  expect(screen.getByRole('button', { name: '수정하기' })).toHaveStyle({ height: 52, paddingLeft: 8, gap: 4 });
  expect(screen.getByRole('button', { name: '삭제하기' })).toHaveStyle({ height: 52, borderTopWidth: 1 });
  await fireEvent.press(screen.getByRole('button', { name: '메뉴 닫기', includeHiddenElements: true }));
  expect(screen.queryByTestId('owner-content-menu')).toBeNull();
});

test.each(['수정하기', '삭제하기'])('API 없는 %s는 성공을 가장하지 않고 안내 후 메뉴를 닫는다', async name => {
  await renderWithProviders(<OwnerContentActions />);
  await fireEvent.press(screen.getByRole('button', { name: '더보기' }));
  await fireEvent.press(screen.getByRole('button', { name }));
  expect(screen.queryByTestId('owner-content-menu')).toBeNull();
  expect(screen.getByText('수정·삭제 기능은 서버 지원 후 이용할 수 있어요.')).toBeTruthy();
});

test('연결된 동작을 한 번 실행하고 하드웨어 뒤로가기로도 닫을 수 있다', async () => {
  const onEdit = jest.fn();
  await renderWithProviders(<OwnerContentActions onEdit={onEdit} />);
  await fireEvent.press(screen.getByRole('button', { name: '더보기' }));
  await fireEvent.press(screen.getByRole('button', { name: '수정하기' }));
  expect(onEdit).toHaveBeenCalledTimes(1);
  await fireEvent.press(screen.getByRole('button', { name: '더보기' }));
  await fireEvent(screen.getByTestId('owner-content-menu-host'), 'requestClose');
  expect(screen.queryByTestId('owner-content-menu')).toBeNull();
});

test('다른 리뷰로 바뀐 뒤 늦게 도착한 좌표는 새 리뷰의 메뉴를 열지 않는다', async () => {
  let measured: MeasureOnSuccessCallback | undefined;
  jest.spyOn(View.prototype, 'measure').mockImplementation(callback => { measured = callback; });
  const { rerender } = await renderWithProviders(<OwnerContentActions />);
  await fireEvent.press(screen.getByRole('button', { name: '더보기' }));
  await rerender(<OwnerContentActions key="another-review" />);
  await act(() => measured?.(0, 0, 44, 44, 330, 100));
  expect(screen.queryByTestId('owner-content-menu')).toBeNull();
});


test('화면 아래쪽 트리거는 메뉴를 위로 올려 화면 안에 유지한다', async () => {
  jest.spyOn(View.prototype, 'measure').mockImplementation(callback => callback(0, 0, 44, 44, 330, 1320));
  await renderWithProviders(<OwnerContentActions />);
  await fireEvent.press(screen.getByRole('button', { name: '더보기' }));
  const menu = screen.getByTestId('owner-content-menu');
  // The test window is 750x1334: the menu must fit above the trigger.
  expect(menu).toHaveStyle({ top: 1186 });
});


test('24px 카드 행에서는 작은 슬롯과 44px 터치 범위를 유지하고 메뉴를 화면 오른쪽 안에 둔다', async () => {
  jest.spyOn(View.prototype, 'measure').mockImplementation(callback => callback(0, 0, 24, 24, 718, 100));
  await renderWithProviders(<OwnerContentActions compact />);
  const trigger = screen.getByTestId('owner-content-more');
  expect(trigger).toHaveStyle({ width: 24, height: 24 });
  expect(trigger.props.hitSlop).toBe(10);
  await fireEvent.press(trigger);
  expect(screen.getByTestId('owner-content-menu')).toHaveStyle({ width: 200, top: 132, left: 542 });
});

test('삭제 전용 메뉴는 실제 높이로 계산해 아래 공간이 있으면 아래에 연다', async () => {
  jest.spyOn(View.prototype, 'measure').mockImplementation(callback => callback(0, 0, 24, 24, 330, 1200));
  await renderWithProviders(<OwnerContentActions compact canEdit={false} />);
  await fireEvent.press(screen.getByTestId('owner-content-more'));
  expect(screen.getByTestId('owner-content-menu')).toHaveStyle({ top: 1232 });
  expect(screen.queryByTestId('owner-content-edit')).toBeNull();
});
