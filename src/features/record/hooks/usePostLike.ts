import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { recordApi } from '../api/recordApi';
import type { Post, PostsPage } from '../model/record.types';
import { likedPostQueryKeys } from './useLikedPosts';
import { postQueryKeys, type PostLikeState } from './usePlacePosts';

type TogglePostLikePayload = {
  nextLiked: boolean;
  notificationsId?: number;
  postId: number;
};

function getPostLiked(post: Post) {
  return Boolean(post.liked ?? post.isLiked ?? post.likedByMe);
}

function getNextLikeCount(post: Post, nextLiked: boolean) {
  const currentLiked = getPostLiked(post);

  if (currentLiked === nextLiked) {
    return post.likeCount;
  }

  return Math.max(0, post.likeCount + (nextLiked ? 1 : -1));
}

function updatePostLikeInPage(data: PostsPage | undefined, postId: number, nextLiked: boolean) {
  if (!data) {
    return data;
  }

  return {
    ...data,
    posts: data.posts.map((post) => (
      post.id === postId
        ? {
          ...post,
          isLiked: nextLiked,
          likeCount: getNextLikeCount(post, nextLiked),
          liked: nextLiked,
          likedByMe: nextLiked,
        }
        : post
    )),
  };
}

function updateLikedPostsPage(data: PostsPage | undefined, postId: number, nextLiked: boolean) {
  if (!data) {
    return data;
  }

  if (!nextLiked) {
    return {
      ...data,
      posts: data.posts.filter((post) => post.id !== postId),
      totalCount: Math.max(0, data.totalCount - 1),
    };
  }

  return updatePostLikeInPage(data, postId, nextLiked);
}

function isAlreadyLikedError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const responseData = error.response?.data as { code?: unknown; message?: unknown } | undefined;
  const code = String(responseData?.code ?? '').toUpperCase();
  const message = String(responseData?.message ?? '');
  const lowerMessage = message.toLowerCase();

  return (
    (code.includes('ALREADY') && code.includes('LIKE')) ||
    message.includes('이미 좋아요') ||
    (lowerMessage.includes('already') && lowerMessage.includes('like'))
  );
}

export const usePostLike = () => {
  const queryClient = useQueryClient();

  const postLikeMutation = useMutation({
    mutationFn: async ({ nextLiked, notificationsId, postId }: TogglePostLikePayload) => {
      try {
        if (!nextLiked) {
          return await recordApi.unlikePost(postId);
        }

        return typeof notificationsId === 'number'
          ? await recordApi.likeReturnPost(postId, notificationsId)
          : await recordApi.likePost(postId);
      } catch (error) {
        if (nextLiked && isAlreadyLikedError(error)) {
          return undefined;
        }

        throw error;
      }
    },
    onMutate: async ({ nextLiked, postId }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: likedPostQueryKeys.all }),
        queryClient.cancelQueries({ queryKey: postQueryKeys.all }),
      ]);

      const previousPosts = queryClient.getQueriesData<PostsPage>({
        queryKey: postQueryKeys.all,
      });
      const previousLikedPosts = queryClient.getQueriesData<PostsPage>({
        queryKey: likedPostQueryKeys.all,
      });
      const previousLikeState = queryClient.getQueryData<PostLikeState>(postQueryKeys.likes());

      queryClient.setQueryData<PostLikeState>(
        postQueryKeys.likes(),
        (prev) => ({
          ...prev,
          [String(postId)]: nextLiked,
        })
      );

      queryClient.setQueriesData<PostsPage>(
        { queryKey: postQueryKeys.all },
        (data) => updatePostLikeInPage(data, postId, nextLiked)
      );
      queryClient.setQueriesData<PostsPage>(
        { queryKey: likedPostQueryKeys.all },
        (data) => updateLikedPostsPage(data, postId, nextLiked)
      );

      return { previousLikedPosts, previousLikeState, previousPosts };
    },
    onError: (_error, _payload, context) => {
      queryClient.setQueryData(postQueryKeys.likes(), context?.previousLikeState);

      context?.previousLikedPosts.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousPosts.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: likedPostQueryKeys.all });
    },
  });

  return {
    isPending: postLikeMutation.isPending,
    togglePostLike: (postId: number, nextLiked: boolean, notificationsId?: number) =>
      postLikeMutation.mutateAsync({ postId, nextLiked, notificationsId }).then(() => undefined),
  };
};

export default usePostLike;
