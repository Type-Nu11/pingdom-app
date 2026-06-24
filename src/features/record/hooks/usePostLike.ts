import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordApi } from '../api/recordApi';
import { postQueryKeys } from './usePlacePosts';

type TogglePostLikePayload = {
  nextLiked: boolean;
  postId: number;
};

export const usePostLike = () => {
  const queryClient = useQueryClient();

  const postLikeMutation = useMutation({
    mutationFn: ({ nextLiked, postId }: TogglePostLikePayload) =>
      nextLiked ? recordApi.likePost(postId) : recordApi.unlikePost(postId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: postQueryKeys.all });
    },
  });

  return {
    isPending: postLikeMutation.isPending,
    togglePostLike: (postId: number, nextLiked: boolean) =>
      postLikeMutation.mutateAsync({ postId, nextLiked }).then(() => undefined),
  };
};

export default usePostLike;
