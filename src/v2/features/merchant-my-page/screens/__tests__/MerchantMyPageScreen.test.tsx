import React from 'react';
import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import {
  merchantEventsFixture,
  merchantProfileFixture,
  merchantReviewsFixture,
  merchantStoreFixture,
} from '../../testing/merchantMyPageFixtures';
import MerchantMyPageScreen from '../MerchantMyPageScreen';

function renderScreen(overrides: Partial<React.ComponentProps<typeof MerchantMyPageScreen>> = {}) {
  return renderWithProviders(
    <MerchantMyPageScreen
      events={merchantEventsFixture}
      onBack={jest.fn()}
      onCreateEvent={jest.fn()}
      onDeleteEvent={jest.fn()}
      onEditAddress={jest.fn()}
      onEditBusinessHours={jest.fn()}
      onEditPhoneNumber={jest.fn()}
      onOpenAllReviews={jest.fn()}
      onOpenProfileEdit={jest.fn()}
      onOpenSettings={jest.fn()}
      onOpenVerifiedPlaces={jest.fn()}
      profile={merchantProfileFixture}
      reviews={merchantReviewsFixture}
      store={merchantStoreFixture}
      {...overrides}
    />,
  );
}

describe('MerchantMyPageScreen', () => {
  test('가게 정보, 리뷰, 이벤트 섹션을 렌더한다', async () => {
    await renderScreen();

    expect(screen.getByText('대성반점')).toBeTruthy();
    expect(screen.getByText('음식점')).toBeTruthy();
    expect(screen.getByText('23명이 검증했어요!')).toBeTruthy();
    expect(screen.getByText('대구광역시 달성군 구지면 창리로11길 79-3')).toBeTruthy();
    expect(screen.getByText('09:00 ~ 20:00')).toBeTruthy();
    expect(screen.getByText('영어응대 가능')).toBeTruthy();
    expect(screen.getByText('주차가능')).toBeTruthy();
    expect(screen.getAllByTestId('v2-merchant-review-card')).toHaveLength(2);
    expect(screen.getByText('리뷰 모두 보기')).toBeTruthy();
  });

  test('이벤트 상태별 라벨을 보여준다', async () => {
    await renderScreen();

    expect(screen.getAllByTestId('v2-merchant-event-card')).toHaveLength(3);
    expect(screen.getByText('진행중')).toBeTruthy();
    expect(screen.getByText('종료')).toBeTruthy();
    expect(screen.getByText('예정됨')).toBeTruthy();
  });

  test('가게 정보 필드 수정을 누르면 콜백을 부른다', async () => {
    const onEditAddress = jest.fn();
    const { user } = await renderScreen({ onEditAddress });

    await user.press(screen.getByLabelText('위치 수정'));

    expect(onEditAddress).toHaveBeenCalled();
  });

  test('새 이벤트 버튼과 삭제 버튼이 콜백을 부른다', async () => {
    const onCreateEvent = jest.fn();
    const onDeleteEvent = jest.fn();
    const { user } = await renderScreen({ onCreateEvent, onDeleteEvent });

    await user.press(screen.getByLabelText('새 이벤트'));
    expect(onCreateEvent).toHaveBeenCalled();

    await user.press(screen.getAllByLabelText('이벤트 삭제')[0]);
    expect(onDeleteEvent).toHaveBeenCalledWith('event-ongoing');
  });

  test('리뷰가 없으면 빈 문구를 보여준다', async () => {
    await renderScreen({ reviews: [] });

    expect(screen.getByText('아직 리뷰가 없어요')).toBeTruthy();
    expect(screen.queryByText('리뷰 모두 보기')).toBeNull();
  });
});
