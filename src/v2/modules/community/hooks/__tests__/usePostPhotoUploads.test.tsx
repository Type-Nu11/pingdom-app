import { act, renderHook } from '@testing-library/react-native';

import type { SelectedPhoto } from '../../../place/visit-verification';
import { ApiError } from '../../api/communityApi';
import { MAX_POST_PHOTOS } from '../../model/photoCount';
import { usePostPhotoUploads } from '../usePostPhotoUploads';

const photo = (name: string, overrides: Partial<SelectedPhoto> = {}): SelectedPhoto => ({
  fileName: `${name}.jpg`,
  height: 100,
  mimeType: 'image/jpeg',
  uri: `file:///photos/${name}.jpg`,
  width: 100,
  ...overrides,
});

type Deferred = { reject: (error: unknown) => void; resolve: (imageId: number) => void; signal?: AbortSignal };

function createApi() {
  const pending: Deferred[] = [];
  const uploadImage = jest.fn((_file: { name: string; type: string; uri: string }, signal?: AbortSignal) => (
    new Promise<{ imageId: number; imageUrl: string }>((resolve, reject) => {
      pending.push({
        reject,
        resolve: (imageId) => resolve({ imageId, imageUrl: `https://cdn.test/${imageId}.jpg` }),
        signal,
      });
    })
  ));
  const deleteImage = jest.fn().mockResolvedValue(undefined);
  return { api: { deleteImage, uploadImage }, deleteImage, pending, uploadImage };
}

async function setup() {
  const mocks = createApi();
  const view = await renderHook(() => usePostPhotoUploads(mocks.api));
  return { ...mocks, ...view };
}

