import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getRecentSearchStorageKey,
  restoreRecentSearches,
} from '../recentSearchStorage';

describe('recent search storage', () => {
  test('사용자 ID와 guest를 서로 다른 key namespace로 분리한다', () => {
    expect(getRecentSearchStorageKey({ kind: 'user', userId: 101 }))
      .toBe('@pingdom/v2/map-recent-searches:v1:user:101');
    expect(getRecentSearchStorageKey({ kind: 'user', userId: 202 }))
      .toBe('@pingdom/v2/map-recent-searches:v1:user:202');
    expect(getRecentSearchStorageKey({ kind: 'guest' }))
      .toBe('@pingdom/v2/map-recent-searches:v1:guest');
  });

  test('지원하지 않는 schema와 잘못된 JSON을 invalid로 처리한다', async () => {
    const owner = { kind: 'user' as const, userId: 101 };
    await AsyncStorage.setItem(getRecentSearchStorageKey(owner), JSON.stringify({
      items: [],
      version: 2,
    }));
    await expect(restoreRecentSearches(owner)).resolves.toEqual({ items: [], kind: 'invalid' });

    await AsyncStorage.setItem(getRecentSearchStorageKey(owner), '{');
    await expect(restoreRecentSearches(owner)).resolves.toEqual({ items: [], kind: 'invalid' });
  });

  test('부분 손상 데이터에서는 유효한 최소 항목만 최신순으로 복원한다', async () => {
    const owner = { kind: 'user' as const, userId: 101 };
    await AsyncStorage.setItem(getRecentSearchStorageKey(owner), JSON.stringify({
      items: [
        { category: 'cafe', id: 'old', query: '카페', searchedAt: '2026-09-10T00:00:00.000Z' },
        { category: 'art', id: 'new', query: '전시', searchedAt: '2026-09-12T00:00:00.000Z' },
        { category: 'food', id: 'bad', query: '식당', searchedAt: 'invalid' },
        { category: 'art', id: 'missing-date', query: '미완성' },
      ],
      version: 1,
    }));

    await expect(restoreRecentSearches(owner)).resolves.toEqual({
      items: [
        { category: 'art', id: '전시', query: '전시', searchedAt: '2026-09-12T00:00:00.000Z' },
        { category: 'cafe', id: '카페', query: '카페', searchedAt: '2026-09-10T00:00:00.000Z' },
      ],
      kind: 'restored',
    });
  });
});
