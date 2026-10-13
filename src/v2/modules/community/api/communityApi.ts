import {
  ApiError,
  apiClient,
  type ApiClient,
  type CommunityOperationQuery,
  type CommunityOperationRequestBody,
  type CommunityOperationResponse,
  type CommunitySchema,
} from '../../../shared/api';

// The community surface (`/community/categories`, `/community/countries`,
// `/community/posts`, `/community/images`, `/community/posts/{postId}/comments`,
// `/community/posts/{postId}/likes`, `/community/comments/{commentId}/likes`,
// `/community/posts/{postId}/places/{placeId}/view`, reports) is typed from the
// scoped live-server snapshot (`docs/api/community.openapi.json`), regenerated
// via `npm run sync:community-openapi && npm run generate:community-api-types`.
// 400/401/403/404 all normalize to shared/api's ApiError regardless of the
// response schema a given status declares — hooks and screens never import
// shared/api directly, so it is re-exported from this module.
export { ApiError };

export type CommunityCategory = CommunitySchema<'CommunityCategoryItem'>;
export type ListCategoriesResponse = CommunityOperationResponse<'listCategories', 200>;

export type ListPostsByCategoryParams = CommunityOperationQuery<'listPostsByCategory'>;
export type CommunityPostPage = CommunityOperationResponse<'listPostsByCategory', 200>;
export type CommunityPostSummary = CommunitySchema<'CommunityPostSummary'>;
// The snapshot declares no 200 for `GET /community/posts` (its list schema is
// documented under 400), so the all-posts page reuses the category page type —
// both resolve to `CommunityPostListResponse`.
export type ListPostsParams = CommunityOperationQuery<'listPosts'>;
export type ListCountriesResponse = CommunityOperationResponse<'listCountries', 200>;

export type CommunityPostImage = CommunitySchema<'CommunityPostImageItem'>;
export type CommunityPlace = CommunitySchema<'Place'>;
export type CommunityImageUpload = CommunityOperationResponse<'uploadImage', 201>;
/** React Native multipart file part (`{ uri, name, type }`). */
export type CommunityImageFile = { name: string; type: string; uri: string };

export type CreatePostBody = CommunityOperationRequestBody<'createPost'>;
export type CreatePostResponse = CommunityOperationResponse<'createPost', 201>;

export type CommunityPostDetail = CommunityOperationResponse<'getPost', 200>;

export type ListCommentsParams = CommunityOperationQuery<'listComments'>;
export type CommunityCommentPage = CommunityOperationResponse<'listComments', 200>;
export type CommunityComment = CommunitySchema<'CommunityCommentSummary'>;

export type CreateCommentBody = CommunityOperationRequestBody<'createComment'>;
export type CreateCommentResponse = CommunityOperationResponse<'createComment', 201>;

export type CommunityLikeStatus = CommunityOperationResponse<'getLikeStatus', 200>;
export type CommunityCommentLikeStatus = CommunityOperationResponse<'likeComment', 200>;

export type RecordPlaceViewResponse = CommunityOperationResponse<'recordPlaceView', 200>;

export type ReportBody = CommunityOperationRequestBody<'reportPost'>;
export type ReportResponse = CommunityOperationResponse<'reportPost', 201>;

export function createCommunityApi(client: ApiClient = apiClient) {
  return {
    listCategories: (signal?: AbortSignal): Promise<ListCategoriesResponse> =>
      client.get<ListCategoriesResponse>('/community/categories', { signal }),

    listCountries: (signal?: AbortSignal): Promise<ListCountriesResponse> =>
      client.get<ListCountriesResponse>('/community/countries', { signal }),

    listPosts: (params: ListPostsParams = {}, signal?: AbortSignal): Promise<CommunityPostPage> =>
      client.get<CommunityPostPage>('/community/posts', { params, signal }),

    listPostsByCategory: (
      categoryId: string,
      params: ListPostsByCategoryParams = {},
      signal?: AbortSignal,
    ): Promise<CommunityPostPage> =>
      client.get<CommunityPostPage>(`/community/categories/${categoryId}/posts`, { params, signal }),

    createPost: (body: CreatePostBody, signal?: AbortSignal): Promise<CreatePostResponse> =>
      client.post<CreatePostResponse, CreatePostBody>('/community/posts', body, { signal }),

    uploadImage: (file: CommunityImageFile, signal?: AbortSignal): Promise<CommunityImageUpload> => {
      const formData = new FormData();
      formData.append('file', file as unknown as Blob);
      return client.post<CommunityImageUpload, FormData>('/community/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal,
      });
    },

    // Best-effort cleanup of an uploaded image that will not be attached; the
    // server also expires unattached images on its own after 24 hours.
    deleteImage: (imageId: number): Promise<void> =>
      client.delete<void>(`/community/images/${imageId}`),

    getPost: (postId: number, signal?: AbortSignal): Promise<CommunityPostDetail> =>
      client.get<CommunityPostDetail>(`/community/posts/${postId}`, { signal }),

    listComments: (
      postId: number,
      params: ListCommentsParams = {},
      signal?: AbortSignal,
    ): Promise<CommunityCommentPage> =>
      client.get<CommunityCommentPage>(`/community/posts/${postId}/comments`, { params, signal }),

    createComment: (
      postId: number,
      body: CreateCommentBody,
      signal?: AbortSignal,
    ): Promise<CreateCommentResponse> =>
      client.post<CreateCommentResponse, CreateCommentBody>(
        `/community/posts/${postId}/comments`,
        body,
        { signal },
      ),

    getLikeStatus: (postId: number, signal?: AbortSignal): Promise<CommunityLikeStatus> =>
      client.get<CommunityLikeStatus>(`/community/posts/${postId}/likes`, { signal }),

    // Like/unlike are non-idempotent toggles; no AbortSignal is attached so a
    // torn-down screen cannot leave the server state out of sync with what the
    // client believes happened (mirrors issueCoupon's reasoning).
    likePost: (postId: number): Promise<CommunityLikeStatus> =>
      client.post<CommunityLikeStatus>(`/community/posts/${postId}/likes`),

    unlikePost: (postId: number): Promise<CommunityLikeStatus> =>
      client.delete<CommunityLikeStatus>(`/community/posts/${postId}/likes`),

    // Same non-idempotent toggle reasoning as the post like above.
    likeComment: (commentId: number): Promise<CommunityCommentLikeStatus> =>
      client.post<CommunityCommentLikeStatus>(`/community/comments/${commentId}/likes`),

    unlikeComment: (commentId: number): Promise<CommunityCommentLikeStatus> =>
      client.delete<CommunityCommentLikeStatus>(`/community/comments/${commentId}/likes`),

    recordPlaceView: (
      postId: number,
      placeId: number,
      signal?: AbortSignal,
    ): Promise<RecordPlaceViewResponse> =>
      client.post<RecordPlaceViewResponse>(
        `/community/posts/${postId}/places/${placeId}/view`,
        undefined,
        { signal },
      ),

    reportPost: (postId: number, body: ReportBody, signal?: AbortSignal): Promise<ReportResponse> =>
      client.post<ReportResponse, ReportBody>(`/community/posts/${postId}/reports`, body, { signal }),

    reportComment: (
      postId: number,
      commentId: number,
      body: ReportBody,
      signal?: AbortSignal,
    ): Promise<ReportResponse> =>
      client.post<ReportResponse, ReportBody>(
        `/community/posts/${postId}/comments/${commentId}/reports`,
        body,
        { signal },
      ),
  };
}

export const communityApi = createCommunityApi();
