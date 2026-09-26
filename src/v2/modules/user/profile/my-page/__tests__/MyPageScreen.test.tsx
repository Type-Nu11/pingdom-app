import React from 'react';
import { Alert } from 'react-native';
import { screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../../app/testing/testProviders';
import { profileApi } from '../../api/profileApi';
import type { Profile } from '../../model/profile.types';
import { bookmarkApi } from '../api/bookmarkApi';
import { checkInApi } from '../../../../place/check-ins';
import { offerCouponApi } from '../../../../booking/offers-coupons/__tests__';
import { placeDetailApi } from '../../../../place/detail';
import { placeExplorationApi } from '../../../../place/exploration';
import { reservationApi } from '../../../../booking/reservations/__tests__';
import { travelScheduleApi } from '../../../../travel/schedules';
import MyPageScreen from '../screens/MyPageScreen';
import { lightTheme, darkTheme } from '../../../../../shared/theme';

const PROFILE: Profile = {
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
      onOpenCoupons={jest.fn()}
      onOpenProfileEdit={jest.fn()}
      onOpenPlace={jest.fn()}
      onOpenReservations={jest.fn()}
      onOpenSettings={jest.fn()}
      onOpenVerifiedPlaces={jest.fn()}
    />,
  );
}

function calendarDatesFromNow(monthOffset: number) {
  const month = new Date();
  month.setDate(1);
  month.setMonth(month.getMonth() + monthOffset);
  const prefix = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;

  return {
    endDate: `${prefix}-15`,
    existingEndDate: `${prefix}-14`,
    existingStartDate: `${prefix}-12`,
    startDate: `${prefix}-09`,
  };
}

function mockEverythingEmpty() {
  jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
  jest.spyOn(profileApi, 'listMyReviews').mockResolvedValue({
    hasNext: false, limit: 1, page: 1, reviews: [], totalElements: 7, totalPages: 1,
  });
  jest.spyOn(reservationApi, 'listReservations').mockResolvedValue({ totalElements: 3 } as never);
  jest.spyOn(offerCouponApi, 'listCoupons').mockResolvedValue({ totalElements: 5 } as never);
  jest.spyOn(travelScheduleApi, 'getTravelSchedules').mockResolvedValue({ schedules: [] } as never);
  jest.spyOn(checkInApi, 'listCheckIns').mockResolvedValue({
    checkIns: [], hasNext: false, limit: 4, page: 1, totalCount: 0, totalPages: 1,
  } as never);
  jest.spyOn(bookmarkApi, 'listBookmarks').mockResolvedValue({
    hasNext: false, limit: 100, page: 1, places: [], totalCount: 0, totalPages: 1,
  });
  jest.spyOn(placeExplorationApi, 'getPlaceExplorationMedia').mockImplementation(
    async (placeId) => ({
      media: [{ displayOrder: 0, id: placeId, imageUrl: `https://cdn.test/${placeId}.jpg` }],
      placeId,
    } as never),
  );
}

