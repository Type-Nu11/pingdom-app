import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../../app/testing/testProviders';
import { profileApi } from '../../api/profileApi';
import type { MyPlaceReview, MyPlaceReviewPage } from '../../model/profile.types';
import MyReviewScreen from '../screens/MyReviewScreen';

const review: MyPlaceReview = {
  reviewId: 111, placeId: 11, content: '제가 직접 작성한 리뷰',
  createdAt: '2026-10-19T03:00:00Z', imageUrls: ['https://cdn.test/review.jpg'],
  visibilityStatus: 'VISIBLE', recommendReason: 'FRIENDLY',
};
function page(reviews: MyPlaceReview[], pageNumber = 1, hasNext = false): MyPlaceReviewPage {
  return { reviews, page: pageNumber, hasNext, limit: 20, totalPages: hasNext ? 2 : pageNumber, totalElements: reviews.length };
}

test('선택한 내 리뷰만 표시하고 돌아가기를 제공한다', async () => {
  jest.spyOn(profileApi, 'listMyReviews').mockResolvedValue(page([
    { ...review, reviewId: 112, content: '선택하지 않은 리뷰' }, review,
  ]));
  const onBack = jest.fn();
  const { user } = await renderWithProviders(<MyReviewScreen reviewId={111} onBack={onBack} />);
  expect(await screen.findByText(review.content)).toBeTruthy();
  expect(screen.queryByText('선택하지 않은 리뷰')).toBeNull();
  expect(screen.getByRole('button', { name: '더보기' })).toBeTruthy();
  expect(screen.getByLabelText('리뷰 사진 1').props.source).toEqual({ uri: review.imageUrls[0] });
  await user.press(screen.getByRole('button', { name: '뒤로가기' }));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('다음 페이지의 내 리뷰도 찾아 표시한다', async () => {
  const get = jest.spyOn(profileApi, 'listMyReviews').mockImplementation(async (params) =>
    params?.page === 1 ? page([], 1, true) : page([review], 2));
  await renderWithProviders(<MyReviewScreen reviewId={111} onBack={jest.fn()} />);
  expect(await screen.findByText(review.content)).toBeTruthy();
  expect(get).toHaveBeenCalledWith({ limit: 20, page: 2 }, expect.anything());
});

test('선택 ID가 바뀌면 이전 리뷰가 남지 않는다', async () => {
  jest.spyOn(profileApi, 'listMyReviews').mockResolvedValue(page([review, { ...review, reviewId: 222, content: '새로 선택한 리뷰' }]));
  const { rerender } = await renderWithProviders(<MyReviewScreen reviewId={111} onBack={jest.fn()} />);
  await screen.findByText(review.content);
  await rerender(<MyReviewScreen reviewId={222} onBack={jest.fn()} />);
  expect(screen.queryByText(review.content)).toBeNull();
  expect(screen.getByText('새로 선택한 리뷰')).toBeTruthy();
});

test('삭제된 리뷰를 다른 리뷰로 대체하지 않는다', async () => {
  jest.spyOn(profileApi, 'listMyReviews').mockResolvedValue(page([{ ...review, visibilityStatus: 'DELETED' }]));
  await renderWithProviders(<MyReviewScreen reviewId={111} onBack={jest.fn()} />);
  expect(await screen.findByText('이 리뷰를 더 이상 볼 수 없어요.')).toBeTruthy();
  expect(screen.queryByText(review.content)).toBeNull();
});

test('조회 실패는 빈 목록 대신 재시도를 제공한다', async () => {
  const get = jest.spyOn(profileApi, 'listMyReviews').mockRejectedValueOnce(new Error('offline')).mockResolvedValue(page([review]));
  const { user } = await renderWithProviders(<MyReviewScreen reviewId={111} onBack={jest.fn()} />);
  await user.press(await screen.findByText('다시 시도'));
  expect(await screen.findByText(review.content)).toBeTruthy();
  await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
});
