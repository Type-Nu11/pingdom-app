import {
  addRecentSearch,
  formatRecentSearchDate,
  sanitizeRecentSearches,
} from '../recentSearch';

describe('recent search policy', () => {
  test('검색어 앞뒤 공백을 제거하고 공백 검색어는 저장하지 않는다', () => {
    const searchedAt = '2026-09-12T03:00:00.000Z';
    const added = addRecentSearch([], { category: 'cafe', query: '  성수 카페  ', searchedAt });

    expect(added).toEqual([{
      category: 'cafe',
      id: '성수 카페',
      query: '성수 카페',
      searchedAt,
    }]);
    expect(addRecentSearch(added, { category: 'art', query: '   ', searchedAt })).toBe(added);
  });

  test('동일 검색어를 대소문자 중복 없이 최신 입력 형태로 최상단 이동한다', () => {
    const existing = addRecentSearch([], {
      category: 'cafe', query: 'Cafe', searchedAt: '2026-09-10T00:00:00.000Z',
    });
    const withAnother = addRecentSearch(existing, {
      category: 'art', query: '전시', searchedAt: '2026-09-11T00:00:00.000Z',
    });

    expect(addRecentSearch(withAnother, {
      category: 'food', query: 'cAFE', searchedAt: '2026-09-12T00:00:00.000Z',
    })).toEqual([
      {
        category: 'food', id: 'cafe', query: 'cAFE', searchedAt: '2026-09-12T00:00:00.000Z',
      },
      {
        category: 'art', id: '전시', query: '전시', searchedAt: '2026-09-11T00:00:00.000Z',
      },
    ]);
  });

  test('최신순으로 정렬하고 기존 제품 정책인 최대 6개를 유지한다', () => {
    const unsorted = Array.from({ length: 8 }, (_, index) => ({
      category: 'art' as const,
      id: `검색 ${index}`,
      query: `검색 ${index}`,
      searchedAt: `2026-09-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
    }));

    expect(sanitizeRecentSearches(unsorted).map((item) => item.query)).toEqual([
      '검색 7', '검색 6', '검색 5', '검색 4', '검색 3', '검색 2',
    ]);
  });

  test('누락 필드와 잘못된 timestamp를 버리고 유효한 항목만 복원한다', () => {
    expect(sanitizeRecentSearches([
      { category: 'art', id: 'valid', query: 'valid', searchedAt: '2026-09-12T00:00:00.000Z' },
      { category: 'art', id: 'bad-date', query: 'bad', searchedAt: 'not-a-date' },
      { id: 'missing', query: 'missing', searchedAt: '2026-09-12T00:00:00.000Z' },
    ])).toEqual([
      { category: 'art', id: 'valid', query: 'valid', searchedAt: '2026-09-12T00:00:00.000Z' },
    ]);
  });

  test('저장된 ISO timestamp를 현재 locale 형식으로 표시한다', () => {
    const timestamp = '2026-09-12T03:00:00.000Z';

    expect(formatRecentSearchDate(timestamp, 'ko', 'Asia/Seoul')).toBe('09. 12.');
    expect(formatRecentSearchDate(timestamp, 'en', 'Asia/Seoul')).toBe('09/12');
  });
});
