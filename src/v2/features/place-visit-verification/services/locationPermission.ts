import * as Location from 'expo-location';

export type LocationPermissionState = 'denied' | 'granted' | 'undetermined';

export const locationPermissionService = {
  async getStatus(): Promise<LocationPermissionState> {
    const permission = await Location.getForegroundPermissionsAsync();
    return permission.status;
  },
};
