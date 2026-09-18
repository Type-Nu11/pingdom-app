import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { SettingsDetailId } from '../../modules/user/settings';

import type { PlaceId, CheckInId } from '../../modules/place/core';
export { parsePlaceId, parseCheckInId } from '../../modules/place/core';
export type { PlaceId, CheckInId } from '../../modules/place/core';

export const V2_ROUTES = {
  CouponBox: 'CouponBox',
  CouponDetail: 'CouponDetail',
  CreateReservation: 'CreateReservation',
  ReservationBox: 'ReservationBox',
  ReservationDetail: 'ReservationDetail',
  Home: 'Home',
  Map: 'Map',
  MyPage: 'MyPage',
  ProfileEdit: 'ProfileEdit',
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
  ProfileEdit: undefined;
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
