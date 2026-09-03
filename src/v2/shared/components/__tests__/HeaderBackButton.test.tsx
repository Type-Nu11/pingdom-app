import React from 'react';
import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../testing/testProviders';
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
