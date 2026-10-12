import React, { type PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { type InfiniteData, QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { communityApi, type CommunityPostPage } from '../../api/communityApi';
import { communityQueryKeys, useCreateComment, useToggleLike } from '../useCommunity';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { gcTime: Infinity, retry: false },
      queries: { gcTime: Infinity, retry: false },
    },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, wrapper };
}

const ALL_KEY = communityQueryKeys.allPostsInfinite({ limit: 20 });
const CATEGORY_KEY = communityQueryKeys.postsInfinite('SPOT', { countryCode: 'KR', limit: 20 });

const feed = (): InfiniteData<CommunityPostPage> => ({
  pageParams: [1],
  pages: [{
    posts: [
      { commentCount: 5, likeCount: 8, postId: 1, title: '대상 글' },
      { commentCount: 2, likeCount: 1, postId: 2, title: '다른 글' },
      { postId: 3, title: '수치 없는 글' },
    ],
  }],
});

const cachedPost = (queryClient: QueryClient, key: readonly unknown[], postId: number) => queryClient
  .getQueryData<InfiniteData<CommunityPostPage>>(key)!
  .pages.flatMap((page) => page.posts ?? [])
  .find((post) => post.postId === postId);

describe('feed card counts after detail actions', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('좋아요 응답의 수를 전체·카테고리 목록 캐시의 해당 글에만 반영한다', async () => {
    jest.spyOn(communityApi, 'likePost').mockResolvedValue({ likeCount: 9, liked: true, postId: 1 });
    const { queryClient, wrapper } = createWrapper();
    queryClient.setQueryData(ALL_KEY, feed());
    queryClient.setQueryData(CATEGORY_KEY, feed());
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = await renderHook(() => useToggleLike(1), { wrapper });

    await act(async () => { await result.current.mutateAsync(true); });

    expect(cachedPost(queryClient, ALL_KEY, 1)).toMatchObject({ likeCount: 9 });
    expect(cachedPost(queryClient, CATEGORY_KEY, 1)).toMatchObject({ likeCount: 9 });
    expect(cachedPost(queryClient, ALL_KEY, 2)).toMatchObject({ likeCount: 1 });
    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  test('댓글 등록 후 해당 글의 댓글 수를 1 올리고 다른 글은 그대로 둔다', async () => {
    jest.spyOn(communityApi, 'createComment').mockResolvedValue({ commentId: 9, content: '내용', postId: 1 });
    const { queryClient, wrapper } = createWrapper();
    queryClient.setQueryData(ALL_KEY, feed());
    queryClient.setQueryData(CATEGORY_KEY, feed());
    const { result } = await renderHook(() => useCreateComment(1), { wrapper });

    await act(async () => { await result.current.mutateAsync({ content: '내용' }); });

    expect(cachedPost(queryClient, ALL_KEY, 1)).toMatchObject({ commentCount: 6 });
    expect(cachedPost(queryClient, CATEGORY_KEY, 1)).toMatchObject({ commentCount: 6 });
    expect(cachedPost(queryClient, ALL_KEY, 2)).toMatchObject({ commentCount: 2 });
  });

  test('목록 응답에 수가 없던 글은 댓글 등록 후에도 수를 만들어 넣지 않는다', async () => {
    jest.spyOn(communityApi, 'createComment').mockResolvedValue({ commentId: 9, content: '내용', postId: 3 });
    const { queryClient, wrapper } = createWrapper();
    queryClient.setQueryData(ALL_KEY, feed());
    const { result } = await renderHook(() => useCreateComment(3), { wrapper });

    await act(async () => { await result.current.mutateAsync({ content: '내용' }); });

    expect(cachedPost(queryClient, ALL_KEY, 3)).not.toHaveProperty('commentCount');
  });

  test('목록 캐시가 없어도 오류 없이 동작한다', async () => {
    jest.spyOn(communityApi, 'likePost').mockResolvedValue({ likeCount: 9, liked: true, postId: 1 });
    const { wrapper } = createWrapper();
    const { result } = await renderHook(() => useToggleLike(1), { wrapper });

    let settled: unknown;
    await act(async () => { settled = await result.current.mutateAsync(true); });

    expect(settled).toEqual({ likeCount: 9, liked: true, postId: 1 });
  });
});
