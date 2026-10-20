import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../app/testing/testProviders';
import { darkTheme, lightTheme } from '../../theme';
import Button from '../Button';

test.each(['LIGHT', 'DARK'] as const)('%s primary button keeps white text while idle and pressed', async (appearancePreference) => {
  await renderWithProviders(<Button label="확인" onPress={jest.fn()} />, { appearancePreference });
  const theme = appearancePreference === 'DARK' ? darkTheme : lightTheme;
  expect(screen.getByText('확인')).toHaveStyle({ color: '#FFFFFF' });
  expect(screen.getByRole('button', { name: '확인' })).toHaveStyle({ backgroundColor: theme.colors.primaryAction });
  await fireEvent(screen.getByRole('button', { name: '확인' }), 'pressIn');
  expect(screen.getByRole('button', { name: '확인' })).toHaveStyle({ backgroundColor: theme.colors.primaryActionPressed });
  expect(screen.getByText('확인')).toHaveStyle({ color: '#FFFFFF' });
});

test.each([
  ['LIGHT', lightTheme], ['DARK', darkTheme],
] as const)('%s neutral buttons keep readable theme text', async (appearancePreference, theme) => {
  await renderWithProviders(<Button label="닫기" variant="ghost" />, { appearancePreference });
  expect(screen.getByText('닫기')).toHaveStyle({ color: theme.colors.textStrong });
});
