import React, { type PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ApiError, communityApi } from '../../api/communityApi';
import { applyOptimisticLike, communityQueryKeys, useToggleLike } from '../useCommunity';

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

describe('applyOptimisticLike', () => {
  test('좋아요를 누르면 카운트를 1 늘린다', () => {
    expect(applyOptimisticLike({ likeCount: 3, liked: false, postId: 1 }, 1, true))
      .toEqual({ likeCount: 4, liked: true, postId: 1 });
  });

  test('좋아요를 취소하면 카운트를 1 줄이되 0 미만으로 내려가지 않는다', () => {
    expect(applyOptimisticLike({ likeCount: 0, liked: true, postId: 1 }, 1, false))
      .toEqual({ likeCount: 0, liked: false, postId: 1 });
  });

  test('캐시가 비어 있으면 postId만으로 기본값을 채운다', () => {
    expect(applyOptimisticLike(undefined, 5, true)).toEqual({ likeCount: 1, liked: true, postId: 5 });
  });
});

describe('useToggleLike', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('요청이 끝나기 전에 낙관적으로 상태를 반영하고, 응답을 받으면 그대로 유지한다', async () => {
    let resolveLike: (value: { likeCount: number; liked: boolean; postId: number }) => void = () => {};
    jest.spyOn(communityApi, 'likePost').mockImplementation(
      () => new Promise((resolve) => { resolveLike = resolve; }),
    );
    const { queryClient, wrapper } = createWrapper();
    queryClient.setQueryData(communityQueryKeys.likeStatus(1), { likeCount: 3, liked: false, postId: 1 });

    const { result, unmount } = await renderHook(() => useToggleLike(1), { wrapper });

    await act(async () => {
      result.current.mutate(true);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(queryClient.getQueryData(communityQueryKeys.likeStatus(1))).toEqual({
      likeCount: 4, liked: true, postId: 1,
    });

    await act(async () => {
      resolveLike({ likeCount: 4, liked: true, postId: 1 });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(queryClient.getQueryData(communityQueryKeys.likeStatus(1))).toEqual({
      likeCount: 4, liked: true, postId: 1,
    });
    unmount();
  });

  test('실패하면 이전 상태로 롤백한다', async () => {
    jest.spyOn(communityApi, 'likePost').mockRejectedValue(new ApiError('실패', { isNetworkError: true }));
    const { queryClient, wrapper } = createWrapper();
    queryClient.setQueryData(communityQueryKeys.likeStatus(1), { likeCount: 3, liked: false, postId: 1 });

    const { result } = await renderHook(() => useToggleLike(1), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(true).catch(() => {});
    });

    expect(queryClient.getQueryData(communityQueryKeys.likeStatus(1))).toEqual({
      likeCount: 3, liked: false, postId: 1,
    });
  });

  test('성공하면 낙관적 값 대신 서버 응답을 그대로 반영한다', async () => {
    jest.spyOn(communityApi, 'likePost').mockResolvedValue({ likeCount: 9, liked: true, postId: 1 });
    const { queryClient, wrapper } = createWrapper();
    queryClient.setQueryData(communityQueryKeys.likeStatus(1), { likeCount: 3, liked: false, postId: 1 });

    const { result } = await renderHook(() => useToggleLike(1), { wrapper });
    await act(async () => { await result.current.mutateAsync(true); });

    expect(queryClient.getQueryData(communityQueryKeys.likeStatus(1))).toEqual({
      likeCount: 9, liked: true, postId: 1,
    });
  });

  test('다른 게시글의 좋아요 캐시는 건드리지 않는다', async () => {
    jest.spyOn(communityApi, 'likePost').mockResolvedValue({ likeCount: 9, liked: true, postId: 1 });
    const { queryClient, wrapper } = createWrapper();
    queryClient.setQueryData(communityQueryKeys.likeStatus(1), { likeCount: 3, liked: false, postId: 1 });
    queryClient.setQueryData(communityQueryKeys.likeStatus(2), { likeCount: 10, liked: true, postId: 2 });

    const { result } = await renderHook(() => useToggleLike(1), { wrapper });
    await act(async () => { await result.current.mutateAsync(true); });

    expect(queryClient.getQueryData(communityQueryKeys.likeStatus(2))).toEqual({
      likeCount: 10, liked: true, postId: 2,
    });
  });

  test('실패 시 자동 재시도를 하지 않는다', async () => {
    const likePost = jest.spyOn(communityApi, 'likePost').mockRejectedValue(new Error('network'));
    const { wrapper } = createWrapper();
    const { result } = await renderHook(() => useToggleLike(1), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(true).catch(() => {});
    });

    expect(likePost).toHaveBeenCalledTimes(1);
  });
});
