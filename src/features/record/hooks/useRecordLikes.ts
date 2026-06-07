import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { recordApi } from '../api/recordApi';

const RECORD_LIKES_STORAGE_KEY = '@pingdom/record-likes:v1';

type RecordLikeState = Record<string, boolean>;

function parseStoredLikes(value: string | null): RecordLikeState {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.entries(parsed).reduce<RecordLikeState>((acc, [key, isLiked]) => {
      if (typeof isLiked === 'boolean') {
        acc[key] = isLiked;
      }

      return acc;
    }, {});
  } catch {
    return {};
  }
}

export const useRecordLikes = () => {
  const [likedById, setLikedById] = useState<RecordLikeState>({});
  const [pendingById, setPendingById] = useState<RecordLikeState>({});
  const likedByIdRef = useRef<RecordLikeState>({});
  const pendingByIdRef = useRef<RecordLikeState>({});

  useEffect(() => {
    likedByIdRef.current = likedById;
  }, [likedById]);

  useEffect(() => {
    pendingByIdRef.current = pendingById;
  }, [pendingById]);

  useEffect(() => {
    let isMounted = true;

    const hydrateLikes = async () => {
      const storedValue = await AsyncStorage.getItem(RECORD_LIKES_STORAGE_KEY);

      if (isMounted) {
        setLikedById(parseStoredLikes(storedValue));
      }
    };

    hydrateLikes();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistLikes = useCallback(async (nextLikes: RecordLikeState) => {
    await AsyncStorage.setItem(RECORD_LIKES_STORAGE_KEY, JSON.stringify(nextLikes));
  }, []);

  const isRecordLiked = useCallback(
    (mapImageId: number) => Boolean(likedById[String(mapImageId)]),
    [likedById],
  );

  const isRecordLikePending = useCallback(
    (mapImageId: number) => Boolean(pendingById[String(mapImageId)]),
    [pendingById],
  );

  const toggleRecordLike = useCallback(async (mapImageId: number) => {
    const key = String(mapImageId);

    if (pendingByIdRef.current[key]) {
      return;
    }

    const previousLikes = likedByIdRef.current;
    const nextLikes = {
      ...previousLikes,
      [key]: !previousLikes[key],
    };

    setPendingById((prev) => ({ ...prev, [key]: true }));
    setLikedById(nextLikes);

    try {
      await recordApi.toggleRecordLike({ mapImageId });
      await persistLikes(nextLikes);
    } catch (error) {
      setLikedById(previousLikes);
      await persistLikes(previousLikes);
      console.warn('record like toggle failed', error);
    } finally {
      setPendingById((prev) => ({ ...prev, [key]: false }));
    }
  }, [persistLikes]);

  return {
    isRecordLiked,
    isRecordLikePending,
    toggleRecordLike,
  };
};

export default useRecordLikes;
