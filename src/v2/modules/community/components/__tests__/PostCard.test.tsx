import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../app/testing/testProviders';
import type { CommunityPostSummary } from '../../api/communityApi';
import PostCard from '../PostCard';

const NOW = new Date('2026-09-01T09:00:00Z');

const fullPost = {
  category: { categoryId: 'SPOT', categoryName: '스팟' },
  commentCount: 5,
  contentPreview: 'LP랑 굿즈 진짜 생각보다 많고 사진 찍기 좋았어요',
  countryCode: 'KR',
  createdAt: '2026-09-01T08:48:00Z',
  imageCount: 4,
  imageUrl: 'https://cdn.test/community/1.jpg',
  likeCount: 8,
  postId: 1,
  region: '성수동',
  title: '오늘 오아시스 팝업 갔다옴',
  viewCount: 128,
} satisfies CommunityPostSummary;

function renderCard(post: CommunityPostSummary, props: Partial<React.ComponentProps<typeof PostCard>> = {}) {
  return renderWithProviders(
    <PostCard now={NOW} onOpenOverflow={jest.fn()} onPress={jest.fn()} post={post} {...props} />,
    { language: 'ko' },
  );
}

describe('PostCard', () => {
  test('renders the thumbnail, +N badge, preview, meta and stats from the list response', async () => {
    await renderCard(fullPost);

    expect(screen.getByTestId('v2-community-post-1-tag')).toHaveTextContent('스팟');
    expect(screen.getByTestId('v2-community-post-1-preview').props.numberOfLines).toBe(1);
    expect(screen.getByTestId('v2-community-post-1-thumbnail')).toHaveStyle({
      borderTopLeftRadius: 12,
      height: 80,
      width: 80,
    });
    expect(screen.getByTestId('v2-community-post-1-photo-count')).toHaveTextContent('+3');
    expect(screen.getByTestId('v2-community-post-1-info')).toHaveTextContent('성수동 · 12분 전 · 조회 128');
    expect(screen.getByTestId('v2-community-post-1-likes')).toHaveTextContent('8');
    expect(screen.getByTestId('v2-community-post-1-comments')).toHaveTextContent('5');
  });

  test.each([
    [1, null],
    [2, '+1'],
    [10, '+9'],
  ])('imageCount %p shows the badge %p', async (imageCount, badge) => {
    await renderCard({ ...fullPost, imageCount });

    if (badge === null) {
      expect(screen.queryByTestId('v2-community-post-1-photo-count')).toBeNull();
    } else {
      expect(screen.getByTestId('v2-community-post-1-photo-count')).toHaveTextContent(badge);
    }
  });

  test('collapses line breaks in the preview into one line', async () => {
    await renderCard({ ...fullPost, contentPreview: '첫 문단입니다.\n\n둘째 문단입니다.  ' });

    expect(screen.getByTestId('v2-community-post-1-preview')).toHaveTextContent('첫 문단입니다. 둘째 문단입니다.');
  });

  test('a whitespace-only preview is hidden', async () => {
    await renderCard({ ...fullPost, contentPreview: ' \n ' });

    expect(screen.queryByTestId('v2-community-post-1-preview')).toBeNull();
  });

  test('a post without photos has no thumbnail slot and no badge', async () => {
    await renderCard({ ...fullPost, imageCount: 0, imageUrl: undefined });

    expect(screen.queryByTestId('v2-community-post-1-thumbnail')).toBeNull();
    expect(screen.queryByTestId('v2-community-post-1-thumbnail-fallback')).toBeNull();
    expect(screen.queryByTestId('v2-community-post-1-photo-count')).toBeNull();
  });

  test('a thumbnail that fails to load falls back to the placeholder tile', async () => {
    await renderCard(fullPost);

    await act(async () => { fireEvent(screen.getByTestId('v2-community-post-1-thumbnail'), 'error'); });

    expect(screen.getByTestId('v2-community-post-1-thumbnail-fallback')).toBeTruthy();
    expect(screen.getByTestId('v2-community-post-1-photo-count')).toHaveTextContent('+3');
  });

  test('fields missing from the response are hidden instead of zero-filled', async () => {
    await renderCard({ postId: 2, title: '제목만 있는 글' });

    expect(screen.queryByTestId('v2-community-post-2-preview')).toBeNull();
    expect(screen.queryByTestId('v2-community-post-2-thumbnail')).toBeNull();
    expect(screen.queryByTestId('v2-community-post-2-info')).toBeNull();
    expect(screen.queryByTestId('v2-community-post-2-likes')).toBeNull();
    expect(screen.queryByTestId('v2-community-post-2-comments')).toBeNull();
    expect(screen.queryByText('0')).toBeNull();
  });

  test('a zero the server actually returned is shown', async () => {
    await renderCard({ ...fullPost, commentCount: 0, likeCount: 0, region: undefined, viewCount: 0 });

    expect(screen.getByTestId('v2-community-post-1-info')).toHaveTextContent('12분 전 · 조회 0');
    expect(screen.getByTestId('v2-community-post-1-likes')).toHaveTextContent('0');
    expect(screen.getByTestId('v2-community-post-1-comments')).toHaveTextContent('0');
  });

  test('uses the item category, falls back to the list category and keeps a long title to two lines', async () => {
    const longTitle = '구지면에 새로 생긴 로스터리 카페 가보신 분 계신가요? 원두 추천 부탁드려요 정말 길게 이어지는 제목';
    await renderCard({ postId: 3, title: longTitle }, { categoryName: '다이어리' });

    expect(screen.getByTestId('v2-community-post-3-tag')).toHaveTextContent('다이어리');
    expect(screen.getByText(longTitle).props.numberOfLines).toBe(2);
  });

  test('omits the tag when no category is known', async () => {
    await renderCard({ postId: 4, title: '제목' });

    expect(screen.queryByTestId('v2-community-post-4-tag')).toBeNull();
  });

  test('opens the overflow menu without also opening the post', async () => {
    const onOpenOverflow = jest.fn();
    const onPress = jest.fn();
    await renderCard({ postId: 5, title: '제목' }, { onOpenOverflow, onPress });

    fireEvent.press(screen.getByTestId('v2-community-post-5-overflow'), {
      nativeEvent: { pageY: 240 },
      stopPropagation: jest.fn(),
    });

    expect(onOpenOverflow).toHaveBeenCalledWith({ bottom: 240 });
    expect(onPress).not.toHaveBeenCalled();
  });
});
