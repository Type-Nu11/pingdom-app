import { foregroundPermission } from '../../../shared/location/foregroundPermission';

export type LocationPermissionState = 'denied' | 'granted' | 'undetermined';

export const locationPermissionService = {
  async getStatus(): Promise<LocationPermissionState> {
    const permission = await foregroundPermission.get();
    return permission.status;
  },
};
