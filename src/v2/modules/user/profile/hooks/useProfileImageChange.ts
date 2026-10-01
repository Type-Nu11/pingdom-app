import { useCallback, useEffect, useRef } from 'react';

import type { ProfileImageFile } from '../model/profile.types';
import {
  pickProfileImage,
  useChangeProfileImage,
  type ProfileImageSource,
} from './useProfile';

export type ProfileImageChangeResult = 'changed' | 'cancelled' | 'ignored';

// Orchestrates pick -> upload for the profile avatar. Errors are rethrown to the
// caller (permission, type, network) so the screen decides how to present them;
// nothing here touches the cached profile unless the server accepted the file,
// so a failure always leaves the previous image in place.
export function useProfileImageChange() {
  const mutation = useChangeProfileImage();
  const { mutateAsync } = mutation;
  const busy = useRef(false);
  const mounted = useRef(true);
  const controller = useRef<AbortController | null>(null);
  const lastFile = useRef<ProfileImageFile | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);

  const upload = useCallback(async (file: ProfileImageFile): Promise<ProfileImageChangeResult> => {
    lastFile.current = file;
    const abort = new AbortController();
    controller.current = abort;
    try {
      await mutateAsync({ file, signal: abort.signal });
      lastFile.current = null;
      return 'changed';
    } finally {
      if (controller.current === abort) controller.current = null;
    }
  }, [mutateAsync]);

  const change = useCallback(async (source: ProfileImageSource): Promise<ProfileImageChangeResult> => {
    if (busy.current) return 'ignored';
    busy.current = true;
    // A failure while picking must not leave an earlier file available to retry().
    lastFile.current = null;
    try {
      const file = await pickProfileImage(source);
      if (!file || !mounted.current) return 'cancelled';
      return await upload(file);
    } finally {
      busy.current = false;
    }
  }, [upload]);

  // Re-sends the file that just failed so the user is not asked to pick again.
  const retry = useCallback(async (): Promise<ProfileImageChangeResult> => {
    const file = lastFile.current;
    if (!file || busy.current || !mounted.current) return 'ignored';
    busy.current = true;
    try {
      return await upload(file);
    } finally {
      busy.current = false;
    }
  }, [upload]);

  const canRetry = useCallback(() => lastFile.current !== null, []);

  return { canRetry, change, isPending: mutation.isPending, retry };
}
