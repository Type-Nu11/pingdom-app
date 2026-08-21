import { recordApi } from '../../api/recordApi';
import {
  createLikedPostsQueryOptions,
  likedPostQueryKeys,
} from '../useLikedPosts';

jest.mock('../../api/recordApi', () => ({
  recordApi: {
    getLikedPosts: jest.fn(),
  },
}));

const getLikedPostsMock = jest.mocked(recordApi.getLikedPosts);

describe('liked posts query options', () => {
  it('keys the canonical liked-post list by its request params', async () => {
    const params = { limit: 25, page: 2 };
    const response = {
      hasNext: false,
      limit: 25,
      page: 2,
      posts: [],
      totalCount: 0,
      totalPages: 0,
    };
    getLikedPostsMock.mockResolvedValueOnce(response);

    const options = createLikedPostsQueryOptions(params);

    expect(options.queryKey).toEqual(['posts', 'liked', 'list', params]);
    await expect(options.queryFn()).resolves.toEqual(response);
    expect(getLikedPostsMock).toHaveBeenCalledWith(params);
  });

  it('uses the app page size in the default query key and request', async () => {
    getLikedPostsMock.mockResolvedValueOnce({ posts: [] } as never);

    const options = createLikedPostsQueryOptions();

    expect(options.queryKey).toEqual(likedPostQueryKeys.list({ limit: 100 }));
    await options.queryFn();
    expect(getLikedPostsMock).toHaveBeenCalledWith({ limit: 100 });
  });
});
