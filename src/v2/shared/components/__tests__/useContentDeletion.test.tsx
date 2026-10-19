import React from 'react';
import { Platform } from 'react-native';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../app/testing/testProviders';
import Button from '../Button';
import { useContentDeletion } from '../useContentDeletion';

beforeEach(() => { jest.replaceProperty(Platform, 'OS', 'android'); });

function Trigger({ remove, onDeleted, identity }: { remove: () => Promise<unknown>; onDeleted: () => void; identity?: number }) {
  const action = useContentDeletion(remove, onDeleted, identity);
  return <Button label="삭제 메뉴" onPress={action.confirm} disabled={action.busy} />;
}

test('삭제는 확인 후 한 번 실행하고 취소하면 실행하지 않는다', async () => {
  const remove = jest.fn().mockResolvedValue(undefined); const onDeleted = jest.fn();
  await renderWithProviders(<Trigger remove={remove} onDeleted={onDeleted} />);
  await fireEvent.press(screen.getByText('삭제 메뉴'));
  expect(remove).not.toHaveBeenCalled();
  expect(screen.getByText('취소')).toBeTruthy();
  await fireEvent.press(screen.getByTestId('app-dialog-action-0'));
  expect(remove).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByText('삭제 메뉴'));
  await fireEvent.press(screen.getByTestId('app-dialog-action-1'));
  await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1));
  expect(remove).toHaveBeenCalledTimes(1);
});

test('삭제 실패는 성공으로 처리하지 않고 다시 시도할 수 있다', async () => {
  const remove = jest.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValue(undefined);
  const onDeleted = jest.fn();
  await renderWithProviders(<Trigger remove={remove} onDeleted={onDeleted} />);
  await fireEvent.press(screen.getByText('삭제 메뉴'));
  await fireEvent.press(screen.getByTestId('app-dialog-action-1'));
  await screen.findByText('요청을 처리하지 못했어요. 다시 시도해 주세요.');
  expect(onDeleted).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByText('삭제 메뉴'));
  await fireEvent.press(screen.getByTestId('app-dialog-action-1'));
  await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1));
});


test('확인창이 열린 뒤 대상이 바뀌면 이전 삭제를 실행하지 않는다', async () => {
  const remove = jest.fn().mockResolvedValue(undefined); const onDeleted = jest.fn();
  const view = await renderWithProviders(<Trigger remove={remove} onDeleted={onDeleted} identity={1} />);
  await fireEvent.press(screen.getByText('삭제 메뉴'));
  await view.rerender(<Trigger remove={remove} onDeleted={onDeleted} identity={2} />);
  await fireEvent.press(screen.getByTestId('app-dialog-action-1'));
  expect(remove).not.toHaveBeenCalled();
  expect(onDeleted).not.toHaveBeenCalled();
});
