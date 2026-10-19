import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { SettingsDetailId } from '../../modules/user/settings';

import type { PlaceId, CheckInId } from '../../modules/place/core';
export { parsePlaceId, parseCheckInId } from '../../modules/place/core';
export type { PlaceId, CheckInId } from '../../modules/place/core';

export const V2_ROUTES = {
  CommunityDetail: 'CommunityDetail',
  CommunityWrite: 'CommunityWrite',
  CommunityEdit: 'CommunityEdit',
  CouponBox: 'CouponBox',
  CouponDetail: 'CouponDetail',
  CreateReservation: 'CreateReservation',
  ReservationBox: 'ReservationBox',
  ReservationDetail: 'ReservationDetail',
  Home: 'Home',
  Map: 'Map',
  MyPage: 'MyPage',
  MyReview: 'MyReview',
  MyReviewEdit: 'MyReviewEdit',
  ProfileEdit: 'ProfileEdit',
  VerifiedPlaces: 'VerifiedPlaces',
  NotificationSettings: 'NotificationSettings',
  PlaceDetail: 'PlaceDetail',
  AccountManagement: 'AccountManagement',
  Settings: 'Settings',
  SettingsDetail: 'SettingsDetail',
  VisitVerificationPlaces: 'VisitVerificationPlaces',
  VisitVerificationReview: 'VisitVerificationReview',
  VisitVerificationSession: 'VisitVerificationSession',
} as const;

export type V2StackParamList = {
  CommunityDetail: {
    postId: number;
  };
  CommunityEdit: { postId: number };
  CommunityWrite: { initialCategoryId?: string } | undefined;
  CouponBox: undefined;
  CouponDetail: {
    couponId: number;
  };
  CreateReservation: {
    category?: string;
    imageUrl?: string;
    placeId: PlaceId;
    placeName?: string;
  };
  ReservationBox: undefined;
  ReservationDetail: {
    reservationId: number;
  };
  Home: undefined;
  Map: undefined;
  MyPage: undefined;
  MyReview: { reviewId: number };
  MyReviewEdit: { reviewId: number };
  ProfileEdit: undefined;
  VerifiedPlaces: undefined;
  AccountManagement: undefined;
  Settings: undefined;
  SettingsDetail: {
    detail: SettingsDetailId;
  };
  NotificationSettings: undefined;
  PlaceDetail: {
    placeId: PlaceId;
  };
  VisitVerificationPlaces: undefined;
  VisitVerificationReview: {
    checkInId?: CheckInId;
    placeId: PlaceId;
  };
  VisitVerificationSession:
    | { mode: 'foreground' }
    | { mode: 'place'; placeId: PlaceId };
};

export type V2ScreenProps<RouteName extends keyof V2StackParamList> =
  NativeStackScreenProps<V2StackParamList, RouteName>;