describe('MyPageScreen', () => {
  test.each(['ko', 'en'] as const)('%s 헤더는 안전 영역 아래 44px와 18 Medium 제목, 버튼 동작을 유지한다', async (language) => {
    mockEverythingEmpty();
    const onBack = jest.fn();
    const onOpenSettings = jest.fn();
    const onOpenProfileEdit = jest.fn();
    const { user, i18n, queryClient } = await renderWithProviders(
      <MyPageScreen onBack={onBack} onOpenSettings={onOpenSettings}
        onOpenProfileEdit={onOpenProfileEdit} onOpenCoupons={jest.fn()}
        onOpenPlace={jest.fn()} onOpenReservations={jest.fn()} onOpenVerifiedPlaces={jest.fn()} />,
      { language },
    );
    await screen.findByText(PROFILE.username);
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(screen.getByTestId('v2-my-page-screen').props.edges).toContain('top');
    expect(screen.getByTestId('v2-my-page-header')).toHaveStyle({ minHeight: 44, alignItems: 'center' });
    const title = screen.getByText(i18n.t('myPage.title'));
    expect(title).toHaveStyle({ fontSize: 18, fontWeight: '500', lineHeight: 23.4, textAlign: 'center', flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 });
    expect(title).toHaveStyle(lightTheme.typography.navigationTitle);
    expect(screen.getByTestId('v2-my-page-back-icon')).toHaveStyle({ left: -16, top: -16 });
    expect(screen.getByTestId('v2-my-page-settings-icon')).toHaveStyle({ left: -20, top: -16 });
    expect(title.props.numberOfLines).toBe(1);
    expect(title.props.allowFontScaling).not.toBe(false);
    expect(screen.getByTestId('v2-my-page-profile-section')).toHaveStyle({ paddingTop: 16 });
    for (const key of ['back', 'settings']) {
      expect(screen.getByRole('button', { name: i18n.t(`myPage.${key}`) })).toHaveStyle({ width: 44, height: 44, flexShrink: 0 });
    }
    await user.press(screen.getByRole('button', { name: i18n.t('myPage.back') }));
    await user.press(screen.getByRole('button', { name: i18n.t('myPage.settings') }));
    await user.press(screen.getByText(PROFILE.username));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
    expect(onOpenProfileEdit).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('v2-my-page-scroll').props.contentContainerStyle).toEqual({ flexGrow: 1 });
  });

  test.each(['아주긴사용자이름'.repeat(12), 'LongUnbrokenUsername'.repeat(12)])('긴 사용자명 원문과 국가를 보존하며 고정 아이콘 사이에서 축소한다: %s', async (username) => {
    mockEverythingEmpty();
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue({ ...PROFILE, username });
    const { queryClient } = await renderMyPage();
    const name = await screen.findByText(username);
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(name.props.numberOfLines).toBe(1);
    expect(screen.getByTestId('v2-my-page-country').props.numberOfLines).toBe(1);
    expect(screen.getByTestId('v2-my-page-profile-info')).toHaveStyle({ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 });
    expect(screen.getByTestId('v2-my-page-profile-text')).toHaveStyle({ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 });
    expect(screen.getByTestId('v2-my-page-avatar')).toHaveStyle({ width: 56, height: 56, flexShrink: 0 });
    expect(screen.getByTestId('v2-my-page-profile-chevron')).toHaveStyle({ width: 24, flexShrink: 0 });
  });

  test.each(['LIGHT', 'DARK'] as const)('%s 제목은 공통 폰트와 theme 색상을 유지한다', async (appearancePreference) => {
    mockEverythingEmpty();
    const theme = appearancePreference === 'DARK' ? darkTheme : lightTheme;
    const { i18n, queryClient } = await renderWithProviders(<MyPageScreen onBack={jest.fn()} onOpenSettings={jest.fn()}
      onOpenProfileEdit={jest.fn()} onOpenCoupons={jest.fn()} onOpenPlace={jest.fn()}
      onOpenReservations={jest.fn()} onOpenVerifiedPlaces={jest.fn()} />, { appearancePreference });
    await screen.findByText(PROFILE.username);
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(screen.getByText(i18n.t('myPage.title'))).toHaveStyle({ color: theme.colors.textStrong, fontFamily: 'Pretendard' });
    expect(screen.getByTestId('v2-my-page-screen')).toHaveStyle({ backgroundColor: theme.colors.background });
  });

  test('프로필 로딩 중에도 헤더와 설정은 유지한다', async () => {
    mockEverythingEmpty();
    jest.spyOn(profileApi, 'getProfile').mockImplementation(() => new Promise(() => {}));
    const { i18n, queryClient } = await renderMyPage();
    await waitFor(() => expect(queryClient.isFetching()).toBe(1));
    expect(screen.getByText(i18n.t('myPage.profileLoading'))).toBeTruthy();
    expect(screen.getByRole('button', { name: i18n.t('myPage.settings') })).toBeTruthy();
    expect(screen.queryByText(PROFILE.username)).toBeNull();
  });

  test('예약·리뷰·쿠폰 개수를 실데이터로 보여준다', async () => {
    mockEverythingEmpty();

    await renderMyPage();

    // 캘린더에도 같은 숫자가 있으므로 통계 슬롯을 testID로 특정한다.
    await waitFor(() => expect(screen.getByTestId('v2-my-page-stat-reservations')).toHaveTextContent('3'));
    expect(screen.getByTestId('v2-my-page-stat-reviews')).toHaveTextContent('7');
    expect(screen.getByTestId('v2-my-page-stat-coupons')).toHaveTextContent('5');
    expect(profileApi.listMyReviews).toHaveBeenCalledWith(
      { limit: 1, page: 1 },
      expect.anything(),
    );
  });

  test('예약 통계를 누르면 예약함으로 이동한다', async () => {
    mockEverythingEmpty();
    const onOpenReservations = jest.fn();
    const { user } = await renderWithProviders(
      <MyPageScreen
        onBack={jest.fn()}
        onOpenCoupons={jest.fn()}
        onOpenProfileEdit={jest.fn()}
        onOpenPlace={jest.fn()}
        onOpenReservations={onOpenReservations}
        onOpenSettings={jest.fn()}
        onOpenVerifiedPlaces={jest.fn()}
      />,
    );

    await user.press(await screen.findByRole('button', { name: '예약' }));
    expect(onOpenReservations).toHaveBeenCalledTimes(1);
  });

  test('통계 조회가 실패하면 0이 아니라 "-"를 보여준다', async () => {
    mockEverythingEmpty();
    jest.spyOn(reservationApi, 'listReservations').mockRejectedValue(new Error('실패'));

    await renderMyPage();

    await waitFor(() => expect(screen.getByTestId('v2-my-page-stat-reservations')).toHaveTextContent('-'));
    // 실패한 항목만 "-"가 되고 나머지는 그대로 나온다.
    expect(screen.getByTestId('v2-my-page-stat-reviews')).toHaveTextContent('7');
  });

  test('프로필 초기 조회 실패는 빈 프로필 대신 복구 동작을 표시한다', async () => {
    mockEverythingEmpty();
    jest.spyOn(profileApi, 'getProfile').mockRejectedValue(new Error('실패'));
    const onOpenProfileEdit = jest.fn();

    const { user } = await renderWithProviders(
      <MyPageScreen
        onBack={jest.fn()}
        onOpenCoupons={jest.fn()}
        onOpenProfileEdit={onOpenProfileEdit}
        onOpenPlace={jest.fn()}
        onOpenReservations={jest.fn()}
        onOpenSettings={jest.fn()}
        onOpenVerifiedPlaces={jest.fn()}
      />,
    );

    await waitFor(() => expect(screen.getByText('데이터를 불러오지 못했습니다')).toBeTruthy());
    expect(screen.getByText('다시 시도')).toBeTruthy();

    expect(screen.queryByText('프로필 정보 없음')).toBeNull();
    await user.press(screen.getByText('다시 시도'));
    expect(profileApi.getProfile).toHaveBeenCalledTimes(2);
  });

  test('캐러셀 로딩 카드도 177×222를 유지한다', async () => {
    mockEverythingEmpty();
    jest.spyOn(checkInApi, 'listCheckIns').mockImplementation(() => new Promise(() => {}));
    await renderMyPage();
    for (const card of screen.getAllByTestId('v2-verified-place-card-skeleton')) {
      expect(card).toHaveStyle({ width: 177, height: 222 });
    }
  });

  test('체크인이 없으면 빈 상태 문구를 보여준다', async () => {
    mockEverythingEmpty();

    await renderMyPage();

    await waitFor(() => expect(screen.getByText('아직 검증한 장소가 없어요')).toHaveStyle({
      fontFamily: 'Pretendard',
    }));
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

  test('검증 장소의 서버 미디어를 보여주고 누르면 해당 장소를 연다', async () => {
    mockEverythingEmpty();
    jest.spyOn(checkInApi, 'listCheckIns').mockResolvedValue({
      checkIns: [{ id: 1, placeId: 11 }],
      hasNext: false, limit: 4, page: 1, totalCount: 1, totalPages: 1,
    } as never);
    jest.spyOn(placeDetailApi, 'getPlaceDetail').mockResolvedValue({
      address: '진주시', id: 11, name: '촉석루',
    } as never);
    const onOpenPlace = jest.fn();
    const { user } = await renderWithProviders(
      <MyPageScreen
        onBack={jest.fn()}
        onOpenCoupons={jest.fn()}
        onOpenPlace={onOpenPlace}
        onOpenProfileEdit={jest.fn()}
        onOpenReservations={jest.fn()}
        onOpenSettings={jest.fn()}
        onOpenVerifiedPlaces={jest.fn()}
      />,
    );

    const card = await screen.findByTestId('v2-verified-place-card');
    expect(card).toHaveStyle({ width: 177, height: 222 });
    let ancestor = card.parent;
    while (ancestor && !ancestor.props.horizontal) ancestor = ancestor.parent;
    expect(ancestor?.props.horizontal).toBe(true);
    expect(screen.getByLabelText('촉석루, 진주시')).toBeTruthy();
    expect(screen.getByTestId('v2-verified-place-card-image').props.source).toEqual({
      uri: 'https://cdn.test/11.jpg',
    });
    await user.press(card);
    expect(onOpenPlace).toHaveBeenCalledWith(11);
  });

  test('달력에서 시작일과 종료일을 누르면 해당 여행 일정을 변경한다', async () => {
    mockEverythingEmpty();
    const dates = calendarDatesFromNow(1);
    jest.spyOn(travelScheduleApi, 'getTravelSchedules').mockResolvedValue({
      schedules: [{
        endDate: dates.existingEndDate, id: 7, startDate: dates.existingStartDate, status: 'UPCOMING',
      }],
    } as never);
    const updateTravelSchedule = jest
      .spyOn(travelScheduleApi, 'updateTravelSchedule')
      .mockResolvedValue({} as never);

    const { user } = await renderMyPage();

    const startDay = await screen.findByTestId(`v2-my-page-calendar-day-${dates.startDate}`);
    await user.press(startDay);
    expect(screen.getByTestId(`v2-my-page-calendar-day-${dates.startDate}`).props.accessibilityState)
      .toEqual(expect.objectContaining({ selected: true }));

    await user.press(screen.getByTestId(`v2-my-page-calendar-day-${dates.endDate}`));

    await waitFor(() => expect(updateTravelSchedule).toHaveBeenCalledWith(
      7,
      { endDate: dates.endDate, startDate: dates.startDate },
    ));
  });

  test('기존 여행 일정이 없으면 선택한 날짜로 새 일정을 생성한다', async () => {
    mockEverythingEmpty();
    const nextMonth = new Date();
    nextMonth.setDate(1);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const targetMonth = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
    const startDate = `${targetMonth}-09`;
    const endDate = `${targetMonth}-15`;
    const createTravelSchedule = jest
      .spyOn(travelScheduleApi, 'createTravelSchedule')
      .mockResolvedValue({} as never);
    const updateTravelSchedule = jest.spyOn(travelScheduleApi, 'updateTravelSchedule');

    const { user } = await renderMyPage();

    await user.press(await screen.findByLabelText('다음 달'));
    const startDay = screen.getByTestId(`v2-my-page-calendar-day-${startDate}`);
    expect(startDay.props.accessibilityState).toEqual(expect.objectContaining({ disabled: false }));
    await user.press(startDay);
    await user.press(screen.getByTestId(`v2-my-page-calendar-day-${endDate}`));

    await waitFor(() => expect(createTravelSchedule).toHaveBeenCalledWith({
      endDate,
      startDate,
    }));
    expect(updateTravelSchedule).not.toHaveBeenCalled();
  });

  test('기존 시작일을 새 시작일로 다시 선택해도 두 번의 탭으로 변경한다', async () => {
    mockEverythingEmpty();
    const dates = calendarDatesFromNow(1);
    jest.spyOn(travelScheduleApi, 'getTravelSchedules').mockResolvedValue({
      schedules: [{
        endDate: dates.existingEndDate, id: 7, startDate: dates.existingStartDate, status: 'UPCOMING',
      }],
    } as never);
    const updateTravelSchedule = jest
      .spyOn(travelScheduleApi, 'updateTravelSchedule')
      .mockResolvedValue({} as never);

    const { user } = await renderMyPage();

    await user.press(await screen.findByTestId(`v2-my-page-calendar-day-${dates.existingStartDate}`));
    await user.press(screen.getByTestId(`v2-my-page-calendar-day-${dates.endDate}`));

    await waitFor(() => expect(updateTravelSchedule).toHaveBeenCalledWith(
      7,
      { endDate: dates.endDate, startDate: dates.existingStartDate },
    ));
  });

  test('날짜 변경이 실패하면 서버에서 받은 기존 범위로 복원한다', async () => {
    mockEverythingEmpty();
    const dates = calendarDatesFromNow(1);
    jest.spyOn(travelScheduleApi, 'getTravelSchedules').mockResolvedValue({
      schedules: [{
        endDate: dates.existingEndDate, id: 7, startDate: dates.existingStartDate, status: 'UPCOMING',
      }],
    } as never);
    jest.spyOn(travelScheduleApi, 'updateTravelSchedule').mockRejectedValue(new Error('실패'));
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

    const { user } = await renderMyPage();

    await user.press(await screen.findByTestId(`v2-my-page-calendar-day-${dates.startDate}`));
    await user.press(screen.getByTestId(`v2-my-page-calendar-day-${dates.endDate}`));

    await waitFor(() => {
      expect(screen.getByTestId(`v2-my-page-calendar-day-${dates.existingStartDate}`).props.accessibilityState)
        .toEqual(expect.objectContaining({ selected: true }));
      expect(alert).toHaveBeenCalledWith('여행 날짜를 저장하지 못했어요.');
    });
  });

  test('종료된 일정도 미래 날짜를 선택하면 기존 일정 수정 API를 사용한다', async () => {
    mockEverythingEmpty();
    const endedDates = calendarDatesFromNow(-1);
    const futureDates = calendarDatesFromNow(1);
    jest.spyOn(travelScheduleApi, 'getTravelSchedules').mockResolvedValue({
      schedules: [{
        endDate: endedDates.existingEndDate, id: 7, startDate: endedDates.existingStartDate, status: 'ENDED',
      }],
    } as never);
    const updateTravelSchedule = jest
      .spyOn(travelScheduleApi, 'updateTravelSchedule')
      .mockResolvedValue({} as never);

    const { user } = await renderMyPage();

    await user.press(await screen.findByLabelText('다음 달'));
    await user.press(screen.getByLabelText('다음 달'));
    await user.press(screen.getByTestId(`v2-my-page-calendar-day-${futureDates.startDate}`));
    await user.press(screen.getByTestId(`v2-my-page-calendar-day-${futureDates.endDate}`));

    await waitFor(() => expect(updateTravelSchedule).toHaveBeenCalledWith(
      7,
      { endDate: futureDates.endDate, startDate: futureDates.startDate },
    ));
  });
});

test('initial profile failure never presents successful absence', async () => {
  mockEverythingEmpty();
  jest.mocked(profileApi.getProfile).mockRejectedValue(new Error('<html>internal secret</html>'));
  await renderMyPage();
  await waitFor(() => expect(screen.getByText('데이터를 불러오지 못했습니다')).toBeTruthy());
  expect(screen.queryByText('프로필 정보 없음')).toBeNull();
  expect(screen.queryByText('<html>internal secret</html>')).toBeNull();
});

test('a successful empty profile is distinct from a failed request', async () => {
  mockEverythingEmpty();
  jest.mocked(profileApi.getProfile).mockResolvedValue(null as never);
  await renderMyPage();
  await waitFor(() => expect(screen.getByText('프로필 정보 없음')).toBeTruthy());
  expect(screen.queryByText('데이터를 불러오지 못했습니다')).toBeNull();
});
