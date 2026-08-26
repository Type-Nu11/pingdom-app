import type { NativeStackScreenProps } from '@react-navigation/native-stack';

declare const routeIdBrand: unique symbol;

export type PlaceId = number & {
  readonly [routeIdBrand]: 'Place';
};
export type CheckInId = number & {
  readonly [routeIdBrand]: 'CheckIn';
};

export const V2_ROUTES = {
  CreateReservation: 'CreateReservation',
  Home: 'Home',
  Map: 'Map',
  PlaceDetail: 'PlaceDetail',
  VisitVerificationPlaces: 'VisitVerificationPlaces',
  VisitVerificationReview: 'VisitVerificationReview',
} as const;

export type V2StackParamList = {
  CreateReservation: {
    category?: string;
    imageUrl?: string;
    placeId: PlaceId;
    placeName?: string;
  };
  Home: undefined;
  Map: undefined;
  PlaceDetail: {
    placeId: PlaceId;
  };
  VisitVerificationPlaces: undefined;
  VisitVerificationReview: {
    checkInId?: CheckInId;
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
