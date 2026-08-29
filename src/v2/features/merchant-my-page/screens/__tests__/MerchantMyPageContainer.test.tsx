import React from 'react';
import { Alert } from 'react-native';
import { screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { merchantOwnerApi } from '../../api/merchantOwnerApi';
import MerchantMyPageContainer from '../MerchantMyPageContainer';

const PLACE_ID = 10;

function mockHappyPath() {
  jest.spyOn(merchantOwnerApi, 'getProfile').mockResolvedValue({
    businessName: '대성반점',
    contactEmail: 'owner@example.com',
    contactPhone: '0507-1418-9977',
    description: null,
    displayName: '대성반점 사장',
    placeIds: [PLACE_ID],
    status: 'ACTIVE',
    userId: 1,
  });
  jest.spyOn(merchantOwnerApi, 'getPlaceDetail').mockResolvedValue({
    address: '대구광역시 달성군 구지면 창리로11길 79-3',
    category: '음식점',
    englishName: 'Daeseong',
    id: PLACE_ID,
    imageUrl: 'https://cdn/place.jpg',
    name: '대성반점',
    operatingStatus: 'OPERATING',
    regularHours: [
      { closesAt: '20:00:00', dayOfWeek: 'MONDAY', opensAt: '09:00:00' },
    ],
    roadAddress: '대구광역시 달성군 구지면 창리로11길 79-3',
  });
  jest.spyOn(merchantOwnerApi, 'getPlaceInformation').mockResolvedValue({
    contactPhone: '0507-1418-9977',
    description: '중식당입니다.',
    placeId: PLACE_ID,
    reservationUrl: null,
    websiteUrl: null,
  });
  jest.spyOn(merchantOwnerApi, 'getOperating').mockResolvedValue({
    currentlyOperating: true,
    operatingStatus: 'OPERATING',
    placeId: PLACE_ID,
    regularHours: [{ closesAt: '20:00:00', dayOfWeek: 'MONDAY', opensAt: '09:00:00' }],
  });
  jest.spyOn(merchantOwnerApi, 'getMedia').mockResolvedValue({
    media: [
      {
        displayOrder: 0,
        id: 1,
        imageUrl: 'https://cdn/1.jpg',
        placeId: PLACE_ID,
        purpose: 'EXPLORATION',
        thumbnailUrl: 'https://cdn/1-thumb.jpg',
      },
    ],
    placeId: PLACE_ID,
    representativeMediaId: 1,
  });
  jest.spyOn(merchantOwnerApi, 'listReviews').mockResolvedValue({
    content: [
      {
        content: '암소 된장찌개가 맛있어요',
        createdAt: '2026-08-18T10:00:00Z',
        imageUrls: [],
        placeId: PLACE_ID,
        recommendReason: '음식이 맛있어요',
        reviewId: 7,
        userId: 42,
      },
    ],
    last: true,
    number: 0,
    totalElements: 1,
  });
  jest.spyOn(merchantOwnerApi, 'listOffers').mockResolvedValue({
    hasNext: false,
    offers: [
      {
        benefitDescription: '4만원 이상 결제 시, 최대 10% 할인',
        description: 'd',
        endsAt: '2099-08-18T00:00:00Z',
        id: 3,
        placeId: PLACE_ID,
        startsAt: '2020-08-18T00:00:00Z',
        status: 'PUBLISHED',
        title: '여름 맞이 냉짬뽕 무료 이벤트',
      },
    ],
    page: 1,
    totalElements: 1,
  });
}

function renderContainer(overrides: Partial<React.ComponentProps<typeof MerchantMyPageContainer>> = {}) {
  return renderWithProviders(
    <MerchantMyPageContainer
      onBack={jest.fn()}
      onCreateEvent={jest.fn()}
      onEditAddress={jest.fn()}
      onEditBusinessHours={jest.fn()}
      onEditPhoneNumber={jest.fn()}
      onOpenAllReviews={jest.fn()}
      onOpenProfileEdit={jest.fn()}
      onOpenSettings={jest.fn()}
      onOpenVerifiedPlaces={jest.fn()}
      userProfileImageUrl={null}
      username="woo._sm"
      {...overrides}
    />,
  );
}

describe('MerchantMyPageContainer', () => {
  test('서버 데이터를 화면 모델로 옮겨 렌더한다', async () => {
    mockHappyPath();

    await renderContainer();

    expect(await screen.findByText('대성반점')).toBeTruthy();
    expect(screen.getByText('음식점')).toBeTruthy();
    expect(screen.getByText('대구광역시 달성군 구지면 창리로11길 79-3')).toBeTruthy();
    expect(screen.getByText('09:00 ~ 20:00')).toBeTruthy();
    expect(screen.getByText('0507-1418-9977')).toBeTruthy();
    expect(screen.getByText('woo._sm')).toBeTruthy();
    expect(screen.getByText('여름 맞이 냉짬뽕 무료 이벤트')).toBeTruthy();
    expect(screen.getByText('진행중')).toBeTruthy();
    expect(screen.getByText('암소 된장찌개가 맛있어요')).toBeTruthy();
  });

  test('Merchant 프로필 조회가 실패하면 에러와 재시도를 보여준다', async () => {
    jest.spyOn(merchantOwnerApi, 'getProfile').mockRejectedValue(new Error('실패'));

    await renderContainer();

    expect(await screen.findByText('가게 정보를 불러오지 못했어요.')).toBeTruthy();
    expect(screen.getByText('다시 시도')).toBeTruthy();
  });

  test('연결된 장소가 없으면 안내 문구를 보여준다', async () => {
    jest.spyOn(merchantOwnerApi, 'getProfile').mockResolvedValue({
      businessName: '대성반점',
      contactEmail: 'owner@example.com',
      contactPhone: '0507',
      description: null,
      displayName: '대성반점 사장',
      placeIds: [],
      status: 'ACTIVE',
      userId: 1,
    });

    await renderContainer();

    expect(await screen.findByText('아직 연결된 가게가 없어요.')).toBeTruthy();
  });

  test('이벤트 삭제를 누르면 확인 후 close API를 호출한다', async () => {
    mockHappyPath();
    const closeOffer = jest.spyOn(merchantOwnerApi, 'closeOffer').mockResolvedValue({
      benefitDescription: 'b',
      description: 'd',
      endsAt: '2099-08-18T00:00:00Z',
      id: 3,
      placeId: PLACE_ID,
      startsAt: '2020-08-18T00:00:00Z',
      status: 'CLOSED',
      title: '여름 맞이 냉짬뽕 무료 이벤트',
    });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _body, buttons) => {
      const confirm = buttons?.find((button) => button.style === 'destructive');
      confirm?.onPress?.();
    });

    const { user } = await renderContainer();

    await screen.findByText('여름 맞이 냉짬뽕 무료 이벤트');
    await user.press(screen.getByLabelText('이벤트 삭제'));

    await waitFor(() => expect(closeOffer).toHaveBeenCalledWith(3));
    expect(alertSpy).toHaveBeenCalled();
  });
});
