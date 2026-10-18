import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../app/testing/testProviders';
import { WakeWordControl } from '../WakeWordControl';

test.each(['ko', 'en'] as const)('%s requires the privacy notice confirmation before listening', async language => {
  const alert = jest.spyOn(Alert, 'alert');
  const enable = jest.fn(async () => {});
  await renderWithProviders(<WakeWordControl state={{ phase: 'disabled', enabled: false, error: null }}
    onEnable={enable} onDisable={async () => {}} />, { language });
  const toggle = screen.getByRole('switch', { checked: false });
  await fireEvent.press(toggle);
  expect(enable).not.toHaveBeenCalled();
  const actions = alert.mock.calls[0][2]!;
  expect(actions[0].style).toBe('cancel');
  await act(() => actions[1].onPress?.());
  expect(enable).toHaveBeenCalledTimes(1);
});

test.each(['ko', 'en'] as const)('%s stops active listening without another confirmation', async language => {
  const alert = jest.spyOn(Alert, 'alert');
  const disable = jest.fn(async () => {});
  await renderWithProviders(<WakeWordControl state={{ phase: 'listening', enabled: true, error: null }}
    onEnable={async () => {}} onDisable={disable} />, { language });
  const toggle = screen.getByRole('switch', { checked: true });
  await fireEvent.press(toggle);
  expect(disable).toHaveBeenCalledTimes(1);
  expect(alert).not.toHaveBeenCalled();
});

test.each(['LIGHT', 'DARK'] as const)('%s uses the shared settings toggle design from notification settings', async appearancePreference => {
  await renderWithProviders(<WakeWordControl state={{ phase: 'listening', enabled: true, error: null }}
    onEnable={async () => {}} onDisable={async () => {}} />, { appearancePreference, language: 'ko' });
  const toggle = screen.getByRole('switch', { name: '“Hey Pingdy”로 호출', checked: true });
  expect(toggle).toHaveStyle({ backgroundColor: '#FF1956', height: 32, width: 52 });
  expect(screen.getByText('“Hey Pingdy”로 호출')).toHaveStyle({
    color: appearancePreference === 'DARK' ? '#F4F4F5' : '#0C0C0D',
    fontSize: 16,
    lineHeight: 21,
  });
});
