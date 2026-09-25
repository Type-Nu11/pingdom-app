import { ApiError } from '../../../shared/api/ApiError';
import type { MockHandler } from '../../../shared/api/mock/handlers';
import {
  categoriesFixture,
  commentPageFixture,
  createCommentResponseFixture,
  createPostResponseFixture,
  emptyPostPageFixture,
  likeStatusFixture,
  likedStatusFixture,
  placeViewFixture,
  postDetailFixture,
  postPageFixture,
  reportResponseFixture,
} from './fixtures';

export const communityMockHandlers = [
  { method: 'GET', path: '/community/categories', resolve: () => categoriesFixture },
  {
    method: 'GET',
    path: /^\/community\/categories\/[^/]+\/posts$/,
    resolve: ({ scenario }) => (scenario === 'empty' ? emptyPostPageFixture : postPageFixture),
  },
  { method: 'POST', path: '/community/posts', resolve: () => createPostResponseFixture },
  {
    method: 'GET',
    path: /^\/community\/posts\/\d+$/,
    resolve: ({ path }) => {
      if (path.endsWith('/999')) {
        throw new ApiError('Post not found', { code: 'POST_NOT_FOUND', status: 404 });
      }
      return postDetailFixture;
    },
  },
  { method: 'GET', path: /^\/community\/posts\/\d+\/comments$/, resolve: () => commentPageFixture },
  { method: 'POST', path: /^\/community\/posts\/\d+\/comments$/, resolve: () => createCommentResponseFixture },
  { method: 'GET', path: /^\/community\/posts\/\d+\/likes$/, resolve: () => likeStatusFixture },
  { method: 'POST', path: /^\/community\/posts\/\d+\/likes$/, resolve: () => likedStatusFixture },
  { method: 'DELETE', path: /^\/community\/posts\/\d+\/likes$/, resolve: () => likeStatusFixture },
  { method: 'POST', path: /^\/community\/posts\/\d+\/places\/\d+\/view$/, resolve: () => placeViewFixture },
  { method: 'POST', path: /^\/community\/posts\/\d+\/reports$/, resolve: () => reportResponseFixture },
  { method: 'POST', path: /^\/community\/posts\/\d+\/comments\/\d+\/reports$/, resolve: () => reportResponseFixture },
] satisfies readonly MockHandler[];
