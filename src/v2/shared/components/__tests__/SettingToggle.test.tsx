import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../app/testing/testProviders';
import { SettingToggle } from '../SettingToggle';

describe('SettingToggle', () => {
  test.each([
    ['LIGHT', true, '#FF1956', 'rgba(0, 0, 0, 0.16)'],
    ['LIGHT', false, '#E4E4E5', 'rgba(0, 0, 0, 0.16)'],
    ['DARK', true, '#FF1956', 'rgba(0, 0, 0, 0.40)'],
    ['DARK', false, '#34343A', 'rgba(0, 0, 0, 0.40)'],
  ] as const)('%s 모드 value=%s는 Figma 트랙 색과 흰 손잡이를 쓴다', async (appearancePreference, value, track, knobShadow) => {
    await renderWithProviders(
      <SettingToggle accessibilityLabel="알림" testID="toggle" value={value} />,
      { appearancePreference },
    );

    expect(screen.getByTestId('toggle')).toHaveStyle({ backgroundColor: track, borderTopLeftRadius: 16, borderBottomRightRadius: 16, height: 32, width: 52 });
    expect(screen.getByTestId('toggle-knob')).toHaveStyle({
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 14,
      borderBottomRightRadius: 14,
      boxShadow: `0px 1px 3px 0px ${knobShadow}`,
      height: 28,
      width: 28,
    });
    expect(screen.getByRole('switch', { name: '알림' }).props.accessibilityState).toMatchObject({ checked: value });
  });

  test('누르면 반대 값을 전달하고 비활성·로딩 중에는 전달하지 않는다', async () => {
    const onValueChange = jest.fn();
    const view = await renderWithProviders(
      <SettingToggle accessibilityLabel="알림" onValueChange={onValueChange} testID="toggle" value={false} />,
    );

    await fireEvent.press(screen.getByRole('switch', { name: '알림' }));
    expect(onValueChange).toHaveBeenCalledWith(true);

    await view.rerender(<SettingToggle accessibilityLabel="알림" disabled onValueChange={onValueChange} testID="toggle" value={false} />);
    await fireEvent.press(screen.getByRole('switch', { name: '알림' }));
    await view.rerender(<SettingToggle accessibilityLabel="알림" isLoading onValueChange={onValueChange} testID="toggle" value />);
    await fireEvent.press(screen.getByRole('switch', { name: '알림' }));

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('switch', { name: '알림' }).props.accessibilityState).toMatchObject({ busy: true, disabled: true });
  });
});
