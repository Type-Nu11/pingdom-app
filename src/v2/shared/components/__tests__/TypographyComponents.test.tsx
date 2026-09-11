import { screen } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../testing/testProviders';
import Button from '../Button';
import Input from '../Input';
import StateLayout from '../StateLayout';
import StatusBadge from '../StatusBadge';

describe('V2 shared component typography', () => {
  test('Button과 StatusBadge가 Pretendard family와 semantic weight를 사용한다', async () => {
    await renderWithProviders(
      <>
        <Button label="continue" />
        <StatusBadge label="available" />
      </>,
    );

    expect(screen.getByText('continue')).toHaveStyle({
      fontFamily: 'Pretendard',
      fontWeight: '600',
    });
    expect(screen.getByText('available')).toHaveStyle({
      fontFamily: 'Pretendard',
      fontWeight: '600',
    });
  });

  test('Input과 StateLayout의 Text·TextInput에 family와 weight를 함께 적용한다', async () => {
    await renderWithProviders(
      <>
        <Input label="name" placeholder="enter name" />
        <StateLayout description="try again later" title="unavailable" />
      </>,
    );

    expect(screen.getByText('name')).toHaveStyle({ fontFamily: 'Pretendard', fontWeight: '600' });
    expect(screen.getByPlaceholderText('enter name')).toHaveStyle({
      fontFamily: 'Pretendard',
      fontWeight: '400',
    });
    expect(screen.getByText('unavailable')).toHaveStyle({
      fontFamily: 'Pretendard',
      fontWeight: '700',
    });
    expect(screen.getByText('try again later')).toHaveStyle({
      fontFamily: 'Pretendard',
      fontWeight: '400',
    });
  });
});
