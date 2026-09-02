import * as Location from 'expo-location';

export type CurrentCoordinate = {
  accuracyMeters: number;
  latitude: number;
  longitude: number;
  observedAt: string;
};

export type CurrentLocationOutcome =
  | { status: 'granted'; coordinate: CurrentCoordinate }
  | { status: 'denied'; coordinate: null }
  | { status: 'failed'; coordinate: null };

export async function getCurrentCoordinate(): Promise<CurrentLocationOutcome> {
  try {
    let permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== 'granted' && permission.canAskAgain) {
      permission = await Location.requestForegroundPermissionsAsync();
    }
    if (permission.status !== 'granted') return { status: 'denied', coordinate: null };

    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const accuracyMeters = location.coords.accuracy;
    if (accuracyMeters === null || !Number.isFinite(accuracyMeters) || accuracyMeters < 0) {
      return { status: 'failed', coordinate: null };
    }
    return {
      status: 'granted',
      coordinate: {
        accuracyMeters,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        observedAt: new Date(location.timestamp).toISOString(),
      },
    };
  } catch {
    return { status: 'failed', coordinate: null };
  }
}
