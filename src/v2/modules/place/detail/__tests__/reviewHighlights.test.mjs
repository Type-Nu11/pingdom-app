import assert from 'node:assert/strict';
import test from 'node:test';
import { summarizeReviewHighlights } from '../model/reviewHighlights.ts';

const review = (reviewId, userId, recommendReasons) => ({ reviewId, userId, recommendReasons });

test('복수 선택은 항목마다 집계하고 같은 사람이 같은 항목을 여러 번 골라도 한 번만 센다', () => {
  const records = [
    review(1, 10, ['PHOTO_SPOT', 'CLEAN', 'CLEAN']),
    review(2, 10, ['CLEAN', 'PARKING']),
    review(3, 20, ['CLEAN']),
    review(4, 30, ['PHOTO_SPOT']),
  ];
  const summary = summarizeReviewHighlights(records, { totalElements: 4, number: 0 });
  assert.deepEqual(summary.highlights, [
    { reason: 'photoSpot', count: 2 }, { reason: 'clean', count: 2 }, { reason: 'parking', count: 1 },
  ]);
  assert.equal(summary.participantCount, 3);
  assert.equal(summary.sampleSize, 4);
  assert.equal(summary.complete, true);
  assert.deepEqual(records[0].recommendReasons, ['PHOTO_SPOT', 'CLEAN', 'CLEAN']);
});

test('첫 페이지를 장소 전체 참여자 수나 전체 집계로 표시하지 않는다', () => {
  const summary = summarizeReviewHighlights([review(1, 10, ['CLEAN']), review(2, 20, ['CLEAN'])], { totalElements: 284, number: 0 });
  assert.equal(summary.complete, false);
  assert.equal(summary.participantCount, 2);
  assert.equal(summary.sampleSize, 2);
  assert.equal(summary.highlights[0].count, 2);
});

test('작성자 ID가 빠져 있으면 사람 수를 추정하지 않고 리뷰별 선택을 센다', () => {
  const summary = summarizeReviewHighlights([review(1, 10, ['CLEAN']), review(2, undefined, ['CLEAN'])], { totalElements: 2 });
  assert.equal(summary.participantCount, null);
  assert.equal(summary.highlights[0].count, 2);
  assert.equal(summary.complete, true);
});

test('중복 리뷰 ID는 중복 투표로 세지 않는다', () => {
  const summary = summarizeReviewHighlights([review(1, 10, ['CLEAN']), review(1, 10, ['PHOTO_SPOT'])], { totalElements: 1 });
  assert.equal(summary.sampleSize, 1);
  assert.deepEqual(summary.highlights, [{ reason: 'clean', count: 1 }]);
});

test('표준 복수 이유가 있으면 이전 단일 이유보다 우선하고 알려진 코드만 센다', () => {
  const summary = summarizeReviewHighlights([
    { reviewId: 1, userId: 10, recommendReason: 'FRIENDLY' },
    { reviewId: 2, userId: 20, recommendReason: 'FRIENDLY', recommendReasons: ['PARKING', 'UNKNOWN'] },
  ], { totalElements: 2 });
  assert.deepEqual(summary.highlights, [{ reason: 'kind', count: 1 }, { reason: 'parking', count: 1 }]);
});

test('빈 데이터와 서버 페이지 정보가 없는 응답도 가짜 태그를 만들지 않는다', () => {
  assert.deepEqual(summarizeReviewHighlights([], { totalElements: 0 }), {
    highlights: [], participantCount: 0, sampleSize: 0, complete: true,
  });
  assert.equal(summarizeReviewHighlights([review(1, 10, ['CLEAN'])]).complete, false);
  assert.equal(summarizeReviewHighlights([review(1, 10, ['CLEAN'])], { totalElements: 1, number: 1 }).complete, false);
});
