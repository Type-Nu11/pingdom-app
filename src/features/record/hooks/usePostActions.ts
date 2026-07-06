import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likedPostQueryKeys } from './useLikedPosts';
import { postBookmarkQueryKeys } from './usePostBookmark';
import { postQueryKeys } from './usePlacePosts';
import { recordApi, type UpdateRecordRequest } from '../api/recordApi';
import type { PostsPage } from '../model/record.types';

type UpdatePostPayload = {
  id: number;
  payload: UpdateRecordRequest;
};

function removePostFromPage(data: PostsPage | undefined, postId: number) {
  if (!data) {
    return data;
  }

  return {
    ...data,
    posts: data.posts.filter((post) => post.id !== postId),
    totalCount: Math.max(0, data.totalCount - 1),
  };
}

function updatePostInPage(
  data: PostsPage | undefined,
  postId: number,
  payload: UpdateRecordRequest,
) {
  if (!data) {
    return data;
  }

  return {
    ...data,
    posts: data.posts.map((post) => (
      post.id === postId
        ? {
          ...post,
          description: payload.description ?? post.description,
          imageUrl: payload.file?.uri ?? post.imageUrl,
          title: payload.title,
        }
        : post
    )),
  };
}

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  const deletePostMutation = useMutation({
    mutationFn: (id: number) => recordApi.deleteRecord(id),
    onMutate: async (id) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: likedPostQueryKeys.all }),
        queryClient.cancelQueries({ queryKey: postQueryKeys.all }),
        queryClient.cancelQueries({ queryKey: postBookmarkQueryKeys.all }),
      ]);

      const previousPostPages = queryClient.getQueriesData<PostsPage>({
        queryKey: postQueryKeys.all,
      });
      const previousBookmarkedPostPages = queryClient.getQueriesData<PostsPage>({
        queryKey: postBookmarkQueryKeys.all,
      });
      const previousLikedPostPages = queryClient.getQueriesData<PostsPage>({
        queryKey: likedPostQueryKeys.all,
      });

      queryClient.setQueriesData<PostsPage>(
        { queryKey: likedPostQueryKeys.all },
        (data) => removePostFromPage(data, id),
      );
      queryClient.setQueriesData<PostsPage>(
        { queryKey: postQueryKeys.all },
        (data) => removePostFromPage(data, id),
      );
      queryClient.setQueriesData<PostsPage>(
        { queryKey: postBookmarkQueryKeys.all },
        (data) => removePostFromPage(data, id),
      );

      return { previousBookmarkedPostPages, previousLikedPostPages, previousPostPages };
    },
    onError: (_error, _id, context) => {
      context?.previousLikedPostPages.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousPostPages.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousBookmarkedPostPages.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: likedPostQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: postQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: postBookmarkQueryKeys.all }),
      ]);
    },
  });

  return {
    deletePost: deletePostMutation.mutateAsync,
    isDeleting: deletePostMutation.isPending,
  };
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  const updatePostMutation = useMutation({
    mutationFn: ({ id, payload }: UpdatePostPayload) => recordApi.updateRecord(id, payload),
    onMutate: async ({ id, payload }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: likedPostQueryKeys.all }),
        queryClient.cancelQueries({ queryKey: postQueryKeys.all }),
        queryClient.cancelQueries({ queryKey: postBookmarkQueryKeys.all }),
      ]);

      const previousPostPages = queryClient.getQueriesData<PostsPage>({
        queryKey: postQueryKeys.all,
      });
      const previousBookmarkedPostPages = queryClient.getQueriesData<PostsPage>({
        queryKey: postBookmarkQueryKeys.all,
      });
      const previousLikedPostPages = queryClient.getQueriesData<PostsPage>({
        queryKey: likedPostQueryKeys.all,
      });

      queryClient.setQueriesData<PostsPage>(
        { queryKey: likedPostQueryKeys.all },
        (data) => updatePostInPage(data, id, payload),
      );
      queryClient.setQueriesData<PostsPage>(
        { queryKey: postQueryKeys.all },
        (data) => updatePostInPage(data, id, payload),
      );
      queryClient.setQueriesData<PostsPage>(
        { queryKey: postBookmarkQueryKeys.all },
        (data) => updatePostInPage(data, id, payload),
      );

      return { previousBookmarkedPostPages, previousLikedPostPages, previousPostPages };
    },
    onError: (_error, _payload, context) => {
      context?.previousLikedPostPages.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousPostPages.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousBookmarkedPostPages.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: likedPostQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: postQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: postBookmarkQueryKeys.all }),
      ]);
    },
  });

  return {
    isUpdating: updatePostMutation.isPending,
    updatePost: (id: number, payload: UpdateRecordRequest) => (
      updatePostMutation.mutateAsync({ id, payload })
    ),
  };
};
