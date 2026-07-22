import type { Coordinate } from '../model/map.types';

export type PermissionSnapshot = {
  canAskAgain: boolean;
  status: 'denied' | 'granted' | 'undetermined';
};

export type LocationOutcome =
  | { status: 'granted'; coordinate: Coordinate; canAskAgain: true }
  | { status: 'denied'; coordinate: null; canAskAgain: boolean }
  | { status: 'failed'; coordinate: null; canAskAgain: true };

type LocationWorkflowDependencies = {
  getPermission: () => Promise<PermissionSnapshot>;
  requestPermission: () => Promise<PermissionSnapshot>;
  getCoordinate: () => Promise<Coordinate>;
};

function isValidCoordinate(coordinate: Coordinate): boolean {
  return Number.isFinite(coordinate.lat)
    && Number.isFinite(coordinate.lng)
    && coordinate.lat >= -90
    && coordinate.lat <= 90
    && coordinate.lng >= -180
    && coordinate.lng <= 180;
}

export async function resolveCurrentLocation({
  getCoordinate,
  getPermission,
  requestPermission,
}: LocationWorkflowDependencies): Promise<LocationOutcome> {
  try {
    let permission = await getPermission();

    if (permission.status !== 'granted' && permission.canAskAgain) {
      permission = await requestPermission();
    }

    if (permission.status !== 'granted') {
      return {
        status: 'denied',
        coordinate: null,
        canAskAgain: permission.canAskAgain,
      };
    }

    const coordinate = await getCoordinate();
    if (!isValidCoordinate(coordinate)) {
      return { status: 'failed', coordinate: null, canAskAgain: true };
    }

    return { status: 'granted', coordinate, canAskAgain: true };
  } catch {
    return { status: 'failed', coordinate: null, canAskAgain: true };
  }
}
