import AsyncStorage from '@react-native-async-storage/async-storage';
import { create, type StoreApi, type UseBoundStore } from 'zustand';

import type { AppearancePreference } from './appearance';
import {
  readAppearancePreference,
  writeAppearancePreference,
  type AppearanceStorage,
} from './appearanceStorage';

export type AppearanceHydrationStatus = 'idle' | 'hydrating' | 'hydrated';

export type AppearanceState = {
  preference: AppearancePreference;
  hydrationStatus: AppearanceHydrationStatus;
  hydrate: () => Promise<void>;
  setPreference: (preference: AppearancePreference) => Promise<void>;
};

export type AppearanceStore = UseBoundStore<StoreApi<AppearanceState>>;

export function createAppearanceStore(
  storage: AppearanceStorage,
): AppearanceStore {
  let hydrationPromise: Promise<void> | null = null;
  let selectionRevision = 0;
  let pendingPreference: AppearancePreference | null = null;
  let writeLoop: Promise<void> | null = null;

  const persistLatest = (): Promise<void> => {
    if (!writeLoop) {
      writeLoop = (async () => {
        while (pendingPreference) {
          const nextPreference = pendingPreference;
          pendingPreference = null;
          try {
            await writeAppearancePreference(storage, nextPreference);
          } catch {
            console.warn('[Appearance] Failed to persist preference.');
          }
        }
      })().finally(() => {
        writeLoop = null;
        if (pendingPreference) void persistLatest();
      });
    }
    return writeLoop;
  };

  return create<AppearanceState>((set, get) => ({
    preference: 'SYSTEM',
    hydrationStatus: 'idle',

    hydrate: () => {
      if (get().hydrationStatus === 'hydrated') return Promise.resolve();
      if (hydrationPromise) return hydrationPromise;

      const revisionAtStart = selectionRevision;
      set({ hydrationStatus: 'hydrating' });
      hydrationPromise = readAppearancePreference(storage)
        .then((preference) => {
          set(selectionRevision === revisionAtStart
            ? { preference, hydrationStatus: 'hydrated' }
            : { hydrationStatus: 'hydrated' });
        })
        .finally(() => {
          hydrationPromise = null;
        });
      return hydrationPromise;
    },

    setPreference: (preference) => {
      selectionRevision += 1;
      pendingPreference = preference;
      set({ preference });
      return persistLatest();
    },
  }));
}

export const useAppearanceStore = createAppearanceStore(AsyncStorage);
