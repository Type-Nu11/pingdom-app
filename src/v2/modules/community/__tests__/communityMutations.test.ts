import { createCommunityApi } from '../api/communityApi';
import type { ApiClient } from '../../../shared/api';

test('own post CRUD uses documented methods and one-based own-list query', async () => {
  const client = { patch: jest.fn().mockResolvedValue({ postId: 7 }), delete: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue({ posts: [], page: 1 }) };
  const api = createCommunityApi(client as unknown as ApiClient);
  const body = { title: '새 제목', imageIds: [], placeIds: [] };
  await api.updatePost(7, body);
  expect(client.patch).toHaveBeenCalledWith('/community/posts/7', body);
  await api.deletePost(7);
  expect(client.delete).toHaveBeenCalledWith('/community/posts/7');
  await api.listMyPosts({ limit: 2, page: 1 });
  expect(client.get).toHaveBeenCalledWith('/users/me/community/posts', { params: { limit: 2, page: 1 }, signal: undefined });
});
