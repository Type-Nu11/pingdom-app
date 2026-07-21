import * as Location from 'expo-location';

import type { Coordinate } from '../model/map.types';
import { resolveCurrentLocation } from './locationWorkflow';

const toCoordinate = (location: Location.LocationObject): Coordinate => ({
  lat: location.coords.latitude,
  lng: location.coords.longitude,
});

export function getCurrentLocation() {
  return resolveCurrentLocation({
    getCoordinate: async () => toCoordinate(await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    })),
    getPermission: async () => {
      const permission = await Location.getForegroundPermissionsAsync();
      return {
        canAskAgain: permission.canAskAgain,
        status: permission.status,
      };
    },
    requestPermission: async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      return {
        canAskAgain: permission.canAskAgain,
        status: permission.status,
      };
    },
  });
}

export async function watchCurrentLocation(
  onCoordinate: (coordinate: Coordinate) => void,
): Promise<Location.LocationSubscription> {
  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 10,
      timeInterval: 5_000,
    },
    (location) => onCoordinate(toCoordinate(location)),
  );
}
