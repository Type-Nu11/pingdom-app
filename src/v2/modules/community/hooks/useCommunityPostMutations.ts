import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi, type CommunityPostSummary, type CommunityImageFile, type CreatePostBody, type UpdatePostBody, type ReportBody, type CommunityApi } from '../api/communityApi';
import { invalidatePostLists } from '../model/communityCache';
import { communityQueryKeys } from '../model/communityQueryKeys';

/**
 * Post creation is non-idempotent: no AbortSignal is attached (a torn-down
 * screen must not leave the server unaware a create actually went through)
 * and retry is explicitly disabled so a transient failure never becomes a
 * silent duplicate post.
 */
export function useCreatePost(api: Pick<CommunityApi, 'createPost'> = communityApi) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePostBody) => api.createPost(body),
    retry: false,
    // Only the feeds the new post appears in are invalidated — its category
    // and the "All" tab. Other categories' cached pages, and the category
    // list itself, are untouched.
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: communityQueryKeys.postsRoot(variables.categoryId) }),
        queryClient.invalidateQueries({ queryKey: communityQueryKeys.allPostsRoot }),
        queryClient.invalidateQueries({ queryKey: communityQueryKeys.mineRoot }),
      ]);
    },
  });
}

/**
 * Non-idempotent: no AbortSignal (leaving the screen mid-request must not
 * cancel a view the server may already be counting) and retry disabled
 * (retrying a timed-out request would risk a second view for the same tap).
 */
export function useRecordPlaceView(api: Pick<CommunityApi, 'recordPlaceView'> = communityApi) {
  return useMutation({
    mutationFn: ({ placeId, postId }: { placeId: number; postId: number }) =>
      api.recordPlaceView(postId, placeId),
    retry: false,
  });
}

export function useReportPost(
  postId: number,
  api: Pick<CommunityApi, 'reportPost'> = communityApi,
) {
  return useMutation({
    mutationFn: (body: ReportBody) => api.reportPost(postId, body),
  });
}

export function useUpdatePost(postId: number) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (body: UpdatePostBody) => communityApi.updatePost(postId, body), retry: false,
    onSuccess: async () => { await Promise.all([
      client.invalidateQueries({ queryKey: communityQueryKeys.post(postId) }), invalidatePostLists(client),
    ]); },
  });
}

export function useDeletePost(postId: number) {
  const client = useQueryClient();
  return useMutation({ mutationFn: () => communityApi.deletePost(postId), retry: false,
    onSuccess: async () => {
      await client.cancelQueries({ predicate: query => {
        const key = query.queryKey;
        return key[0] === 'v2' && key[1] === 'community' && (key[2] === 'mine'
          || (key[2] === 'categories' && key[4] === 'posts')
          || (key[2] === 'posts' && (key[3] === 'all' || key[3] === postId || (key[3] === 'detail' && key[4] === postId))));
      } });
      client.setQueriesData({ queryKey: ['v2', 'community'] }, (data: unknown) => {
        if (!data || typeof data !== 'object' || !('pages' in data) || !Array.isArray(data.pages)) return data;
        return { ...data, pages: data.pages.map((page: { posts?: CommunityPostSummary[] }) => page.posts ? ({
          ...page, posts: page.posts.filter(post => post.postId !== postId),
        }) : page) };
      });
      client.removeQueries({ queryKey: communityQueryKeys.post(postId), exact: true });
      client.removeQueries({ queryKey: communityQueryKeys.commentsRoot(postId) });
      client.removeQueries({ queryKey: communityQueryKeys.likeStatus(postId) });
      await invalidatePostLists(client);
    },
  });
}

export function useCommunityEditMedia() {
  return useMemo(() => ({
    upload: async (source: CommunityImageFile) => (await communityApi.uploadImage(source)).imageId!,
    discard: (id: number) => communityApi.deleteImage(id),
  }), []);
}
