import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../app/testing/testProviders';
import LoadingState from '../LoadingState';

// A loading region must announce one state and keep its decorative blocks silent.
test('announces a busy region without a spinner or repeated loading text', async () => {
  await renderWithProviders(<LoadingState description="장소를 불러오는 중" />);
  expect(screen.getByRole('progressbar', { name: '장소를 불러오는 중' })).toBeBusy();
  expect(screen.queryByText('장소를 불러오는 중')).toBeNull();
});
