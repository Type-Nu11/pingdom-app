import { screen } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../../app/testing/testProviders';
import Button from '../Button';
import Input from '../Input';
import StateLayout from '../StateLayout';
import StatusBadge from '../StatusBadge';

// Jest renders React Native as iOS, where each Pretendard weight resolves to
// the variable font's named instance (see resolveFontFace).
describe('V2 shared component typography', () => {
  test('Button과 StatusBadge가 Pretendard family와 semantic weight를 사용한다', async () => {
    await renderWithProviders(
      <>
        <Button label="continue" />
        <StatusBadge label="available" />
      </>,
    );

    expect(screen.getByText('continue')).toHaveStyle({
      fontFamily: 'PretendardStdVariable-SemiBold',
    });
    expect(screen.getByText('available')).toHaveStyle({
      fontFamily: 'PretendardStdVariable-SemiBold',
    });
  });

  test('Input과 StateLayout의 Text·TextInput에 family와 weight를 함께 적용한다', async () => {
    await renderWithProviders(
      <>
        <Input label="name" placeholder="enter name" />
        <StateLayout description="try again later" title="unavailable" />
      </>,
    );

    expect(screen.getByText('name')).toHaveStyle({ fontFamily: 'PretendardStdVariable-SemiBold' });
    expect(screen.getByPlaceholderText('enter name')).toHaveStyle({
      fontFamily: 'PretendardStdVariable-Regular',
    });
    expect(screen.getByText('unavailable')).toHaveStyle({
      fontFamily: 'PretendardStdVariable-Bold',
    });
    expect(screen.getByText('try again later')).toHaveStyle({
      fontFamily: 'PretendardStdVariable-Regular',
    });
  });
});
