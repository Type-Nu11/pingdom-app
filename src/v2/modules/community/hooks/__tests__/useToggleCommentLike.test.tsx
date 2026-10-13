import React, { type PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { type InfiniteData, QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ApiError, communityApi, type CommunityCommentPage } from '../../api/communityApi';
import { communityQueryKeys, useToggleCommentLike } from '../useCommunity';

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

const KEY = communityQueryKeys.commentsInfinite(1, {});

function seed(queryClient: QueryClient) {
  queryClient.setQueryData<InfiniteData<CommunityCommentPage>>(KEY, {
    pageParams: [1, 2],
    pages: [
      { comments: [{ commentId: 11, likeCount: 2, liked: false }, { commentId: 12, likeCount: 0, liked: false }], page: 1 },
      { comments: [{ commentId: 13, likeCount: 5, liked: true }], page: 2 },
    ],
  });
}

const cached = (queryClient: QueryClient, commentId: number) => queryClient
  .getQueryData<InfiniteData<CommunityCommentPage>>(KEY)!
  .pages.flatMap((page) => page.comments ?? [])
  .find((comment) => comment.commentId === commentId);

describe('useToggleCommentLike', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('응답 전에 해당 댓글만 낙관적으로 바꾸고, 응답 값으로 확정한다', async () => {
    let resolveLike: (value: { commentId: number; likeCount: number; liked: boolean }) => void = () => {};
    const likeComment = jest.spyOn(communityApi, 'likeComment').mockImplementation(
      () => new Promise((resolve) => { resolveLike = resolve; }),
    );
    const { queryClient, wrapper } = createWrapper();
    seed(queryClient);
    const { result } = await renderHook(() => useToggleCommentLike(1), { wrapper });

    await act(async () => { result.current.mutate({ commentId: 11, nextLiked: true }); });

    expect(likeComment).toHaveBeenCalledWith(11);
    expect(cached(queryClient, 11)).toMatchObject({ likeCount: 3, liked: true });
    expect(cached(queryClient, 12)).toMatchObject({ likeCount: 0, liked: false });
    expect(cached(queryClient, 13)).toMatchObject({ likeCount: 5, liked: true });

    await act(async () => { resolveLike({ commentId: 11, likeCount: 7, liked: true }); });

    expect(cached(queryClient, 11)).toMatchObject({ likeCount: 7, liked: true });
  });

  test('좋아요 취소는 DELETE로 보내고 다른 페이지의 댓글도 갱신한다', async () => {
    const unlikeComment = jest.spyOn(communityApi, 'unlikeComment')
      .mockResolvedValue({ commentId: 13, likeCount: 4, liked: false });
    const { queryClient, wrapper } = createWrapper();
    seed(queryClient);
    const { result } = await renderHook(() => useToggleCommentLike(1), { wrapper });

    await act(async () => { await result.current.mutateAsync({ commentId: 13, nextLiked: false }); });

    expect(unlikeComment).toHaveBeenCalledWith(13);
    expect(cached(queryClient, 13)).toMatchObject({ likeCount: 4, liked: false });
  });

  test('실패하면 해당 댓글만 이전 값으로 되돌리고 자동 재시도하지 않는다', async () => {
    const likeComment = jest.spyOn(communityApi, 'likeComment')
      .mockRejectedValue(new ApiError('Network error', { isNetworkError: true }));
    jest.spyOn(communityApi, 'unlikeComment').mockResolvedValue({ commentId: 13, likeCount: 4, liked: false });
    const { queryClient, wrapper } = createWrapper();
    seed(queryClient);
    const { result } = await renderHook(() => useToggleCommentLike(1), { wrapper });

    await act(async () => { await result.current.mutateAsync({ commentId: 13, nextLiked: false }); });
    await act(async () => {
      await result.current.mutateAsync({ commentId: 11, nextLiked: true }).catch(() => {});
    });

    expect(likeComment).toHaveBeenCalledTimes(1);
    expect(cached(queryClient, 11)).toMatchObject({ likeCount: 2, liked: false });
    // The other comment's settled like is not clobbered by the rollback.
    expect(cached(queryClient, 13)).toMatchObject({ likeCount: 4, liked: false });
  });

  test('다른 게시글의 댓글 캐시는 건드리지 않는다', async () => {
    jest.spyOn(communityApi, 'likeComment').mockResolvedValue({ commentId: 11, likeCount: 3, liked: true });
    const { queryClient, wrapper } = createWrapper();
    seed(queryClient);
    const otherKey = communityQueryKeys.commentsInfinite(2, {});
    const other = { pageParams: [1], pages: [{ comments: [{ commentId: 11, likeCount: 9, liked: false }] }] };
    queryClient.setQueryData(otherKey, other);
    const { result } = await renderHook(() => useToggleCommentLike(1), { wrapper });

    await act(async () => { await result.current.mutateAsync({ commentId: 11, nextLiked: true }); });

    expect(queryClient.getQueryData(otherKey)).toBe(other);
  });
});
