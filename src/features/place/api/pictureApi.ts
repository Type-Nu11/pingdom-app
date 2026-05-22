import { api } from '../../../shared/api/apiClient';

export type UploadPictureFile = {
  name?: string;
  type?: string;
  uri: string;
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

function buildPictureUploadFormData(file: UploadPictureFile) {
  const formData = new FormData();
  const fileName = file.name ?? getFileNameFromUri(file.uri);
  const mimeType = file.type ?? getMimeType(fileName);

  // React Native uses a uri/name/type object for file parts even though DOM typings do not model it.
  formData.append('file', {
    name: fileName,
    type: mimeType,
    uri: file.uri,
  } as any);

  return formData;
}

export const pictureApi = {
  createPicture: async (file: UploadPictureFile): Promise<unknown> => {
    const formData = buildPictureUploadFormData(file);
    const { data } = await api.post('/map/pictures/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  },
};
