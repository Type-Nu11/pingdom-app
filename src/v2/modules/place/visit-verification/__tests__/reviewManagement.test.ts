import { createVisitVerificationApi } from '../api/visitVerificationApi';
import type { ApiClient } from '../../../../shared/api';

test('review mutation includes both place and review identity and never sends arbitrary image URLs', async () => {
  const client = { patch: jest.fn().mockResolvedValue({ reviewId: 9 }), delete: jest.fn().mockResolvedValue(undefined), get: jest.fn().mockResolvedValue({}) };
  const api = createVisitVerificationApi(client as unknown as ApiClient);
  const body = { content: '수정한 내용', recommendReasons: ['CLEAN' as const], reviewMediaIds: [] };
  await api.updateReview(17, 9, body);
  expect(client.patch).toHaveBeenCalledWith('/places/17/reviews/9', body);
  await api.deleteReview(17, 9);
  expect(client.delete).toHaveBeenCalledWith('/places/17/reviews/9');
  await api.getReviewSummary(17);
  expect(client.get).toHaveBeenCalledWith('/places/17/reviews/summary', { signal: undefined });
});
