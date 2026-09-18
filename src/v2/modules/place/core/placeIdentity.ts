declare const routeIdBrand: unique symbol;

export type PlaceId = number & {
  readonly [routeIdBrand]: 'Place';
};
export type CheckInId = number & {
  readonly [routeIdBrand]: 'CheckIn';
};

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
