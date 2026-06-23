import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { placeApi } from '../../place/api/placeApi';
import type { PostsPage } from '../model/record.types';
import { postQueryKeys } from './usePlacePosts';

type TogglePostBookmarkPayload = {
  nextBookmarked: boolean;
  placeId: number;
};

const BOOKMARKS_PAGE_SIZE = 100;

export const postBookmarkQueryKeys = {
  all: ['postBookmarks'] as const,
  list: () => [...postBookmarkQueryKeys.all, 'list'] as const,
};

function updateBookmarkInPage(
  data: PostsPage | undefined,
  placeId: number,
  nextBookmarked: boolean,
  isBookmarkList = false,
) {
  if (!data) {
    return data;
  }

  if (isBookmarkList && !nextBookmarked) {
    return {
      ...data,
      posts: data.posts.filter((post) => post.placeId !== placeId),
    };
  }

  return {
    ...data,
    posts: data.posts.map((post) => (
      post.placeId === placeId
        ? { ...post, bookmarked: nextBookmarked }
        : post
    )),
  };
}

function isExpectedBookmarkStateError(error: unknown, nextBookmarked: boolean) {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const responseData = error.response?.data as { code?: unknown } | undefined;
  const code = String(responseData?.code ?? '').toUpperCase();

  return (nextBookmarked && code === 'BOOKMARK_ALREADY_EXISTS')
    || (!nextBookmarked && code === 'BOOKMARK_NOT_FOUND');
}

export const useBookmarkedPosts = () => {
  const bookmarkedPostsQuery = useQuery({
    queryKey: postBookmarkQueryKeys.list(),
    queryFn: () => placeApi.getBookmarkedPosts({ limit: BOOKMARKS_PAGE_SIZE }),
  });

  const bookmarkedPlaceIds = useMemo(() => (
    (bookmarkedPostsQuery.data?.posts ?? []).reduce<Record<string, boolean>>((acc, post) => {
      acc[String(post.placeId)] = true;
      return acc;
    }, {})
  ), [bookmarkedPostsQuery.data?.posts]);

  return {
    bookmarkedPlaceIds,
    error: bookmarkedPostsQuery.error,
    isError: bookmarkedPostsQuery.isError,
    isLoading: bookmarkedPostsQuery.isLoading,
    posts: bookmarkedPostsQuery.data?.posts ?? [],
    refetch: bookmarkedPostsQuery.refetch,
  };
};

export const usePostBookmark = () => {
  const queryClient = useQueryClient();

  const postBookmarkMutation = useMutation({
    mutationFn: async ({ nextBookmarked, placeId }: TogglePostBookmarkPayload) => {
      try {
        if (nextBookmarked) {
          await placeApi.createBookmark({ placeId });
        } else {
          await placeApi.removeBookmark(placeId);
        }
      } catch (error) {
        if (isExpectedBookmarkStateError(error, nextBookmarked)) {
          return;
        }

        throw error;
      }
    },
    onMutate: async ({ nextBookmarked, placeId }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: postQueryKeys.all }),
        queryClient.cancelQueries({ queryKey: postBookmarkQueryKeys.all }),
      ]);

      const previousPostPages = queryClient.getQueriesData<PostsPage>({
        queryKey: postQueryKeys.all,
      });
      const previousBookmarkedPostPages = queryClient.getQueriesData<PostsPage>({
        queryKey: postBookmarkQueryKeys.all,
      });

      queryClient.setQueriesData<PostsPage>(
        { queryKey: postQueryKeys.all },
        (data) => updateBookmarkInPage(data, placeId, nextBookmarked,false),
      );
      queryClient.setQueriesData<PostsPage>(
        { queryKey: postBookmarkQueryKeys.all },
        (data) => updateBookmarkInPage(data, placeId, nextBookmarked, true),
      );

      return { previousBookmarkedPostPages, previousPostPages };
    },
    onError: (_error, _payload, context) => {
      context?.previousPostPages.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousBookmarkedPostPages.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: postQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: postBookmarkQueryKeys.all }),
      ]);
    },
  });

  return {
    togglePostBookmark: (placeId: number, nextBookmarked: boolean) => (
      postBookmarkMutation.mutateAsync({ nextBookmarked, placeId }).then(() => undefined)
    ),
  };
};

export default usePostBookmark;
