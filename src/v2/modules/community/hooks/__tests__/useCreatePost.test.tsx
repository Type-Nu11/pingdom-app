import React, { type PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { communityApi } from '../../api/communityApi';
import { communityQueryKeys, useCreatePost } from '../useCommunity';

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

  test('생성한 카테고리의 목록 캐시만 무효화한다', async () => {
    jest.spyOn(communityApi, 'createPost').mockResolvedValue({ placeIds: [], postId: 9001 });
    const { queryClient, wrapper } = createWrapper();
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = await renderHook(() => useCreatePost(), { wrapper });

    await act(async () => result.current.mutateAsync({
      categoryId: 'PLACE',
      content: '내용',
      title: '제목',
    }));

    expect(invalidateQueries).toHaveBeenCalledTimes(1);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: communityQueryKeys.postsRoot('PLACE'),
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
