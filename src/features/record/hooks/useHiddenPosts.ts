import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

const HIDDEN_POSTS_STORAGE_KEY = '@pingdom/hidden-posts:v1';

type HiddenPostIds = Record<string, boolean>;

function parseHiddenPostIds(value: string | null): HiddenPostIds {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.entries(parsed).reduce<HiddenPostIds>((hiddenPostIds, [postId, isHidden]) => {
      if (isHidden === true) {
        hiddenPostIds[postId] = true;
      }

      return hiddenPostIds;
    }, {});
  } catch {
    return {};
  }
}

export const useHiddenPosts = () => {
  const [hiddenPostIds, setHiddenPostIds] = useState<HiddenPostIds>({});
  const hiddenPostIdsRef = useRef<HiddenPostIds>({});
  const hydrationPromiseRef = useRef<Promise<HiddenPostIds> | null>(null);

  if (!hydrationPromiseRef.current) {
    hydrationPromiseRef.current = (async () => {
      try {
        const storedValue = await AsyncStorage.getItem(HIDDEN_POSTS_STORAGE_KEY);
        return parseHiddenPostIds(storedValue);
      } catch (error) {
        console.warn('hidden post hydration failed', error);
        return {};
      }
    })();
  }

  useEffect(() => {
    let isMounted = true;

    const hydrateHiddenPosts = async () => {
      const storedHiddenPostIds = await hydrationPromiseRef.current;

      if (!isMounted) {
        return;
      }

      setHiddenPostIds((currentHiddenPostIds) => {
        const nextHiddenPostIds = { ...storedHiddenPostIds, ...currentHiddenPostIds };
        hiddenPostIdsRef.current = nextHiddenPostIds;
        return nextHiddenPostIds;
      });
    };

    void hydrateHiddenPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const hidePost = useCallback(async (postId: number) => {
    const postKey = String(postId);
    const storedHiddenPostIds = await (hydrationPromiseRef.current ?? Promise.resolve({}));
    const nextHiddenPostIds = {
      ...storedHiddenPostIds,
      ...hiddenPostIdsRef.current,
      [postKey]: true,
    };

    hiddenPostIdsRef.current = nextHiddenPostIds;
    setHiddenPostIds(nextHiddenPostIds);

    try {
      await AsyncStorage.setItem(HIDDEN_POSTS_STORAGE_KEY, JSON.stringify(nextHiddenPostIds));
    } catch (error) {
      console.warn('hidden post persistence failed', error);
    }
  }, []);

  return {
    hiddenPostIds,
    hidePost,
  };
};

export default useHiddenPosts;
