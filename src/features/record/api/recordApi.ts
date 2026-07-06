import axios from 'axios';
import { api } from '../../../shared/api/apiClient';
import type {
  ApiCodeErrorResponse,
  ApiFieldErrorResponse,
} from '../../../types/api.types';
import type { PostsPage, RecordUploadFile } from '../model/record.types';

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  gif: 'image/gif',
  heic: 'image/heic',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export type CreateRecordRequest = {
  description?: string;
  file: RecordUploadFile;
  kakaoPlaceId?: string;
  placeId?: number;
  title: string;
  validPlace?: boolean;
};

export type UpdateRecordRequest = {
  description?: string;
  file?: RecordUploadFile;
  title: string;
};

export type CreateRecordResponse = {
  id: number;
  message: string;
};

export type GetPostsRequest = {
  limit?: number;
  page?: number;
  placeId?: number;
  userId?: number;
};

export type GetLikedPostsRequest = {
  limit?: number;
  page?: number;
};

export type RecordLikeRequest = {
  mapImageId: number;
};

export type PostReportRequest = {
  reason: string;
};

export type RecordLikeResponse = {
  message?: string;
  mapImageId: number;
  userId: number;
};

export type PostLikeResponse = RecordLikeResponse;

export type PostLikeReturnResponse = PostLikeResponse | {
  isLiked?: boolean;
  likeCount?: number;
  liked?: boolean;
  likedByMe?: boolean;
  message?: string;
};

export type RecordApiErrorCode =
  | 'ALREADY_REPORTED_IMAGE'
  | 'IMAGE_NOT_FOUND'
  | 'INVALID_TOKEN'
  | 'OTHERS_NOT_DELETED'
  | 'PLACE_NOT_FOUND'
  | 'UPLOAD_ERROR';

export type RecordApiErrorResponse = ApiCodeErrorResponse<RecordApiErrorCode>;
export type RecordValidationErrorResponse = ApiFieldErrorResponse;

function getFileNameFromUri(uri: string) {
  const sanitizedUri = uri.split('?')[0];
  const segments = sanitizedUri.split('/');
  const lastSegment = segments[segments.length - 1];

  return lastSegment || `record-${Date.now()}.jpg`;
}

function getMimeType(fileName: string) {
  const parts = fileName.split('.');
  const extension = parts.length > 1 ? parts.pop()?.toLowerCase() : undefined;
  if (!extension) {
    return 'image/jpeg';
  }
  return MIME_TYPE_BY_EXTENSION[extension] ?? 'image/jpeg';
}

function buildCreateRecordFormData(payload: CreateRecordRequest) {
  const formData = new FormData();
  const fileName = payload.file.name ?? getFileNameFromUri(payload.file.uri);
  const mimeType = payload.file.type ?? getMimeType(fileName);

  formData.append('title', payload.title);

  if (payload.description) {
    formData.append('description', payload.description);
  }

  if (payload.kakaoPlaceId) {
    formData.append('kakaoPlaceId', payload.kakaoPlaceId);
  }

  if (payload.placeId !== undefined) {
    formData.append('placeId', String(payload.placeId));
  }

  if (payload.validPlace !== undefined) {
    formData.append('validPlace', String(payload.validPlace));
  }

  formData.append('file', {
    name: fileName,
    type: mimeType,
    uri: payload.file.uri,
  } as any);

  return formData;
}

function appendRecordFile(formData: FormData, file: RecordUploadFile) {
  const fileName = file.name ?? getFileNameFromUri(file.uri);
  const mimeType = file.type ?? getMimeType(fileName);

  formData.append('file', {
    name: fileName,
    type: mimeType,
    uri: file.uri,
  } as any);
}

function buildUpdateRecordFormData(payload: UpdateRecordRequest) {
  const formData = new FormData();

  formData.append('title', payload.title);

  if (payload.description !== undefined) {
    formData.append('description', payload.description);
  }

  if (payload.file) {
    appendRecordFile(formData, payload.file);
  }

  return formData;
}

export const recordApi = {
  createRecord: async (payload: CreateRecordRequest): Promise<CreateRecordResponse> => {
    const formData = buildCreateRecordFormData(payload);
    const { data } = await api.post<CreateRecordResponse>('/map/post/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  deleteRecord: async (id: number): Promise<string> => {
    const { data } = await api.delete<string>(`/map/post/${id}/delete`);
    return data;
  },
  updateRecord: async (id: number, payload: UpdateRecordRequest): Promise<string> => {
    const formData = buildUpdateRecordFormData(payload);
    const { data } = await api.post<string>(`/map/post/${id}/update`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  getPosts: async (params: GetPostsRequest = {}): Promise<PostsPage> => {
    const { data } = await api.get<PostsPage>('/map/posts', {
      params: {
        limit: params.limit ?? 100,
        page: params.page ?? 1,
        ...(params.placeId !== undefined ? { placeId: params.placeId } : {}),
        ...(params.userId !== undefined ? { userId: params.userId } : {}),
      },
    });

    return data;
  },
  getLikedPosts: async (params: GetLikedPostsRequest = {}): Promise<PostsPage> => {
    const { data } = await api.get<PostsPage>('/map/like', {
      params: {
        limit: params.limit ?? 100,
        page: params.page ?? 1,
      },
    });

    return data;
  },
  likeRecord: async (payload: RecordLikeRequest): Promise<RecordLikeResponse> => {
    const { data } = await api.post<RecordLikeResponse>('/map/like', payload);
    return data;
  },
  unlikeRecord: async (postId: number): Promise<void> => {
    await api.delete(`/map/like/${postId}`);
  },
  likePost: async (postId: number): Promise<PostLikeResponse> => {
    const { data } = await api.post<PostLikeResponse>('/map/like', {
      mapImageId: postId,
    });
    return data;
  },
  likeReturnPost: async (
    postId: number,
    notificationsId: number
  ): Promise<PostLikeReturnResponse> => {
    const { data } = await api.post<PostLikeReturnResponse>(
      `/map/like/return/${postId}/${notificationsId}`
    );
    return data;
  },
  unlikePost: async (postId: number): Promise<PostLikeResponse> => {
    const { data } = await api.delete<PostLikeResponse>(`/map/like/${postId}`);
    return data;
  },
  reportRecord: async (id: number, payload: PostReportRequest): Promise<string> => {
    const url = `/map/post/${id}/report`;

    if (__DEV__) {
      console.log('[PostReport] request', { body: payload, method: 'POST', url });
    }

    try {
      const response = await api.post<string>(url, payload);

      if (__DEV__) {
        console.log('[PostReport] response', {
          data: response.data,
          status: response.status,
          url,
        });
      }

      return response.data;
    } catch (error) {
      if (__DEV__) {
        if (axios.isAxiosError(error)) {
          console.log('[PostReport] response error', {
            data: error.response?.data,
            message: error.message,
            status: error.response?.status,
            url,
          });
        } else {
          console.log('[PostReport] unexpected error', { error, url });
        }
      }

      throw error;
    }
  },
};
