import AsyncStorage from '@react-native-async-storage/async-storage';

import { createRecentSearchStore } from '../recentSearchStore';
import {
  getRecentSearchStorageKey,
  persistRecentSearches,
} from '../../services/recentSearchStorage';

const ownerA = { kind: 'user' as const, userId: 101 };
const ownerB = { kind: 'user' as const, userId: 202 };

describe('recent search store', () => {
  test('저장소 기록을 복원하며 hydration 전에 빈 배열을 쓰지 않는다', async () => {
    await persistRecentSearches(ownerA, [{
      category: 'cafe', id: '카페', query: '카페', searchedAt: '2026-09-12T00:00:00.000Z',
    }]);
    const setItem = jest.spyOn(AsyncStorage, 'setItem');
    setItem.mockClear();
    const store = createRecentSearchStore();

    await store.getState().activateOwner(ownerA);

    expect(setItem).not.toHaveBeenCalled();
    expect(store.getState().items.map((item) => item.query)).toEqual(['카페']);
  });

  test('hydration 중 제출은 복원을 기다려 기존 기록과 합친 뒤 저장한다', async () => {
    const storedValue = JSON.stringify({
      items: [{
        category: 'cafe', id: '카페', query: '카페', searchedAt: '2026-09-11T00:00:00.000Z',
      }],
      version: 1,
    });
    let finishRead: ((value: string | null) => void) | undefined;
    jest.spyOn(AsyncStorage, 'getItem').mockImplementationOnce(
      () => new Promise((resolve) => { finishRead = resolve; }),
    );
    const setItem = jest.spyOn(AsyncStorage, 'setItem');
    setItem.mockClear();
    const store = createRecentSearchStore();

    const hydration = store.getState().activateOwner(ownerA);
    const recording = store.getState().recordSearch({
      category: 'art', query: '전시', searchedAt: '2026-09-12T00:00:00.000Z',
    }, ownerA);
    expect(setItem).not.toHaveBeenCalled();

    finishRead?.(storedValue);
    await Promise.all([hydration, recording]);

    expect(store.getState().items.map((item) => item.query)).toEqual(['전시', '카페']);
    expect(JSON.parse(
      await AsyncStorage.getItem(getRecentSearchStorageKey(ownerA)) ?? '{}',
    ).items.map((item: { query: string }) => item.query)).toEqual(['전시', '카페']);
  });

  test('검색과 개별·전체 삭제를 재진입 및 앱 재시작 뒤에도 유지한다', async () => {
    const store = createRecentSearchStore();
    await store.getState().activateOwner(ownerA);
    await store.getState().recordSearch({
      category: 'cafe', query: '카페', searchedAt: '2026-09-12T00:00:00.000Z',
    });
    await store.getState().recordSearch({
      category: 'art', query: '전시', searchedAt: '2026-09-13T00:00:00.000Z',
    });

    store.getState().deactivateOwner();
    await store.getState().activateOwner(ownerA);
    expect(store.getState().items.map((item) => item.query)).toEqual(['전시', '카페']);

    await store.getState().removeSearch('전시');
    const restarted = createRecentSearchStore();
    await restarted.getState().activateOwner(ownerA);
    expect(restarted.getState().items.map((item) => item.query)).toEqual(['카페']);

    await restarted.getState().clearSearches();
    const restartedAgain = createRecentSearchStore();
    await restartedAgain.getState().activateOwner(ownerA);
    expect(restartedAgain.getState().items).toEqual([]);
  });

  test('사용자 전환과 로그아웃 시 이전 사용자의 메모리 기록을 즉시 숨긴다', async () => {
    const store = createRecentSearchStore();
    await store.getState().activateOwner(ownerA);
    await store.getState().recordSearch({
      category: 'art', query: 'A의 검색', searchedAt: '2026-09-12T00:00:00.000Z',
    });

    const switching = store.getState().activateOwner(ownerB);
    expect(store.getState().items).toEqual([]);
    await switching;
    expect(store.getState().items).toEqual([]);

    store.getState().deactivateOwner();
    expect(store.getState()).toMatchObject({ activeOwnerKey: null, items: [] });

    await store.getState().activateOwner(ownerA);
    expect(store.getState().items.map((item) => item.query)).toEqual(['A의 검색']);
  });

  test('느린 이전 사용자 hydration이 계정 전환 뒤 현재 화면을 갱신하지 않는다', async () => {
    let finishOwnerARead: ((value: string | null) => void) | undefined;
    jest.spyOn(AsyncStorage, 'getItem').mockImplementationOnce(
      () => new Promise((resolve) => { finishOwnerARead = resolve; }),
    );
    const store = createRecentSearchStore();

    const ownerAHydration = store.getState().activateOwner(ownerA);
    await store.getState().activateOwner(ownerB);
    finishOwnerARead?.(JSON.stringify({
      items: [{
        category: 'art', id: 'secret', query: 'A의 검색', searchedAt: '2026-09-12T00:00:00.000Z',
      }],
      version: 1,
    }));
    await ownerAHydration;

    expect(store.getState()).toMatchObject({ activeOwnerKey: 'user:202', items: [] });
  });

  test('잘못된 JSON과 read 실패에도 crash하지 않고 이후 검색을 메모리에 유지한다', async () => {
    await AsyncStorage.setItem(getRecentSearchStorageKey(ownerA), '{');
    const malformed = createRecentSearchStore();
    await expect(malformed.getState().activateOwner(ownerA)).resolves.toBeUndefined();
    expect(malformed.getState()).toMatchObject({ hydrationStatus: 'error', items: [] });

    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('read failed'));
    const failed = createRecentSearchStore();
    await expect(failed.getState().activateOwner(ownerB)).resolves.toBeUndefined();
    await expect(failed.getState().recordSearch({
      category: 'food', query: '식당', searchedAt: '2026-09-12T00:00:00.000Z',
    })).resolves.toBeUndefined();
    expect(failed.getState().items.map((item) => item.query)).toEqual(['식당']);
  });

  test('write 실패에도 최신 메모리 상태를 유지한다', async () => {
    const store = createRecentSearchStore();
    await store.getState().activateOwner(ownerA);
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('write failed'));

    await expect(store.getState().recordSearch({
      category: 'cafe', query: '카페', searchedAt: '2026-09-12T00:00:00.000Z',
    })).resolves.toBeUndefined();

    expect(store.getState()).toMatchObject({
      items: [expect.objectContaining({ query: '카페' })], storageError: 'write-failed',
    });
  });

  test('느린 이전 write 뒤 최신 삭제 write를 직렬화해 삭제 상태가 최종 저장된다', async () => {
    const store = createRecentSearchStore();
    await store.getState().activateOwner(ownerA);
    let finishFirstWrite: (() => void) | undefined;
    jest.spyOn(AsyncStorage, 'setItem').mockImplementationOnce(
      () => new Promise<void>((resolve) => { finishFirstWrite = resolve; }),
    );

    const adding = store.getState().recordSearch({
      category: 'cafe', query: '카페', searchedAt: '2026-09-12T00:00:00.000Z',
    });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    const deleting = store.getState().clearSearches();
    expect(finishFirstWrite).toEqual(expect.any(Function));
    finishFirstWrite?.();
    await Promise.all([adding, deleting]);

    const restarted = createRecentSearchStore();
    await restarted.getState().activateOwner(ownerA);
    expect(restarted.getState().items).toEqual([]);
  });
});
