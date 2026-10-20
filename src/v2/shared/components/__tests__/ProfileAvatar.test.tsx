import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../app/testing/testProviders';
import ProfileAvatar from '../ProfileAvatar';

describe('ProfileAvatar', () => {
  test('이미지 URL이 있으면 지정한 크기의 원형 이미지를 보여준다', async () => {
    await renderWithProviders(<ProfileAvatar imageTestID="avatar" size={82} uri="https://cdn/a.jpg" />);

    const image = screen.getByTestId('avatar');
    expect(image.props.source).toEqual({ uri: 'https://cdn/a.jpg' });
    expect(image).toHaveStyle({ borderTopLeftRadius: 41, borderBottomRightRadius: 41, height: 82, width: 82 });
  });

  test.each([null, undefined, ''])('이미지 URL이 %p이면 기본 아바타를 보여준다', async (uri) => {
    await renderWithProviders(<ProfileAvatar imageTestID="avatar" size={56} uri={uri} />);

    expect(screen.queryByTestId('avatar')).toBeNull();
  });

  test('이미지 로드에 실패하면 기본 아바타로 대체한다', async () => {
    await renderWithProviders(<ProfileAvatar imageTestID="avatar" size={56} uri="https://cdn/broken.jpg" />);

    await fireEvent(screen.getByTestId('avatar'), 'error');

    expect(screen.queryByTestId('avatar')).toBeNull();
  });

  test('로드 실패한 뒤 새 URL이 오면 다시 이미지를 시도한다', async () => {
    const view = await renderWithProviders(
      <ProfileAvatar imageTestID="avatar" size={56} uri="https://cdn/broken.jpg" />,
    );
    await fireEvent(screen.getByTestId('avatar'), 'error');
    expect(screen.queryByTestId('avatar')).toBeNull();

    await view.rerender(<ProfileAvatar imageTestID="avatar" size={56} uri="https://cdn/new.jpg" />);

    expect(screen.getByTestId('avatar').props.source).toEqual({ uri: 'https://cdn/new.jpg' });
  });
});
