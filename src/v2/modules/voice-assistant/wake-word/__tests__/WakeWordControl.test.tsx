import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../app/testing/testProviders';
import { WakeWordControl } from '../WakeWordControl';

test.each(['ko', 'en'] as const)('%s requires the privacy notice confirmation before listening', async language => {
  const enable = jest.fn(async () => {});
  const view = await renderWithProviders(<WakeWordControl state={{ phase: 'disabled', enabled: false, error: null }}
    onEnable={enable} onDisable={async () => {}} />, { language });
  const toggle = screen.getByRole('switch', { checked: false });
  await fireEvent(toggle, 'valueChange', !toggle.props.value);
  expect(enable).not.toHaveBeenCalled();
  expect(screen.getByTestId('app-dialog')).toBeVisible();
  const didDismiss = screen.getByTestId('app-dialog-host').props.onDismiss;
  await view.user.press(screen.getByTestId('app-dialog-action-1'));
  await act(didDismiss);
  expect(enable).toHaveBeenCalledTimes(1);
});

test.each(['ko', 'en'] as const)('%s stops active listening without another confirmation', async language => {
  const disable = jest.fn(async () => {});
  const view = await renderWithProviders(<WakeWordControl state={{ phase: 'listening', enabled: true, error: null }}
    onEnable={async () => {}} onDisable={disable} />, { language });
  const toggle = screen.getByRole('switch', { checked: true });
  await fireEvent(toggle, 'valueChange', !toggle.props.value);
  expect(disable).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId('app-dialog')).toBeNull();
});
