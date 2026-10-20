import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../app/testing/testProviders';
import { communityApi } from '../api/communityApi';
import MyCommunityPostsScreen, { MyCommunityPostsPreview } from '../screens/MyCommunityPostsScreen';

test('마이페이지 미리보기는 인증된 내 글 API를 limit=2로 조회한다', async () => {
  const list = jest.spyOn(communityApi, 'listMyPosts').mockResolvedValue({ posts: [{ postId: 8, title: '내 글' }], page: 1, hasNext: false });
  const onOpenPost = jest.fn();
  await renderWithProviders(<MyCommunityPostsPreview onOpenList={jest.fn()} onEditPost={jest.fn()} onOpenPost={onOpenPost} />);
  await screen.findByText('내 글');
  expect(screen.getByTestId('my-community-posts-heading')).toHaveStyle({ flexDirection: 'row', justifyContent: 'space-between' });
  expect(screen.getByTestId('owner-content-more')).toHaveStyle({ width: 24, height: 24 });
  const onHeader = screen.getByTestId('my-community-posts-heading');
  expect(onHeader.props.accessibilityRole).toBe('button');
  expect(list).toHaveBeenCalledWith({ page: 1, limit: 2 }, expect.any(AbortSignal));
  await fireEvent.press(screen.getByTestId('v2-community-post-8'));
  expect(onOpenPost).toHaveBeenCalledWith(8);
});

test('숨김 글은 내 목록에서 보이지만 공개 상세로 이동하지 않는다', async () => {
  jest.spyOn(communityApi, 'listMyPosts').mockResolvedValue({ posts: [{ postId: 8, title: '숨긴 글', hidden: true }], page: 1, hasNext: false });
  const onOpenPost = jest.fn();
  await renderWithProviders(<MyCommunityPostsScreen onBack={jest.fn()} onEditPost={jest.fn()} onOpenPost={onOpenPost} />);
  await screen.findByText('숨긴 글');
  await fireEvent.press(screen.getByTestId('v2-community-post-8'));
  expect(onOpenPost).not.toHaveBeenCalled();
});
