import { ApiError } from '../../../shared/api/ApiError';
import type { MockHandler } from '../../../shared/api/mock/handlers';
import {
  categoriesFixture,
  commentPageFixture,
  createCommentResponseFixture,
  createPostResponseFixture,
  emptyCommentPageFixture,
  emptyPostPageFixture,
  likeStatusFixture,
  likedStatusFixture,
  placeViewFixture,
  postDetailFixture,
  postDetailMultiplePlacesFixture,
  postDetailWithDeletedPlaceFixture,
  postPageFixture,
  reportResponseFixture,
} from './fixtures';

// Sentinel placeIds for exercising the view endpoint's declared 401/403 and
// an undeclared-but-possible network failure from dev mock mode — mirrors the
// postId-999-means-404 convention already used for `getPost` below.
const PLACE_VIEW_UNAUTHENTICATED_ID = 401;
const PLACE_VIEW_FORBIDDEN_ID = 403;
const PLACE_VIEW_NETWORK_FAILURE_ID = 500;

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
      if (path.endsWith('/2')) return postDetailMultiplePlacesFixture;
      if (path.endsWith('/3')) return postDetailWithDeletedPlaceFixture;
      return postDetailFixture;
    },
  },
  {
    method: 'GET',
    path: /^\/community\/posts\/\d+\/comments$/,
    resolve: ({ scenario }) => (scenario === 'empty' ? emptyCommentPageFixture : commentPageFixture),
  },
  { method: 'POST', path: /^\/community\/posts\/\d+\/comments$/, resolve: () => createCommentResponseFixture },
  { method: 'GET', path: /^\/community\/posts\/\d+\/likes$/, resolve: () => likeStatusFixture },
  { method: 'POST', path: /^\/community\/posts\/\d+\/likes$/, resolve: () => likedStatusFixture },
  { method: 'DELETE', path: /^\/community\/posts\/\d+\/likes$/, resolve: () => likeStatusFixture },
  {
    method: 'POST',
    path: /^\/community\/posts\/\d+\/places\/\d+\/view$/,
    resolve: ({ path }) => {
      if (path.endsWith(`/${PLACE_VIEW_UNAUTHENTICATED_ID}/view`)) {
        throw new ApiError('Invalid token', { code: 'INVALID_TOKEN', status: 401 });
      }
      if (path.endsWith(`/${PLACE_VIEW_FORBIDDEN_ID}/view`)) {
        throw new ApiError('Access denied', { code: 'ACCESS_DENIED', status: 403 });
      }
      if (path.endsWith(`/${PLACE_VIEW_NETWORK_FAILURE_ID}/view`)) {
        throw new ApiError('Network error', { isNetworkError: true });
      }
      return placeViewFixture;
    },
  },
  { method: 'POST', path: /^\/community\/posts\/\d+\/reports$/, resolve: () => reportResponseFixture },
  { method: 'POST', path: /^\/community\/posts\/\d+\/comments\/\d+\/reports$/, resolve: () => reportResponseFixture },
] satisfies readonly MockHandler[];
