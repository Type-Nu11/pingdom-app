import {
  communityQueryKeys,
  createCommunityFeedQueryOptions,
  createCountriesQueryOptions,
} from '../useCommunity';

const page = (overrides: Record<string, unknown> = {}) => ({
  hasNext: false, limit: 20, page: 1, posts: [], totalCount: 0, totalPages: 0, ...overrides,
});

function createApi() {
  return {
    listPosts: jest.fn().mockResolvedValue(page()),
    listPostsByCategory: jest.fn().mockResolvedValue(page()),
  };
}

describe('createCommunityFeedQueryOptions', () => {
  test('the "All" tab calls the all-posts endpoint with page 1 and no country', async () => {
    const api = createApi();
    const options = createCommunityFeedQueryOptions({ categoryId: null, limit: 20 }, api);

    await options.queryFn({ pageParam: options.initialPageParam });

    expect(api.listPosts).toHaveBeenCalledWith({ limit: 20, page: 1 }, undefined);
    expect(api.listPostsByCategory).not.toHaveBeenCalled();
    expect(options.queryKey).toEqual(communityQueryKeys.allPostsInfinite({ limit: 20 }));
  });

  test('a category tab calls the category endpoint and forwards the country filter', async () => {
    const api = createApi();
    const options = createCommunityFeedQueryOptions({ categoryId: 'PLACE', countryCode: 'KR', limit: 20 }, api);

    await options.queryFn({ pageParam: 3 });

    expect(api.listPostsByCategory).toHaveBeenCalledWith('PLACE', { countryCode: 'KR', limit: 20, page: 3 }, undefined);
    expect(api.listPosts).not.toHaveBeenCalled();
  });

  test('the "All" tab forwards the country filter as a real query parameter', async () => {
    const api = createApi();
    const options = createCommunityFeedQueryOptions({ categoryId: null, countryCode: 'JP', limit: 20 }, api);

    await options.queryFn({ pageParam: 1 });

    expect(api.listPosts).toHaveBeenCalledWith({ countryCode: 'JP', limit: 20, page: 1 }, undefined);
  });

  test('each filter combination has its own cache key, so pagination restarts on change', () => {
    const keys = [
      createCommunityFeedQueryOptions({ categoryId: null, limit: 20 }),
      createCommunityFeedQueryOptions({ categoryId: null, countryCode: 'KR', limit: 20 }),
      createCommunityFeedQueryOptions({ categoryId: 'PLACE', limit: 20 }),
      createCommunityFeedQueryOptions({ categoryId: 'PLACE', countryCode: 'KR', limit: 20 }),
      createCommunityFeedQueryOptions({ categoryId: 'PLACE', countryCode: 'JP', limit: 20 }),
    ].map((options) => JSON.stringify(options.queryKey));

    expect(new Set(keys).size).toBe(keys.length);
  });

  test('the "All" key stays under the root that post creation invalidates', () => {
    const { queryKey } = createCommunityFeedQueryOptions({ categoryId: null, countryCode: 'KR', limit: 20 });

    expect(queryKey.slice(0, communityQueryKeys.allPostsRoot.length)).toEqual([...communityQueryKeys.allPostsRoot]);
  });

  test.each([
    [{ hasNext: true, page: 1, totalPages: 3 }, 2],
    [{ hasNext: false, page: 1, totalPages: 3 }, undefined],
    [{ hasNext: true, page: 3, totalPages: 3 }, undefined],
  ])('next page for %p is %p', (lastPage, expected) => {
    const options = createCommunityFeedQueryOptions({ categoryId: null, limit: 20 });

    expect(options.getNextPageParam(page(lastPage))).toBe(expected);
  });
});

describe('createCountriesQueryOptions', () => {
  test('reads the allowed country codes from the server', async () => {
    const api = { listCountries: jest.fn().mockResolvedValue(['KR', 'US']) };
    const options = createCountriesQueryOptions(api);

    await expect(options.queryFn({})).resolves.toEqual(['KR', 'US']);
    expect(options.queryKey).toEqual(communityQueryKeys.countries);
  });
});
