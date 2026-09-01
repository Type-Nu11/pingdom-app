import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import type { Coupon } from '../../v2/features/offers-coupons';

declare const routeIdBrand: unique symbol;

type RouteId<Entity extends string> = number & {
  readonly [routeIdBrand]: Entity;
};

/**
 * Route IDs are positive, safe integers. External values must be converted with
 * the matching parse function before they can be passed to navigation.
 */
export type PlaceId = RouteId<'Place'>;
export type MerchantId = RouteId<'Merchant'>;
export type PostId = RouteId<'Post'>;
export type NotificationId = RouteId<'Notification'>;
export type ReservationId = RouteId<'Reservation'>;
export type CheckInId = RouteId<'CheckIn'>;

export type NotificationNavigationContext = {
  body?: string;
  notificationId?: NotificationId;
  postId?: PostId;
  title?: string;
};

export const ROOT_ROUTES = {
  Auth: 'Auth',
  Main: 'Main',
} as const;

export const AUTH_ROUTES = {
  AuthLanding: 'AuthLanding',
  Login: 'Login',
  Onboarding: 'Onboarding',
  Signup: 'Signup',
} as const;

export const MAIN_ROUTES = {
  ApiCheck: 'ApiCheck',
  CheckIn: 'CheckIn',
  CouponBox: 'CouponBox',
  CouponDetail: 'CouponDetail',
  Map: 'Map',
  Merchant: 'Merchant',
  MyPage: 'MyPage',
  Profile: 'Profile',
  ProfileEdit: 'ProfileEdit',
  VerifiedPlaces: 'VerifiedPlaces',
  CreateReservation: 'CreateReservation',
  ReservationDetail: 'ReservationDetail',
  Settings: 'Settings',
  VisitVerificationPlaces: 'VisitVerificationPlaces',
  VisitVerificationReview: 'VisitVerificationReview',
} as const;

export type AuthStackParamList = {
  AuthLanding: undefined;
  Login: undefined;
  Onboarding: undefined;
  Signup: undefined;
};

export type MainStackParamList = {
  ApiCheck: undefined;
  Map: {
    focusedPlaceId?: PlaceId;
    initialSection?: 'favorites' | 'map' | 'reservations';
    notificationContext?: NotificationNavigationContext;
  } | undefined;
  CheckIn: {
    placeId: PlaceId;
  };
  CouponBox: undefined;
  CouponDetail: {
    coupon: Coupon;
  };
  CreateReservation: {
    category?: string;
    imageUrl?: string;
    placeId: PlaceId;
    placeName?: string;
  };
  MyPage: undefined;
  Profile: undefined;
  ProfileEdit: undefined;
  VerifiedPlaces: undefined;
  ReservationDetail: {
    reservationId: ReservationId;
  };
  Settings: undefined;
  Merchant: {
    merchantId: MerchantId;
  };
  VisitVerificationPlaces: undefined;
  VisitVerificationReview: {
    checkInId?: CheckInId;
    placeId: PlaceId;
  };
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  Main: NavigatorScreenParams<MainStackParamList> | undefined;
};

export type RootScreenProps<RouteName extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, RouteName>;

export type AuthScreenProps<RouteName extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, RouteName>;

export type MainScreenProps<RouteName extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, RouteName>;

export type MainNavigationProp<RouteName extends keyof MainStackParamList> =
  NativeStackNavigationProp<MainStackParamList, RouteName>;

function parsePositiveInteger(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value > 0 ? value : null;
  }

  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isSafeInteger(parsedValue) ? parsedValue : null;
}

export function parsePlaceId(value: unknown): PlaceId | null {
  return parsePositiveInteger(value) as PlaceId | null;
}

export function parseMerchantId(value: unknown): MerchantId | null {
  return parsePositiveInteger(value) as MerchantId | null;
}

export function parsePostId(value: unknown): PostId | null {
  return parsePositiveInteger(value) as PostId | null;
}

export function parseNotificationId(value: unknown): NotificationId | null {
  return parsePositiveInteger(value) as NotificationId | null;
}

export function parseReservationId(value: unknown): ReservationId | null {
  return parsePositiveInteger(value) as ReservationId | null;
}

export function parseCheckInId(value: unknown): CheckInId | null {
  return parsePositiveInteger(value) as CheckInId | null;
}
