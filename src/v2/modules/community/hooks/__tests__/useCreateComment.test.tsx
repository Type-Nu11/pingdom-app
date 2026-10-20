import React, { type PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { communityApi } from '../../api/communityApi';
import { communityQueryKeys, useCreateComment } from '../useCommunity';

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

describe('useCreateComment', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('작성한 게시글의 댓글 캐시만 무효화하고 다른 게시글 캐시는 유지한다', async () => {
    jest.spyOn(communityApi, 'createComment').mockResolvedValue({ commentId: 9101, content: '내용', postId: 1 });
    const { queryClient, wrapper } = createWrapper();

    const post1Key = communityQueryKeys.commentsInfinite(1, {});
    const post2Key = communityQueryKeys.commentsInfinite(2, {});
    queryClient.setQueryData(post1Key, { pageParams: [1], pages: [{ comments: [], hasNext: false }] });
    queryClient.setQueryData(post2Key, { pageParams: [1], pages: [{ comments: [], hasNext: false }] });

    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = await renderHook(() => useCreateComment(1), { wrapper });

    await act(async () => result.current.mutateAsync({ content: '내용' }));

    expect(invalidateQueries).toHaveBeenCalledTimes(1);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: communityQueryKeys.commentsRoot(1),
    });
    expect(queryClient.getQueryState(post1Key)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(post2Key)?.isInvalidated).toBe(false);
  });

  test('실패 시 자동 재시도를 하지 않는다', async () => {
    const createComment = jest.spyOn(communityApi, 'createComment').mockRejectedValue(new Error('network'));
    const { wrapper } = createWrapper();
    const { result } = await renderHook(() => useCreateComment(1), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ content: '내용' }).catch(() => {});
    });

    expect(createComment).toHaveBeenCalledTimes(1);
  });
});
