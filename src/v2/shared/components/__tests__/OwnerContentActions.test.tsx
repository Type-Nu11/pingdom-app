import React from 'react';
import { View, type MeasureInWindowOnSuccessCallback } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../app/testing/testProviders';
import OwnerContentActions from '../OwnerContentActions';

beforeEach(() => {
  jest.spyOn(View.prototype, 'measureInWindow').mockImplementation(callback => callback(330, 100, 44, 44));
});

test.each(['LIGHT', 'DARK'] as const)('%s 메뉴는 더보기 아래에 열리고 Figma 크기와 색상을 유지한다', async appearancePreference => {
  await renderWithProviders(<OwnerContentActions />, { appearancePreference });
  expect(screen.queryByTestId('owner-content-menu')).toBeNull();
  expect(screen.getByRole('button', { name: '더보기' })).toHaveStyle({ width: 44, height: 44 });
  await fireEvent.press(screen.getByRole('button', { name: '더보기' }));
  expect(screen.getByTestId('owner-content-menu')).toHaveStyle({
    width: 200, top: 144, left: 164, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingTop: 8, paddingLeft: 16, gap: 6,
    backgroundColor: appearancePreference === 'LIGHT' ? 'rgba(255,255,255,0.88)' : 'rgba(28,28,30,0.88)',
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
  let measured: MeasureInWindowOnSuccessCallback | undefined;
  jest.spyOn(View.prototype, 'measureInWindow').mockImplementation(callback => { measured = callback; });
  const { rerender } = await renderWithProviders(<OwnerContentActions />);
  await fireEvent.press(screen.getByRole('button', { name: '더보기' }));
  await rerender(<OwnerContentActions key="another-review" />);
  await act(() => measured?.(330, 100, 44, 44));
  expect(screen.queryByTestId('owner-content-menu')).toBeNull();
});


test('화면 아래쪽 트리거는 메뉴를 위로 올려 화면 안에 유지한다', async () => {
  jest.spyOn(View.prototype, 'measureInWindow').mockImplementation(callback => callback(330, 1320, 44, 44));
  await renderWithProviders(<OwnerContentActions />);
  await fireEvent.press(screen.getByRole('button', { name: '더보기' }));
  const menu = screen.getByTestId('owner-content-menu');
  // The test window is 750x1334: the menu must fit above the trigger.
  expect(menu).toHaveStyle({ top: 1194 });
});
