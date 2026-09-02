import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { SettingsDetailId } from '../../features/settings';

declare const routeIdBrand: unique symbol;

export type PlaceId = number & {
  readonly [routeIdBrand]: 'Place';
};
export type CheckInId = number & {
  readonly [routeIdBrand]: 'CheckIn';
};

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
  VisitVerificationSession: {
    placeId: PlaceId;
  };
};

export type V2ScreenProps<RouteName extends keyof V2StackParamList> =
  NativeStackScreenProps<V2StackParamList, RouteName>;

export function parsePlaceId(value: unknown): PlaceId | null {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value > 0 ? value as PlaceId : null;
  }

  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isSafeInteger(parsedValue) ? parsedValue as PlaceId : null;
}

export function parseCheckInId(value: unknown): CheckInId | null {
  const valueAsPlaceId = parsePlaceId(value);
  return valueAsPlaceId as CheckInId | null;
}
