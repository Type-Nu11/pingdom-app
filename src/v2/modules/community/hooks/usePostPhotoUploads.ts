import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// The shared V2 photo picker contract and multipart part builder (JPEG/PNG
// only) already used for visit-verification review photos.
import { reviewPhotoPart, type SelectedPhoto } from '../../place/visit-verification';
import { ApiError, communityApi } from '../api/communityApi';
import { MAX_POST_PHOTOS } from '../model/photoCount';

export type PostPhotoStatus = 'failed' | 'uploaded' | 'uploading';
/** Why an upload failed; only `retryable` can be sent again as-is. */
export type PostPhotoFailure = 'retryable' | 'tooLarge' | 'unsupported';

export type PostPhoto = {
  failure?: PostPhotoFailure;
  imageId?: number;
  key: string;
  status: PostPhotoStatus;
  uri: string;
};

type CommunityImageApi = Pick<typeof communityApi, 'deleteImage' | 'uploadImage'>;

function failureOf(error: unknown): PostPhotoFailure {
  const status = error instanceof ApiError ? error.status : undefined;
  if (status === 413) return 'tooLarge';
  // 400 IMAGE_FILE_INVALID / 415: the file itself was rejected.
  if (status === 400 || status === 415) return 'unsupported';
  return 'retryable';
}

/**
 * Photos attached to a post being written. Each picked photo is uploaded
 * right away (`POST /community/images`) and the resulting `imageId`s are sent
 * with the post in the order the photos were picked.
 *
 * - at most `MAX_POST_PHOTOS`; extra picks are dropped
 * - a failed upload keeps its tile and can be retried without re-picking
 * - removing a photo aborts its upload, or deletes the uploaded image
 * - leaving the screen aborts in-flight uploads and deletes images that were
 *   uploaded but never attached; `markAttached()` after a successful post
 *   keeps them. Anything a failed cleanup leaves behind is expired by the
 *   server after 24 hours.
 */
export function usePostPhotoUploads(api: CommunityImageApi = communityApi) {
  const [photos, setPhotos] = useState<PostPhoto[]>([]);
  const photosRef = useRef<PostPhoto[]>([]);
  const sources = useRef(new Map<string, SelectedPhoto>());
  const controllers = useRef(new Map<string, AbortController>());
  const nextKey = useRef(0);
  const mounted = useRef(true);
  const attached = useRef(false);

  const commit = useCallback((update: (current: PostPhoto[]) => PostPhoto[]) => {
    photosRef.current = update(photosRef.current);
    if (mounted.current) setPhotos(photosRef.current);
  }, []);

  const patch = useCallback((key: string, next: Partial<PostPhoto>) => {
    commit((current) => current.map((photo) => (photo.key === key ? { ...photo, ...next } : photo)));
  }, [commit]);

  const discard = useCallback((imageId: number) => {
    void api.deleteImage(imageId).catch(() => {});
  }, [api]);

  const upload = useCallback((key: string) => {
    const source = sources.current.get(key);
    // One request per photo at a time.
    if (!source || controllers.current.has(key)) return;

    let part: ReturnType<typeof reviewPhotoPart>;
    try {
      part = reviewPhotoPart(source);
    } catch {
      patch(key, { failure: 'unsupported', status: 'failed' });
      return;
    }

    const controller = new AbortController();
    controllers.current.set(key, controller);
    patch(key, { failure: undefined, status: 'uploading' });

    api.uploadImage(part, controller.signal).then(
      (result) => {
        controllers.current.delete(key);
        const stillWanted = mounted.current && photosRef.current.some((photo) => photo.key === key);
        if (typeof result.imageId !== 'number') {
          if (stillWanted) patch(key, { failure: 'retryable', status: 'failed' });
          return;
        }
        // Removed or left while the request was finishing: the image exists on
        // the server but nothing will attach it.
        if (!stillWanted) {
          discard(result.imageId);
          return;
        }
        patch(key, { failure: undefined, imageId: result.imageId, status: 'uploaded' });
      },
      (error: unknown) => {
        controllers.current.delete(key);
        if (controller.signal.aborted) return;
        patch(key, { failure: failureOf(error), status: 'failed' });
      },
    );
  }, [api, discard, patch]);

  const add = useCallback((picked: readonly SelectedPhoto[]) => {
    const remaining = MAX_POST_PHOTOS - photosRef.current.length;
    if (remaining <= 0) return;
    const accepted = picked.slice(0, remaining).map((photo) => {
      const key = `photo-${nextKey.current}`;
      nextKey.current += 1;
      sources.current.set(key, photo);
      return { key, status: 'uploading' as const, uri: photo.uri };
    });
    commit((current) => [...current, ...accepted]);
    accepted.forEach((photo) => upload(photo.key));
  }, [commit, upload]);

  const retry = useCallback((key: string) => {
    const photo = photosRef.current.find((item) => item.key === key);
    if (photo?.status === 'failed' && photo.failure === 'retryable') upload(key);
  }, [upload]);

  const remove = useCallback((key: string) => {
    const photo = photosRef.current.find((item) => item.key === key);
    if (!photo) return;
    controllers.current.get(key)?.abort();
    controllers.current.delete(key);
    sources.current.delete(key);
    commit((current) => current.filter((item) => item.key !== key));
    if (typeof photo.imageId === 'number') discard(photo.imageId);
  }, [commit, discard]);

  /** The post was created with these images: they must survive unmount. */
  const markAttached = useCallback(() => {
    attached.current = true;
  }, []);

  useEffect(() => {
    mounted.current = true;
    const pending = controllers.current;
    return () => {
      mounted.current = false;
      pending.forEach((controller) => controller.abort());
      pending.clear();
      if (attached.current) return;
      photosRef.current.forEach((photo) => {
        if (typeof photo.imageId === 'number') discard(photo.imageId);
      });
    };
  }, [discard]);

  return useMemo(() => ({
    add,
    /** Uploaded image ids in the order the photos were picked. */
    imageIds: photos.flatMap((photo) => (
      photo.status === 'uploaded' && typeof photo.imageId === 'number' ? [photo.imageId] : []
    )),
    hasFailed: photos.some((photo) => photo.status === 'failed'),
    isUploading: photos.some((photo) => photo.status === 'uploading'),
    markAttached,
    photos,
    remaining: MAX_POST_PHOTOS - photos.length,
    remove,
    retry,
  }), [add, markAttached, photos, remove, retry]);
}
