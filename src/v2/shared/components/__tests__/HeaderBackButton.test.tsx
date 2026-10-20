import React from 'react';
import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../app/testing/testProviders';
import { HeaderBackButton } from '../HeaderBackButton';

test('공통 뒤로가기 버튼은 44x44 터치 영역과 기존 pop callback을 유지한다', async () => {
  const onPress = jest.fn();
  const view = await renderWithProviders(
    <HeaderBackButton accessibilityLabel="뒤로가기" onPress={onPress} />,
  );

  const button = screen.getByRole('button', { name: '뒤로가기' });
  expect(button).toHaveStyle({ height: 44, width: 44 });
  await view.user.press(button);
  expect(onPress).toHaveBeenCalledTimes(1);
});

test.each([
  ['LIGHT', '#5E5E66', 'rgba(255, 255, 255, 0.24)', 'rgba(255, 255, 255, 0)'],
  ['DARK', '#A9A9B2', 'rgba(72, 72, 82, 0.72)', 'rgba(255, 255, 255, 0.20)'],
] as const)('%s back button paints the glass circle and chevron from theme tokens', async (appearancePreference, color, fill, stroke) => {
  await renderWithProviders(<HeaderBackButton accessibilityLabel="뒤로" onPress={jest.fn()} />, { appearancePreference });
  const icon = screen.getByRole('button', { name: '뒤로' }).children[0] as unknown as { props: Record<string, unknown> };
  expect(icon.props).toMatchObject({ color, fill, stroke });
});
