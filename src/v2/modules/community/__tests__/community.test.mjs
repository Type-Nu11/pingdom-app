import { communityMockHandlers } from '../mock/handlers.ts';
import assert from 'node:assert/strict';
import test from 'node:test';

import { configureDomainMockHandlers, mockApiClient, setMockScenario } from '../../../shared/api/index.ts';

test('Community mock handlers cover the full category → post → comment → like → view → report surface', async () => {
  configureDomainMockHandlers(communityMockHandlers);
  setMockScenario('success');

  const categories = await mockApiClient.get('/community/categories');
  assert.ok(Array.isArray(categories.categories));
  assert.equal(categories.categories[0].categoryId, 'PLACE');

  const posts = await mockApiClient.get('/community/categories/PLACE/posts');
  assert.ok(Array.isArray(posts.posts));
  assert.equal(posts.posts[0].postId, 1);

  setMockScenario('empty');
  const emptyPosts = await mockApiClient.get('/community/categories/PLACE/posts');
  assert.deepEqual(emptyPosts.posts, []);
  setMockScenario('success');

  const created = await mockApiClient.post('/community/posts', {
    categoryId: 'PLACE',
    content: '즐거운 경험이었습니다.',
    placeIds: [17],
    title: '대소고 다녀왔어요',
  });
  assert.equal(created.postId, 9001);

  const detail = await mockApiClient.get('/community/posts/1');
  assert.equal(detail.postId, 1);
  assert.equal(detail.places[0].placeId, 17);

  await assert.rejects(
    mockApiClient.get('/community/posts/999'),
    (error) => error.status === 404 && error.code === 'POST_NOT_FOUND',
  );

  const comments = await mockApiClient.get('/community/posts/1/comments');
  assert.equal(comments.comments[0].commentId, 101);

  const createdComment = await mockApiClient.post('/community/posts/1/comments', {
    content: '저도 가보고 싶네요!',
  });
  assert.equal(createdComment.commentId, 9101);

  const likeStatus = await mockApiClient.get('/community/posts/1/likes');
  assert.equal(likeStatus.liked, false);

  const liked = await mockApiClient.post('/community/posts/1/likes');
  assert.equal(liked.liked, true);
  assert.equal(liked.likeCount, 13);

  const unliked = await mockApiClient.delete('/community/posts/1/likes');
  assert.equal(unliked.liked, false);

  const placeView = await mockApiClient.post('/community/posts/1/places/17/view');
  assert.equal(placeView.id, 17);
  assert.equal(placeView.communityViewCount, 13);

  const multiplePlacesDetail = await mockApiClient.get('/community/posts/2');
  assert.equal(multiplePlacesDetail.places.length, 3);

  const deletedPlaceDetail = await mockApiClient.get('/community/posts/3');
  assert.equal(deletedPlaceDetail.places[1].deleted, true);
  assert.equal(deletedPlaceDetail.places[1].placeId, undefined);

  await assert.rejects(
    mockApiClient.post('/community/posts/1/places/401/view'),
    (error) => error.status === 401 && error.code === 'INVALID_TOKEN',
  );
  await assert.rejects(
    mockApiClient.post('/community/posts/1/places/403/view'),
    (error) => error.status === 403 && error.code === 'ACCESS_DENIED',
  );
  await assert.rejects(
    mockApiClient.post('/community/posts/1/places/500/view'),
    (error) => error.isNetworkError === true,
  );

  const postReport = await mockApiClient.post('/community/posts/1/reports', {
    description: '같은 광고를 반복 게시합니다.',
    reason: 'SPAM',
  });
  assert.equal(postReport.status, 'PENDING');

  const commentReport = await mockApiClient.post('/community/posts/1/comments/101/reports', {
    description: '같은 광고를 반복 게시합니다.',
    reason: 'SPAM',
  });
  assert.equal(commentReport.status, 'PENDING');
});
