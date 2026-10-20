import React from 'react';
import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../app/testing/testProviders';
import StateLayout from '../StateLayout';

describe('StateLayout sizing', () => {
  test('a non-fill state keeps its content height instead of shrinking to the action', async () => {
    await renderWithProviders(<StateLayout actionLabel="retry" description="desc" onAction={jest.fn()} title="title" />);

    const container = screen.getByRole('header').parent;
    expect(container).toHaveStyle({ flexGrow: 0, flexShrink: 0 });
    expect(container).not.toHaveStyle({ flexBasis: 0 });
  });

  test('a fill state still takes the remaining space', async () => {
    await renderWithProviders(<StateLayout fill title="title" />);

    const container = screen.getByRole('header').parent;
    expect(container).toHaveStyle({ flexGrow: 1 });
  });
});
