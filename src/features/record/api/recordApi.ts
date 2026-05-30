import { api } from '../../../shared/api/apiClient';
import type {
  ApiCodeErrorResponse,
  ApiFieldErrorResponse,
} from '../../../types/api.types';
import type { RecordUploadFile } from '../model/record.types';

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
  placeId: number;
  title: string;
};

export type CreateRecordResponse = {
  id: number;
  message: string;
};

export type ReportPostRequest = {
  reason: string;
};

export type RecordLikeRequest = {
  mapImageId: number;
};

export type RecordLikeResponse = {
  mapImageId: number;
  userId: number;
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
  const sanitizedUri = uri.split('?')[0] ?? uri;
  const segments = sanitizedUri.split('/');
  const lastSegment = segments[segments.length - 1];

  return lastSegment || `record-${Date.now()}.jpg`;
}

function getMimeType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (!extension) {
    return 'image/jpeg';
  }

  return MIME_TYPE_BY_EXTENSION[extension] ?? 'image/jpeg';
}

function buildCreateRecordFormData(payload: CreateRecordRequest) {
  const formData = new FormData();
  const fileName = payload.file.name ?? getFileNameFromUri(payload.file.uri);
  const mimeType = payload.file.type ?? getMimeType(fileName);

  formData.append('placeId', String(payload.placeId));
  formData.append('title', payload.title);

  if (payload.description) {
    formData.append('description', payload.description);
  }

  formData.append('file', {
    name: fileName,
    type: mimeType,
    uri: payload.file.uri,
  } as any);

  return formData;
}

export const recordApi = {
  createRecord: async (payload: CreateRecordRequest): Promise<CreateRecordResponse> => {
    const formData = buildCreateRecordFormData(payload);
    const { data } = await api.post<CreateRecordResponse>('/map/post/create', formData);
    return data;
  },
  deleteRecord: async (id: number): Promise<string> => {
    const { data } = await api.delete<string>(`/map/post/${id}/delete`);
    return data;
  },
  likeRecord: async (payload: RecordLikeRequest): Promise<RecordLikeResponse> => {
    const { data } = await api.post<RecordLikeResponse>('/map/like', payload);
    return data;
  },
  reportRecord: async (id: number, payload: ReportPostRequest): Promise<string> => {
    const { data } = await api.post<string>(`/map/post/${id}/report`, payload);
    return data;
  },
};
