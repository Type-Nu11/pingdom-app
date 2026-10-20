import React from 'react';
import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../app/testing/testProviders';
import {
  merchantEventsFixture,
  merchantProfileFixture,
  merchantReviewsFixture,
  merchantStoreFixture,
} from '../../__tests__/merchantMyPageFixtures';
import MerchantMyPageScreen from '../MerchantMyPageScreen';

function renderScreen(overrides: Partial<React.ComponentProps<typeof MerchantMyPageScreen>> = {}) {
  return renderWithProviders(
    <MerchantMyPageScreen
      events={merchantEventsFixture}
      onBack={jest.fn()}
      onDeleteEvent={jest.fn()}
      onOpenSettings={jest.fn()}
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
    expect(screen.getByText('리뷰')).toBeTruthy();
    expect(screen.queryByText('검증한 장소')).toBeNull();
    expect(screen.getAllByTestId('v2-merchant-review-card')).toHaveLength(2);
    expect(screen.queryByText('리뷰 모두 보기')).toBeNull();
  });

  test('이벤트 상태별 라벨을 보여준다', async () => {
    await renderScreen();

    expect(screen.getAllByTestId('v2-merchant-event-card')).toHaveLength(3);
    expect(screen.getByText('진행중')).toBeTruthy();
    expect(screen.getByText('종료')).toBeTruthy();
    expect(screen.getByText('예정됨')).toBeTruthy();
  });

  test('미지원 사업자 액션을 렌더링하지 않는다', async () => {
    await renderScreen();

    expect(screen.queryByRole('button', { name: '위치 수정' })).toBeNull();
    expect(screen.queryByRole('button', { name: '영업 시간 수정' })).toBeNull();
    expect(screen.queryByRole('button', { name: '전화번호 수정' })).toBeNull();
    expect(screen.queryByRole('button', { name: '검증한 장소' })).toBeNull();
    expect(screen.queryByRole('button', { name: '리뷰 모두 보기' })).toBeNull();
    expect(screen.queryByRole('button', { name: '새 이벤트' })).toBeNull();
  });

  test('서버 계약이 있는 이벤트 종료 액션은 유지한다', async () => {
    const onDeleteEvent = jest.fn();
    const { user } = await renderScreen({ onDeleteEvent });

    await user.press(screen.getAllByLabelText('이벤트 삭제')[0]);
    expect(onDeleteEvent).toHaveBeenCalledWith('event-ongoing');
  });

  test('리뷰가 없으면 빈 문구를 보여준다', async () => {
    await renderScreen({ reviews: [] });

    expect(screen.getByText('아직 리뷰가 없어요')).toBeTruthy();
    expect(screen.queryByText('리뷰 모두 보기')).toBeNull();
  });
});