describe('usePostPhotoUploads', () => {
  test('uploads each picked photo as a multipart file part and exposes ids in pick order', async () => {
    const { pending, result, uploadImage } = await setup();

    await act(async () => { result.current.add([photo('a'), photo('b')]); });

    expect(uploadImage).toHaveBeenCalledTimes(2);
    expect(uploadImage.mock.calls[0][0]).toEqual({ name: 'a.jpg', type: 'image/jpeg', uri: 'file:///photos/a.jpg' });
    expect(result.current.photos.map((item) => item.status)).toEqual(['uploading', 'uploading']);
    expect(result.current.isUploading).toBe(true);
    expect(result.current.imageIds).toEqual([]);

    // The second upload finishes first; the ids still follow pick order.
    await act(async () => { pending[1].resolve(22); });
    await act(async () => { pending[0].resolve(11); });

    expect(result.current.photos.map((item) => item.status)).toEqual(['uploaded', 'uploaded']);
    expect(result.current.imageIds).toEqual([11, 22]);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.hasFailed).toBe(false);
  });

  test('zero photos: nothing to upload and nothing blocking', async () => {
    const { result, uploadImage } = await setup();

    await act(async () => { result.current.add([]); });

    expect(uploadImage).not.toHaveBeenCalled();
    expect(result.current.photos).toEqual([]);
    expect(result.current.remaining).toBe(MAX_POST_PHOTOS);
  });

  test('accepts at most ten photos and drops the rest', async () => {
    const { result, uploadImage } = await setup();
    const many = Array.from({ length: 12 }, (_value, index) => photo(`p${index}`));

    await act(async () => { result.current.add(many.slice(0, 7)); });
    await act(async () => { result.current.add(many.slice(7)); });

    expect(result.current.photos).toHaveLength(MAX_POST_PHOTOS);
    expect(result.current.remaining).toBe(0);
    expect(uploadImage).toHaveBeenCalledTimes(MAX_POST_PHOTOS);

    await act(async () => { result.current.add([photo('extra')]); });
    expect(uploadImage).toHaveBeenCalledTimes(MAX_POST_PHOTOS);
  });

  test('a failed upload stays in place and retrying re-sends the same file once', async () => {
    const { pending, result, uploadImage } = await setup();

    await act(async () => { result.current.add([photo('a')]); });
    await act(async () => { pending[0].reject(new ApiError('Network error', { isNetworkError: true })); });

    expect(result.current.photos[0]).toMatchObject({ failure: 'retryable', status: 'failed' });
    expect(result.current.hasFailed).toBe(true);
    expect(result.current.imageIds).toEqual([]);

    const key = result.current.photos[0].key;
    await act(async () => {
      result.current.retry(key);
      // A second tap while the retry is in flight must not start another request.
      result.current.retry(key);
    });

    expect(uploadImage).toHaveBeenCalledTimes(2);
    expect(uploadImage.mock.calls[1][0]).toEqual(uploadImage.mock.calls[0][0]);
    expect(result.current.photos[0].status).toBe('uploading');

    await act(async () => { pending[1].resolve(11); });

    expect(result.current.photos[0]).toMatchObject({ imageId: 11, status: 'uploaded' });
    expect(result.current.hasFailed).toBe(false);
  });

  test.each([
    [new ApiError('too large', { code: 'UPLOAD_TOO_LARGE', status: 413 }), 'tooLarge'],
    [new ApiError('invalid', { code: 'IMAGE_FILE_INVALID', status: 400 }), 'unsupported'],
    [new ApiError('unavailable', { code: 'IMAGE_UPLOAD_UNAVAILABLE', status: 503 }), 'retryable'],
  ])('maps %p to the %s failure', async (error, failure) => {
    const { pending, result } = await setup();

    await act(async () => { result.current.add([photo('a')]); });
    await act(async () => { pending[0].reject(error); });

    expect(result.current.photos[0]).toMatchObject({ failure, status: 'failed' });
  });

  test('a file the server cannot accept is not retried', async () => {
    const { pending, result, uploadImage } = await setup();

    await act(async () => { result.current.add([photo('a')]); });
    await act(async () => { pending[0].reject(new ApiError('too large', { status: 413 })); });
    await act(async () => { result.current.retry(result.current.photos[0].key); });

    expect(uploadImage).toHaveBeenCalledTimes(1);
  });

  test('an unsupported format fails locally without calling the server', async () => {
    const { result, uploadImage } = await setup();

    await act(async () => {
      result.current.add([photo('a', { fileName: 'a.heic', mimeType: 'image/heic', uri: 'file:///photos/a.heic' })]);
    });

    expect(uploadImage).not.toHaveBeenCalled();
    expect(result.current.photos[0]).toMatchObject({ failure: 'unsupported', status: 'failed' });
  });

  test('removing an uploaded photo deletes it on the server', async () => {
    const { deleteImage, pending, result } = await setup();

    await act(async () => { result.current.add([photo('a'), photo('b')]); });
    await act(async () => { pending[0].resolve(11); pending[1].resolve(22); });
    await act(async () => { result.current.remove(result.current.photos[0].key); });

    expect(deleteImage).toHaveBeenCalledTimes(1);
    expect(deleteImage).toHaveBeenCalledWith(11);
    expect(result.current.imageIds).toEqual([22]);
    expect(result.current.remaining).toBe(MAX_POST_PHOTOS - 1);
  });

  test('removing a photo mid-upload aborts it, and a late success is cleaned up', async () => {
    const { deleteImage, pending, result } = await setup();

    await act(async () => { result.current.add([photo('a')]); });
    await act(async () => { result.current.remove(result.current.photos[0].key); });

    expect(pending[0].signal?.aborted).toBe(true);
    expect(result.current.photos).toEqual([]);
    expect(deleteImage).not.toHaveBeenCalled();

    await act(async () => { pending[0].resolve(11); });

    expect(deleteImage).toHaveBeenCalledWith(11);
    expect(result.current.photos).toEqual([]);
  });

  test('unmount aborts in-flight uploads and deletes uploaded images that were never attached', async () => {
    const { deleteImage, pending, result, unmount } = await setup();

    await act(async () => { result.current.add([photo('a'), photo('b')]); });
    await act(async () => { pending[0].resolve(11); });
    await act(async () => { unmount(); });

    expect(pending[1].signal?.aborted).toBe(true);
    expect(deleteImage).toHaveBeenCalledTimes(1);
    expect(deleteImage).toHaveBeenCalledWith(11);

    // The aborted request rejecting afterwards must not update the unmounted hook.
    await act(async () => { pending[1].reject(new ApiError('canceled', { code: 'ERR_CANCELED' })); });
    expect(deleteImage).toHaveBeenCalledTimes(1);
  });

  test('images attached to a created post are kept on unmount', async () => {
    const { deleteImage, pending, result, unmount } = await setup();

    await act(async () => { result.current.add([photo('a')]); });
    await act(async () => { pending[0].resolve(11); });
    await act(async () => { result.current.markAttached(); });
    await act(async () => { unmount(); });

    expect(deleteImage).not.toHaveBeenCalled();
  });

  test('a cleanup failure is swallowed', async () => {
    const { deleteImage, pending, result } = await setup();
    deleteImage.mockRejectedValue(new ApiError('not found', { status: 404 }));

    await act(async () => { result.current.add([photo('a')]); });
    await act(async () => { pending[0].resolve(11); });
    await act(async () => { result.current.remove(result.current.photos[0].key); });

    expect(result.current.photos).toEqual([]);
  });
});
