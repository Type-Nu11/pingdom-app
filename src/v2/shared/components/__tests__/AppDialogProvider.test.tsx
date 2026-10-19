import React from 'react';
import { Alert, Platform, Pressable } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../app/testing/testProviders';
import { useAppDialog } from '../AppDialogProvider';

function Launcher({ onConfirm, onDismiss, cancelable = true }: {
  onConfirm: () => void; onDismiss?: () => void; cancelable?: boolean;
}) {
  const dialog = useAppDialog();
  return <Pressable accessibilityRole="button" accessibilityLabel="open" onPress={() => dialog.show('제목', '긴 안내 본문', [
    { text: '취소', style: 'cancel' }, { text: '삭제', style: 'destructive', onPress: onConfirm },
  ], { cancelable, onDismiss })} />;
}
beforeEach(() => { jest.replaceProperty(Platform, 'OS', 'android'); });

test.each(['LIGHT', 'DARK'] as const)('%s uses themed card, accessible actions, and never calls native Alert', async appearancePreference => {
  const native = jest.spyOn(Alert, 'alert');
  const confirm = jest.fn();
  const view = await renderWithProviders(<Launcher onConfirm={confirm} />, { appearancePreference });
  await view.user.press(screen.getByRole('button', { name: 'open' }));
  expect(screen.getByTestId('app-dialog')).toHaveStyle({ borderTopLeftRadius: 36, maxWidth: 400, maxHeight: '85%', overflow: 'hidden' });
  expect(screen.getByRole('header', { name: '제목' })).toBeVisible();
  await view.user.press(screen.getByRole('button', { name: '취소' }));
  expect(confirm).not.toHaveBeenCalled();
  expect(screen.queryByTestId('app-dialog')).toBeNull();
  expect(native).not.toHaveBeenCalled();
});

test('duplicate taps cannot stack the same dialog or repeat destructive actions', async () => {
  const confirm = jest.fn();
  const view = await renderWithProviders(<Launcher onConfirm={confirm} />);
  const open = screen.getByRole('button', { name: 'open' });
  await fireEvent.press(open); await fireEvent.press(open);
  const action = screen.getByRole('button', { name: '삭제' });
  await fireEvent.press(action);
  expect(confirm).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId('app-dialog')).toBeNull();
});

test('hardware back dismisses safely and releases caller locks', async () => {
  const dismiss = jest.fn(); const confirm = jest.fn();
  const view = await renderWithProviders(<Launcher onConfirm={confirm} onDismiss={dismiss} />);
  await view.user.press(screen.getByRole('button', { name: 'open' }));
  await act(() => screen.getByTestId('app-dialog-host', { includeHiddenElements: true }).props.onRequestClose());
  expect(dismiss).toHaveBeenCalledTimes(1);
  expect(confirm).not.toHaveBeenCalled();
});

test('a noncancelable dialog ignores hardware back and backdrop dismissal', async () => {
  const view = await renderWithProviders(<Launcher onConfirm={jest.fn()} cancelable={false} />);
  await view.user.press(screen.getByRole('button', { name: 'open' }));
  await act(() => screen.getByTestId('app-dialog-host', { includeHiddenElements: true }).props.onRequestClose());
  expect(screen.getByTestId('app-dialog')).toBeVisible();
});

test('unmounting a caller removes its pending dialog', async () => {
  const view = await renderWithProviders(<Launcher onConfirm={jest.fn()} />);
  await view.user.press(screen.getByRole('button', { name: 'open' }));
  await view.rerender(<></>);
  expect(screen.queryByTestId('app-dialog')).toBeNull();
});

test('iOS waits for the native host to dismiss before opening a camera or another screen', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  const confirm = jest.fn();
  const view = await renderWithProviders(<Launcher onConfirm={confirm} />);
  await view.user.press(screen.getByRole('button', { name: 'open' }));
  const didDismiss = screen.getByTestId('app-dialog-host').props.onDismiss;
  await view.user.press(screen.getByRole('button', { name: '삭제' }));
  expect(confirm).not.toHaveBeenCalled();
  await act(didDismiss);
  expect(confirm).toHaveBeenCalledTimes(1);
});

test('a delayed iOS action does not run after the caller leaves', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  const confirm = jest.fn();
  const view = await renderWithProviders(<Launcher onConfirm={confirm} />);
  await view.user.press(screen.getByRole('button', { name: 'open' }));
  const didDismiss = screen.getByTestId('app-dialog-host').props.onDismiss;
  await view.user.press(screen.getByRole('button', { name: '삭제' }));
  await view.rerender(<></>);
  await act(didDismiss);
  expect(confirm).not.toHaveBeenCalled();
});
