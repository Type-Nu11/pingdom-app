import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { profileApi, type ProfileResponse } from '../../../../../features/profile/api/profileApi';
import { bookmarkApi } from '../../api/bookmarkApi';
import { checkInApi } from '../../../check-ins/api/checkInApi';
import { offerCouponApi } from '../../../offers-coupons/api/offerCouponApi';
import { placeDetailApi } from '../../../place-detail/api/placeDetailApi';
import { reservationApi } from '../../../reservations/api/reservationApi';
import { travelScheduleApi } from '../../../travel-schedules/api/travelScheduleApi';
import MyPageScreen from '../MyPageScreen';

const PROFILE: ProfileResponse = {
  birthYear: 1998,
  country: 'KR',
  email: 'pingdom@example.com',
  id: 1,
  language: 'ko',
  profileImageUrl: null,
  username: 'pingdom_user',
};

function renderMyPage() {
  return renderWithProviders(
    <MyPageScreen
      onBack={jest.fn()}
      onOpenProfileEdit={jest.fn()}
      onOpenSettings={jest.fn()}
      onOpenVerifiedPlaces={jest.fn()}
    />,
  );
}

function mockEverythingEmpty() {
  jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
  jest.spyOn(profileApi, 'listMyReviews').mockResolvedValue({
    hasNext: false, limit: 1, page: 1, reviews: [], totalElements: 7, totalPages: 1,
  });
  jest.spyOn(reservationApi, 'listReservations').mockResolvedValue({ totalCount: 3 } as never);
  jest.spyOn(offerCouponApi, 'listCoupons').mockResolvedValue({ totalCount: 5 } as never);
  jest.spyOn(travelScheduleApi, 'getTravelSchedules').mockResolvedValue({ schedules: [] } as never);
  jest.spyOn(checkInApi, 'listCheckIns').mockResolvedValue({
    checkIns: [], hasNext: false, limit: 4, page: 1, totalCount: 0, totalPages: 1,
  } as never);
  jest.spyOn(bookmarkApi, 'listBookmarks').mockResolvedValue({
    hasNext: false, limit: 100, page: 1, places: [], totalCount: 0, totalPages: 1,
  });
}

describe('MyPageScreen', () => {
  test('예약·리뷰·쿠폰 개수를 실데이터로 보여준다', async () => {
    mockEverythingEmpty();

    await renderMyPage();

    // 캘린더에도 같은 숫자가 있으므로 통계 슬롯을 testID로 특정한다.
    await waitFor(() => expect(screen.getByTestId('v2-my-page-stat-reservations')).toHaveTextContent('3'));
    expect(screen.getByTestId('v2-my-page-stat-reviews')).toHaveTextContent('7');
    expect(screen.getByTestId('v2-my-page-stat-coupons')).toHaveTextContent('5');
  });

  test('통계 조회가 실패하면 0이 아니라 "-"를 보여준다', async () => {
    mockEverythingEmpty();
    jest.spyOn(reservationApi, 'listReservations').mockRejectedValue(new Error('실패'));

    await renderMyPage();

    await waitFor(() => expect(screen.getByTestId('v2-my-page-stat-reservations')).toHaveTextContent('-'));
    // 실패한 항목만 "-"가 되고 나머지는 그대로 나온다.
    expect(screen.getByTestId('v2-my-page-stat-reviews')).toHaveTextContent('7');
  });

  test('프로필 조회가 실패해도 프로필 행은 남겨 편집 화면으로 갈 수 있다', async () => {
    mockEverythingEmpty();
    jest.spyOn(profileApi, 'getProfile').mockRejectedValue(new Error('실패'));
    const onOpenProfileEdit = jest.fn();

    const { user } = await renderWithProviders(
      <MyPageScreen
        onBack={jest.fn()}
        onOpenProfileEdit={onOpenProfileEdit}
        onOpenSettings={jest.fn()}
        onOpenVerifiedPlaces={jest.fn()}
      />,
    );

    await waitFor(() => expect(screen.getByText('프로필을 불러오지 못했어요.')).toBeTruthy());
    expect(screen.getByText('다시 시도')).toBeTruthy();

    await user.press(screen.getByText('프로필 정보 없음'));
    expect(onOpenProfileEdit).toHaveBeenCalled();
  });

  test('체크인이 없으면 빈 상태 문구를 보여준다', async () => {
    mockEverythingEmpty();

    await renderMyPage();

    await waitFor(() => expect(screen.getByText('아직 검증한 장소가 없어요')).toBeTruthy());
  });

  test('체크인은 있는데 장소 조회가 모두 실패하면 "없음"이 아니라 오류를 보여준다', async () => {
    mockEverythingEmpty();
    jest.spyOn(checkInApi, 'listCheckIns').mockResolvedValue({
      checkIns: [{ id: 1, placeId: 11 }, { id: 2, placeId: 22 }],
      hasNext: false, limit: 4, page: 1, totalCount: 2, totalPages: 1,
    } as never);
    jest.spyOn(placeDetailApi, 'getPlaceDetail').mockRejectedValue(new Error('실패'));

    await renderMyPage();

    await waitFor(() => expect(screen.getByText('인증한 장소를 불러오지 못했어요.')).toBeTruthy());
    expect(screen.queryByText('아직 검증한 장소가 없어요')).toBeNull();
  });

  test('장소 조회가 일부만 실패하면 성공한 장소를 보여준다', async () => {
    mockEverythingEmpty();
    jest.spyOn(checkInApi, 'listCheckIns').mockResolvedValue({
      checkIns: [{ id: 1, placeId: 11 }, { id: 2, placeId: 22 }],
      hasNext: false, limit: 4, page: 1, totalCount: 2, totalPages: 1,
    } as never);
    jest.spyOn(placeDetailApi, 'getPlaceDetail').mockImplementation(async (placeId) => {
      if (placeId === 22) throw new Error('실패');
      return { address: '진주시', id: 11, name: '촉석루', thumbnailUrl: null } as never;
    });

    await renderMyPage();

    await waitFor(() => expect(screen.getByText('촉석루')).toBeTruthy());
    expect(screen.queryByText('인증한 장소를 불러오지 못했어요.')).toBeNull();
  });
});
