import { api } from '../../../../shared/api/apiClient';
import { recordApi } from '../recordApi';

jest.mock('../../../../shared/api/apiClient', () => ({
  api: {
    get: jest.fn(),
  },
}));

const getMock = jest.mocked(api.get);

describe('recordApi liked posts endpoint', () => {
  it('loads liked posts from the canonical plural path', async () => {
    const response = {
      hasNext: false,
      limit: 25,
      page: 2,
      posts: [],
      totalCount: 0,
      totalPages: 0,
    };
    getMock.mockResolvedValueOnce({ data: response } as never);

    await expect(recordApi.getLikedPosts({ limit: 25, page: 2 })).resolves.toEqual(response);
    expect(getMock).toHaveBeenCalledWith('/map/likes', {
      params: { limit: 25, page: 2 },
    });
  });
});
