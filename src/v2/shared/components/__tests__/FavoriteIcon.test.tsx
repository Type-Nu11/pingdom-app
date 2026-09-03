import React from 'react';
import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../testing/testProviders';
import { FavoriteIcon } from '../FavoriteIcon';

describe('FavoriteIcon', () => {
  test('미선택은 검은 stroke와 투명 fill을 사용한다', async () => {
    await renderWithProviders(<FavoriteIcon selected={false} />);
    expect(screen.getByTestId('favorite-icon')).toHaveProp('color', '#0C0C0D');
    expect(screen.getByTestId('favorite-icon')).toHaveProp('fill', 'none');
  });

  test('선택은 포인트 컬러로 stroke와 fill을 채운다', async () => {
    await renderWithProviders(<FavoriteIcon selected />);
    expect(screen.getByTestId('favorite-icon')).toHaveProp('color', '#FF1956');
    expect(screen.getByTestId('favorite-icon')).toHaveProp('fill', '#FF1956');
  });
});
