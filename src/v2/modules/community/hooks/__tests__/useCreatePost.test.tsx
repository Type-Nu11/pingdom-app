import React, { type PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { communityApi } from '../../api/communityApi';
import { communityQueryKeys, useCreatePost, useDeletePost } from '../useCommunity';

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

describe('useCreatePost', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('생성한 카테고리와 전체 목록 캐시만 무효화한다', async () => {
    jest.spyOn(communityApi, 'createPost').mockResolvedValue({ placeIds: [], postId: 9001 });
    const { queryClient, wrapper } = createWrapper();
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = await renderHook(() => useCreatePost(), { wrapper });

    await act(async () => result.current.mutateAsync({
      categoryId: 'PLACE',
      content: '내용',
      title: '제목',
    }));

    expect(invalidateQueries).toHaveBeenCalledTimes(3);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: communityQueryKeys.postsRoot('PLACE'),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: communityQueryKeys.allPostsRoot,
    });
  });

  test('실패 시 자동 재시도를 하지 않는다', async () => {
    const createPost = jest.spyOn(communityApi, 'createPost').mockRejectedValue(new Error('network'));
    const { wrapper } = createWrapper();
    const { result } = await renderHook(() => useCreatePost(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        categoryId: 'TRAVEL',
        content: '내용',
        title: '제목',
      }).catch(() => {});
    });

    expect(createPost).toHaveBeenCalledTimes(1);
  });
});


test('삭제 성공 후 해당 글만 공개·내 목록에서 제거하고 다른 글 상세는 보존한다', async () => {
  jest.spyOn(communityApi, 'deletePost').mockResolvedValue(undefined);
  const { queryClient, wrapper } = createWrapper();
  const original = { pages: [{ posts: [{ postId: 7 }, { postId: 8 }] }], pageParams: [1] };
  const feedKey = communityQueryKeys.allPostsInfinite({});
  const mineKey = [...communityQueryKeys.mineRoot, 20];
  queryClient.setQueryData(feedKey, original); queryClient.setQueryData(mineKey, original);
  queryClient.setQueryData(communityQueryKeys.post(7), { postId: 7 });
  queryClient.setQueryData(communityQueryKeys.post(8), { postId: 8, title: '다른 글' });
  const { result } = await renderHook(() => useDeletePost(7), { wrapper });
  await act(async () => result.current.mutateAsync());
  for (const key of [feedKey, mineKey]) {
    expect(queryClient.getQueryData(key)).toEqual({ pages: [{ posts: [{ postId: 8 }] }], pageParams: [1] });
  }
  expect(queryClient.getQueryData(communityQueryKeys.post(7))).toBeUndefined();
  expect(queryClient.getQueryData(communityQueryKeys.post(8))).toEqual({ postId: 8, title: '다른 글' });
  expect(original.pages[0].posts).toHaveLength(2);
});
