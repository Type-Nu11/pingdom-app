import { create, type UseBoundStore, type StoreApi } from 'zustand';

import {
  addRecentSearch,
  type AddRecentSearchInput,
  type RecentSearch,
} from '../model/recentSearch';
import {
  getRecentSearchOwnerKey,
  queueRecentSearchPersist,
  restoreRecentSearches,
  type RecentSearchOwner,
} from '../services/recentSearchStorage';

export type RecentSearchHydrationStatus = 'error' | 'idle' | 'loading' | 'ready';
export type RecentSearchStorageError = 'invalid-data' | 'read-failed' | 'write-failed';

export type RecentSearchStore = Readonly<{
  activeOwnerKey: string | null;
  hydrationStatus: RecentSearchHydrationStatus;
  items: readonly RecentSearch[];
  storageError: RecentSearchStorageError | null;
}> & {
  activateOwner(owner: RecentSearchOwner): Promise<void>;
  clearSearches(owner?: RecentSearchOwner): Promise<void>;
  deactivateOwner(): void;
  recordSearch(input: AddRecentSearchInput, owner?: RecentSearchOwner): Promise<void>;
  removeSearch(id: string, owner?: RecentSearchOwner): Promise<void>;
};

export function createRecentSearchStore(): UseBoundStore<StoreApi<RecentSearchStore>> {
  let activation = 0;
  let activeOwner: RecentSearchOwner | null = null;
  let hydrationOwnerKey: string | null = null;
  let hydrationPromise: Promise<void> | null = null;

  return create<RecentSearchStore>((set, get) => {
    const activateOwner = (owner: RecentSearchOwner): Promise<void> => {
      const ownerKey = getRecentSearchOwnerKey(owner);
      const current = get();

      if (current.activeOwnerKey === ownerKey) {
        if (current.hydrationStatus === 'ready' || current.hydrationStatus === 'error') {
          return Promise.resolve();
        }
        if (hydrationOwnerKey === ownerKey && hydrationPromise) return hydrationPromise;
      }

      const requestActivation = ++activation;
      activeOwner = owner;
      set({
        activeOwnerKey: ownerKey,
        hydrationStatus: 'loading',
        items: [],
        storageError: null,
      });

      hydrationOwnerKey = ownerKey;
      hydrationPromise = (async () => {
        try {
          const restored = await restoreRecentSearches(owner);
          if (requestActivation !== activation || get().activeOwnerKey !== ownerKey) return;

          set({
            hydrationStatus: restored.kind === 'invalid' ? 'error' : 'ready',
            items: restored.items,
            storageError: restored.kind === 'invalid' ? 'invalid-data' : null,
          });
        } catch {
          if (requestActivation !== activation || get().activeOwnerKey !== ownerKey) return;
          set({ hydrationStatus: 'error', items: [], storageError: 'read-failed' });
        } finally {
          if (hydrationOwnerKey === ownerKey) {
            hydrationOwnerKey = null;
            hydrationPromise = null;
          }
        }
      })();

      return hydrationPromise;
    };

    const ensureOwnerIsActive = async (owner: RecentSearchOwner) => {
      const ownerKey = getRecentSearchOwnerKey(owner);
      if (
        get().activeOwnerKey !== ownerKey
        || get().hydrationStatus === 'idle'
        || get().hydrationStatus === 'loading'
      ) {
        await activateOwner(owner);
      }
      return get().activeOwnerKey === ownerKey;
    };

    const persistMemory = async (owner: RecentSearchOwner, items: readonly RecentSearch[]) => {
      try {
        await queueRecentSearchPersist(owner, items);
        if (
          get().activeOwnerKey === getRecentSearchOwnerKey(owner)
          && get().storageError !== null
        ) {
          set({ storageError: null });
        }
      } catch {
        if (get().activeOwnerKey === getRecentSearchOwnerKey(owner)) {
          set({ storageError: 'write-failed' });
        }
      }
    };

    return {
      activeOwnerKey: null,
      hydrationStatus: 'idle',
      items: [],
      storageError: null,
      activateOwner,
      clearSearches: async (owner) => {
        const mutationOwner = owner ?? activeOwner;
        if (!mutationOwner) return;
        const ownerKey = getRecentSearchOwnerKey(mutationOwner);
        if (
          get().activeOwnerKey !== ownerKey
          || get().hydrationStatus === 'idle'
          || get().hydrationStatus === 'loading'
        ) {
          if (!await ensureOwnerIsActive(mutationOwner)) return;
        }
        set({ items: [] });
        await persistMemory(mutationOwner, []);
      },
      deactivateOwner: () => {
        activation += 1;
        activeOwner = null;
        hydrationOwnerKey = null;
        hydrationPromise = null;
        set({ activeOwnerKey: null, hydrationStatus: 'idle', items: [], storageError: null });
      },
      recordSearch: async (input, owner) => {
        const mutationOwner = owner ?? activeOwner;
        if (!mutationOwner) return;
        const ownerKey = getRecentSearchOwnerKey(mutationOwner);
        if (
          get().activeOwnerKey !== ownerKey
          || get().hydrationStatus === 'idle'
          || get().hydrationStatus === 'loading'
        ) {
          if (!await ensureOwnerIsActive(mutationOwner)) return;
        }
        const items = addRecentSearch(get().items, input);
        if (items === get().items) return;
        set({ items });
        await persistMemory(mutationOwner, items);
      },
      removeSearch: async (id, owner) => {
        const mutationOwner = owner ?? activeOwner;
        if (!mutationOwner) return;
        const ownerKey = getRecentSearchOwnerKey(mutationOwner);
        if (
          get().activeOwnerKey !== ownerKey
          || get().hydrationStatus === 'idle'
          || get().hydrationStatus === 'loading'
        ) {
          if (!await ensureOwnerIsActive(mutationOwner)) return;
        }
        const items = get().items.filter((item) => item.id !== id);
        set({ items });
        await persistMemory(mutationOwner, items);
      },
    };
  });
}

export const useRecentSearchStore = createRecentSearchStore();
