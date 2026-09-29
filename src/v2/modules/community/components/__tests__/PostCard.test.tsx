import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../app/testing/testProviders';
import PostCard from '../PostCard';

describe('PostCard', () => {
  test('renders the list category as the card tag and keeps a long title to two lines', async () => {
    const longTitle = '구지면에 새로 생긴 로스터리 카페 가보신 분 계신가요? 원두 추천 부탁드려요 정말 길게 이어지는 제목';
    await renderWithProviders(
      <PostCard categoryName="스팟" onOpenOverflow={jest.fn()} onPress={jest.fn()} post={{ postId: 3, title: longTitle }} />,
      { language: 'ko' },
    );

    expect(screen.getByTestId('v2-community-post-3-tag')).toHaveTextContent('스팟');
    expect(screen.getByText(longTitle).props.numberOfLines).toBe(2);
  });

  test('omits the tag row content when no category is known', async () => {
    await renderWithProviders(
      <PostCard onOpenOverflow={jest.fn()} onPress={jest.fn()} post={{ postId: 4, title: '제목' }} />,
      { language: 'ko' },
    );

    expect(screen.queryByTestId('v2-community-post-4-tag')).toBeNull();
  });

  test('opens the overflow menu without also opening the post', async () => {
    const onOpenOverflow = jest.fn();
    const onPress = jest.fn();
    await renderWithProviders(
      <PostCard onOpenOverflow={onOpenOverflow} onPress={onPress} post={{ postId: 5, title: '제목' }} />,
      { language: 'ko' },
    );

    fireEvent.press(screen.getByTestId('v2-community-post-5-overflow'), {
      nativeEvent: { pageY: 240 },
      stopPropagation: jest.fn(),
    });

    expect(onOpenOverflow).toHaveBeenCalledWith({ bottom: 240 });
    expect(onPress).not.toHaveBeenCalled();
  });
});
