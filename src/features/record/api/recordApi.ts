import axios from 'axios';
import { api } from '../../../shared/api/apiClient';
import type {
  ApiCodeErrorResponse,
  ApiFieldErrorResponse,
} from '../../../types/api.types';
import type { PostsPage, RecordUploadFile, ReportsPage } from '../model/record.types';

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  gif: 'image/gif',
  heic: 'image/heic',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export type UpdateRecordRequest = {
  description?: string;
  file?: RecordUploadFile;
  title: string;
};

export type GetPostsRequest = {
  limit?: number;
  page?: number;
  placeId?: number;
  userId?: number;
};

export type GetReportsRequest = {
  limit?: number;
  page?: number;
};

export type PostReportRequest = {
  reason: string;
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
  deleteRecord: async (id: number): Promise<string> => {
    const { data } = await api.delete<string>(`/map/posts/${id}`);
    return data;
  },
  updateRecord: async (id: number, payload: UpdateRecordRequest): Promise<string> => {
    const formData = buildUpdateRecordFormData(payload);
    const { data } = await api.post<string>(`/map/posts/${id}`, formData, {
      headers: { 'Content-Type': undefined },
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
  reportRecord: async (id: number, payload: PostReportRequest): Promise<string> => {
    const url = `/map/posts/${id}/report`;

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
  getMyReports: async (params: GetReportsRequest = {}): Promise<ReportsPage> => {
    const { data } = await api.get<ReportsPage>('/map/reports', {
      params: {
        limit: params.limit ?? 20,
        page: params.page ?? 1,
      },
    });
    return data;
  },
};
