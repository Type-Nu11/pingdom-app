import { api } from '../../../shared/api/apiClient';
import type { PlaceUploadPhoto } from '../model/place.types';

export type UploadPictureFile = PlaceUploadPhoto;

export type CreatePictureResponse = {
  id: number;
  message: string;
};

export type CreatePictureRequest = {
  file: UploadPictureFile;
  placeId: number;
};

export type UploadErrorResponse = {
  code?: 'INVALID_TOKEN' | 'UPLOAD_ERROR';
  errors?: Record<string, string>;
  message: string;
};

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  gif: 'image/gif',
  heic: 'image/heic',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

function getFileNameFromUri(uri: string) {
  const sanitizedUri = uri.split('?')[0] ?? uri;
  const segments = sanitizedUri.split('/');
  const lastSegment = segments[segments.length - 1];

  return lastSegment || `picture-${Date.now()}.jpg`;
}

function getMimeType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (!extension) {
    return 'image/jpeg';
  }

  return MIME_TYPE_BY_EXTENSION[extension] ?? 'image/jpeg';
}

function buildPictureUploadFormData(payload: CreatePictureRequest) {
  const formData = new FormData();
  const fileName = payload.file.name ?? getFileNameFromUri(payload.file.uri);
  const mimeType = payload.file.type ?? getMimeType(fileName);

  formData.append('placeId', String(payload.placeId));

  // React Native uses a uri/name/type object for file parts even though DOM typings do not model it.
  formData.append('file', {
    name: fileName,
    type: mimeType,
    uri: payload.file.uri,
  } as any);

  return formData;
}

export const pictureApi = {
  createPicture: async (payload: CreatePictureRequest): Promise<CreatePictureResponse> => {
    const formData = buildPictureUploadFormData(payload);
    const { data } = await api.post<CreatePictureResponse>('/map/pictures/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data;
  },
};
