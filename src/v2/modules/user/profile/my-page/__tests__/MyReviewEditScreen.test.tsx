import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../../app/testing/testProviders';
import { profileApi } from '../../api/profileApi';
import { visitVerificationApi } from '../../../../place/visit-verification';
import MyReviewEditScreen from '../screens/MyReviewEditScreen';

test('내 리뷰 본문·사진·복수 추천 이유로 채우고 카테고리 대신 편의기능을 보여준다', async () => {
  jest.spyOn(profileApi, 'listMyReviews').mockResolvedValue({
    hasNext: false, page: 1, limit: 20, totalElements: 1, totalPages: 1,
    reviews: [{ reviewId: 111, placeId: 17, content: '실제 작성한 리뷰', recommendReason: 'FRIENDLY',
      recommendReasons: ['CLEAN', 'PARKING'], imageUrls: ['https://cdn.test/review.jpg'], createdAt: '2026-10-19', visibilityStatus: 'VISIBLE' }],
  });
  const update = jest.spyOn(visitVerificationApi, 'updateReview').mockResolvedValue({ reviewId: 111, placeId: 17 });
  const create = jest.spyOn(visitVerificationApi, 'createReview');
  const remove = jest.spyOn(visitVerificationApi, 'cancelReviewMedia');
  await renderWithProviders(<MyReviewEditScreen reviewId={111} onBack={jest.fn()} />);
  await screen.findByTestId('content-edit-screen');
  expect(screen.getByText('편의기능')).toBeTruthy();
  expect(screen.queryByText('카테고리')).toBeNull();
  expect(screen.queryByLabelText('제목')).toBeNull();
  expect(screen.getByLabelText('본문').props.value).toBe('실제 작성한 리뷰');
  expect(screen.getByRole('checkbox', { name: '매장이 깨끗해요' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: '주차하기 편해요' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: '친절해요' })).not.toBeChecked();
  await fireEvent.press(screen.getByRole('button', { name: '사진 1 삭제' }));
  await fireEvent.press(screen.getByTestId('content-edit-submit'));
  await waitFor(() => expect(update).toHaveBeenCalledWith(17, 111, { content: '실제 작성한 리뷰', recommendReasons: ['CLEAN', 'PARKING'], reviewMediaIds: [] }));
  expect(create).not.toHaveBeenCalled();
  expect(remove).not.toHaveBeenCalled();
});
